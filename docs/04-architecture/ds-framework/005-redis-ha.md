# 分布式缓存：高可用的redis服务


## redis高可用性介绍

前面说到使用主从备份的方式可以保证数据的安全性，当主节点挂了的时候，从节点可以顶上作为主节点。但是需要手动去切换，这个过程需要认为干预。那么有没有一种由程序自己监控主节点状态并在主节点挂了的时候自己选择一个从节点的方案呢？答案肯定是有的。redis sentinel(哨兵)。

从宏观上讲，redis sentinel 可以做到的如下几点：
1. Monitoring 监控，可以监控master和slaves实例是不是按照预期的执行
2. Notification 通知，当被监控的redis的实例出现问题。能够通知系统管理员或者其他应用程序
3. Automatic failover 自动灾难迁移，当master出现故障的时候，sentinel会开启一个选举流程，选择一个合适slave升级为master
4. Configuration provider 帮客户端发现redis服务。客户端连接sentinel，sentinel拿到当前redis master address 给客户端提供服务。当redis master 挂了的时候，找到一个新的service address。


sentinel具有分布式的特性，他被设计成多个Sentinel 进行一起协同工作。这样左右两个有点：
1. 故障检测的时候，多个进程认为出现故障的时候才认为出现故障。避免wupan
2. 多个sentinel进程一起工作，当有部分sentinel死掉的时候，系统仍然能够继续工作。sentinel不一定要求所有的sentinel一起工作

## 启动和配置

在主从配置的时候把slave配置bind ，因为他有可能成为master。

sentinel服务是和redis服务一起发布。启动脚本位置和redis的启动位置一样 `redis-sentinel` 脚本就是的。启动方式如下：
```
## pwd=redis-3.2.8
## 方式一
src/redis-sentinel sentinel.conf

## 方式二
src/redis-server sentinel.conf --sentinel
```
两种启动方式是一摸一样的。**redis服务和sentinel一起使用的使用的时候，redis启动和sentinel启动都需要指明配置文件。因为在sentinel进行故障迁移切换master的时候会修改原来的master和slave的redis和sentinel的配置**。

sentinel的配置，redis提供个默认的配置sentinel.conf。 配置项如下：
```
protected-mode no # 设置成no,没有访问限制
port 5000
sentinel monitor mymaster 192.168.206.200 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
```
官方说法是，使用sentinel的时候，最好3个以上的sentinel实例（instance）较好，因为他的选举策略要投票过半。

上面的配置，每个实例使用相同的配置即可，如果sentinel有在同一个机器上，需要修改下端口保持不同，避免端口占用的问题

现在来看这个配置各项说明

1. sentinel monitor mymaster 192.168.206.200 6379 2 他的配置 规则是
```
sentinel monitor <master-group-name> <ip> <port> <quorum>
```
**master-group-name**: master的名称，唯一标志，ip, port redis服务 master的ip和端口
**quorum**： 要确定master挂了，知道要多少个sentinel实例投票

2. 选项配置
```
sentinel <option_name> <master_name> <option_value>
```
**down-after-milliseconds**：在master没有回应后多久（多少毫秒）认为master挂掉
**failover-timeout**：故障迁移进程多久超时，设置时间内没有完成认为超时
**parallel-syncs**：故障迁移的时候，最多同时几台和master数据同步。数字越小，故障迁移越耗时，但是如果slave配置了master迁移继续使用old data提供服务的话。建议配置此项为1。


## 部署架构

在redis得官方文档中，建议不用使用只有两个sentinel的实例的方式部署，可用不高，建议知道要3个实例。示例的部署方案如下：

示例中 M1..Mn代表master,R1...R2代表slave , S1....Sn代表sentinel实例,C1.....Cn clients

1. redis实力和sentinel在同一台机器，1master ,2slave模式

```
             +----+
             | M1 |
             | S1 |
             +----+
                 |
    +----+    |       +----+
    | R2 |----+----   | R3 |
    | S2 |            | S3 |
    +----+            +----+

Configuration: quorum = 2
```

2. 1 master,1 slave, sentinel放在客户端这边 
```
            +----+         +----+
            | M1 |----+----| R1 |
            |    |    |    |    |
            +----+    |    +----+
                      |
         +------------+------------+
         |            |            |
         |            |            |
      +----+        +----+      +----+
      | C1 |        | C2 |      | C3 |
      | S1 |        | S2 |      | S3 |
      +----+        +----+      +----+

      Configuration: quorum = 2
```

3. 1 master ,1 slave 
```
           +----+         +----+
            | M1 |----+----| R1 |
            | S1 |    |    | S2 |
            +----+    |    +----+
                      |
               +------+-----+
               |            |  
               |            |
            +----+        +----+
            | C1 |        | C2 |
            | S3 |        | S4 |
            +----+        +----+

      Configuration: quorum = 3
```

## 高级概念

大部分概念在文章开头提到的中英文文档中都有介绍。这里简单说下几个最基本的

### 主观下线和客观下线

1. 主观下线（Subjectively Down， 简称 SDOWN）指的是单个 Sentinel 实例对服务器做出的下线判断。
2. 客观下线（Objectively Down， 简称 ODOWN）指的是多个 Sentinel 实例在对同一个服务器做出 SDOWN 判断， 并且通过 SENTINEL is-master-down-by-addr 命令互相交流之后， 得出的服务器下线判断。 （一个 Sentinel 可以通过向另一个 Sentinel 发送 SENTINEL is-master-down-by-addr 命令来询问对方是否认为给定的服务器已下线。）
如果一个服务器没有在 master-down-after-milliseconds 选项所指定的时间内， 对向它发送 PING 命令的 Sentinel 返回一个有效回复（valid reply）， 那么 Sentinel 就会将这个服务器标记为主观下线。

客观下线条件只适用于主服务器

### 每个 Sentinel 都需要定期执行的任务

>1. 每个 Sentinel 以每秒钟一次的频率向它所知的主服务器、从服务器以及其他 Sentinel 实例发送一个 PING 命令。
>2. 如果一个实例（instance）距离最后一次有效回复 PING 命令的时间超过 down-after-milliseconds 选项所指定的值， 那么这个实例会被 Sentinel 标记为主观下线。 一个有效回复可以是： +PONG 、 -LOADING 或者 -MASTERDOWN 。
>3. 如果一个主服务器被标记为主观下线， 那么正在监视这个主服务器的所有 Sentinel 要以每秒一次的频率确认主服务器的确进入了主观下线状态。
>4. 如果一个主服务器被标记为主观下线， 并且有足够数量的 Sentinel （至少要达到配置文件指定的数量）在指定的时间范围内同意这一判断， 那么这个主服务器被标记为客观下线。
>5. 在一般情况下， 每个 Sentinel 会以每 10 秒一次的频率向它已知的所有主服务器和从服务器发送 INFO 命令。 当一个主服务器被 Sentinel 标记为客观下线时， Sentinel 向下线主服务器的所有从服务器发送 INFO 命令的频率会从 10 秒一次改为每秒一次。
>6. 当没有足够数量的 Sentinel 同意主服务器已经下线， 主服务器的客观下线状态就会被移除。 当主服务器重新向 Sentinel 的 PING 命令返回有效回复时， 主服务器的主管下线状态就会被移除。

### 自动发现sentinel和slave

sentinel可以自动的发现其他的sentinel服务和slave节点。具体概念，官网有非常详细的解释

## 代码实现 Jedis示例

部署架构如上面提到的第一种方式，当前环境：

192.168.206.200 redis slave1,sentinel1
192.168.206.201 redis master,sentinel2
192.168.206.202 redis slave2,sentinel3

redis.conf 大部分使用默认配置，列出几个重要的配置
```conf
bind 192.168.206.200 # 跟据master,slave对应修改
protected-mode yes
slave-serve-stale-data yes
slave-read-only yes
slave-priority 100
min-slaves-to-write 1
min-slaves-max-lag 10

appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

#slaveof 192.168.206.201 6379 在slave节点中才配置。master中不配置这个
```

sentinel.conf 三个实例一样的配置
```console
protected-mode no 
port 26379
sentinel monitor mymaster 192.168.206.201 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1

```

redis客户端配置情况
```java
package com.fun.cache.redis;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisSentinelPool;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by fun
 *
 * @date 2017/5/18.
 */
public class SentinelDemo {

    public static void main(String[] args) throws Exception {

        Set<String> sentinels = new HashSet<String>();
        sentinels.add("192.168.206.200:26379");
        sentinels.add("192.168.206.201:26379");
        sentinels.add("192.168.206.202:26379");
        JedisSentinelPool pool = new JedisSentinelPool("mymaster", sentinels);

        while(true) {
            System.out.println("press enter to continue");
            System.in.read();

            Jedis jedis = pool.getResource();
            System.out.println(pool.getCurrentHostMaster());
            String name = jedis.get("name");
            System.out.println("redis get key name="+name);
            jedis.close();
        }

    }
}

// output
/*
按下第一次enter的时候
press enter to continue
192.168.206.201:6379
redis get key name=fun

kill -9 杀掉master 后台选举，产生新的master 再次按下enter的时候
192.168.206.202:6379
redis get key name=fun
press enter to continue

*/
```

查看sentinel 的日志情况 ，可以看到切换master的过程。
```console
4440:X 17 May 13:51:18.774 # +vote-for-leader 86a01849eb3e61289300a93a12855b6483088730 11
4440:X 17 May 13:51:19.793 # +odown master mymaster 192.168.206.201 6379 #quorum 3/2
4440:X 17 May 13:51:19.793 # Next failover delay: I will not start a failover before Wed May 17 13:57:19 2017
4440:X 17 May 13:51:19.859 # +config-update-from sentinel 86a01849eb3e61289300a93a12855b6483088730 192.168.206.200 26379 @ mymaster 192.168.206.201 6379
4440:X 17 May 13:51:19.859 # +switch-master mymaster 192.168.206.201 6379 192.168.206.202 6379
4440:X 17 May 13:51:19.859 * +slave slave 192.168.206.200:6379 192.168.206.200 6379 @ mymaster 192.168.206.202 6379
4440:X 17 May 13:51:19.860 * +slave slave 192.168.206.201:6379 192.168.206.201 6379 @ mymaster 192.168.206.202 6379
```

## 问题延伸

在实际生产中，如果业务量比较大的情况，一台redis实例作为缓存很有可能回出现不够使用的情况，这个时候就需要做集群方式，但是redis的官方的说法是集群模式目前还处在验证阶段，没有statble的版本出现。

大多时候我们都是使用sharding的方式的时候。Jedis中有`ShardedJedisPool` 来管理链接。但是如果我们对分片方式也做主从的话。加入sentinel之后。就要使用JedisSentinelPool方式管理。不难发现，这两种只能有一种存在。那Jedis如果做到分片情况下也能使用sentinel呢 ？ 

针对项目的问题，github上面有人开发了一个 [ShardedJedisSentinelPool](https://github.com/warmbreeze/sharded-jedis-sentinel-pool) 可以用来处理这个问题。


---

参考资料：
- [redis sentinel 官方文档](https://redis.io/topics/sentinel)
- [redis sentinel 中文文档](http://www.redis.cn/topics/sentinel.html)

{{comment}}