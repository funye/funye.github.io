---
title: Nginx基本配置与分发策略
date: 2020-11-23
categories:
 - 基础框架
tags:
 - nginx
---

# Nginx基本配置与分发策略

## 1 为什么叫反向代理？
关于反向代理和正向代理的概念，贴出知乎上面的一个回答，个人觉得还是很形象的。
https://www.zhihu.com/question/24723688 。

>正向代理，被代理对象是客户端，服务端不知道客户端是谁，只知道代理对象.
>
>反向代理，被代理对象是服务端，客户端不知道服务端是谁，只知道代理对象

## 2 Nginx如何处理请求

### 2.1 基于域名的虚拟主机

```
server {
    listen      80;
    server_name example.org www.example.org;
    ...
}

server {
    listen      80;
    server_name example.net www.example.net;
    ...
}

server {
    listen      80;
    server_name example.com www.example.com;
    ...
}
```

如上面的配置，就是使用基于域名的配置，请求会对应到对应server_name的主机上面，如果没有匹配的主机，这个时候nginx会默认把第一当做默认处理主机，当然也可以使用如下配置(default_server)指定默认处理主机：
```
server {
    listen      80 default_server;
    server_name example.net www.example.net;
    ...
}
```

### 2.2 基于域名和IP的虚拟主机

接下来看看不同主机listen on 不同的IP地址
```
server {
    listen      192.168.1.1:80;
    server_name example.org www.example.org;
    ...
}

server {
    listen      192.168.1.1:80;
    server_name example.net www.example.net;
    ...
}

server {
    listen      192.168.1.2:80;
    server_name example.com www.example.com;
    ...
}
```
对于这种情况，Nginx会先检测IP和端口，再去检测server_name是否匹配，如果IP匹配了，但是server_name 没有匹配，就是使用当前匹配的ip+port的default_server ，如果没有配置default_server就是默认使用第一个作为default_server.

**关于server_name的几种形式**
1. 字符串或者IP地址
2. 通配符，*
3. 正则表达式
4. 多个一起组合而成（上例中server_name每个配置了多个name）
5. 一些特殊字符，例如： "","-","--"等

## 3 负载均衡（load balance）

### 3.1 负载均衡算法(Load balancing methods)
使用Nginx作为http负载均衡实现。Nginx负载均衡算法有如下几种：
1. Round-Robin，轮询调度算法，**当配置未指明的时候，默认就是轮询算法**
2. least-connected，下一次链接将被链接到活跃链接最少的机器上
3. ip-hash，利用IP地址哈希进行分配
4. weight-balancing，按照权重分配

需要说明的是，很多时候，weight-balancing都是和least-connected或者ip-hash算法一起使用，在官方文档中，都没有把他算做load balancing methods中的一种。
### 3.2 常见配置示例

1. 最常见的配置,默认轮询算法
```
http {
    upstream myapp1 {
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://myapp1;
        }
    }
}
```
2. 使用least-connected
```nginx
upstream myapp1 {
    least_conn;
    server srv1.example.com;
    server srv2.example.com;
    server srv3.example.com;
}
```

3. 使用ip-hash算法
```
upstream myapp1 {
    ip_hash;
    server srv1.example.com;
    server srv2.example.com;
    server srv3.example.com;
}
```
4. 权重分配
```
upstream myapp1 {
        server srv1.example.com weight=3;
        server srv2.example.com;
        server srv3.example.com;
    }
```
 此种配置，srv1占比3/5,srv2,srv3分别占比 1/5
 
## 4 关于健康检查
 
 简单的服务端示例健康检查，使用server配置上面的fail_timeout配置，设置失败时间，在设置时间内没回应，Nginx就会用不断的起尝试，如果可行就标记服务为live。如果客户端返回错误，Nginx就会标记这个节点为failed，然后避免转发请求到这个节点。
 
 关于健康监测，在后续总结中会有专门的分析使用。

## 5 ngx_http_upstream_module

更多时候我们配置都是这个模块的一些配置，下面简单总结下此模块的配置说明

先提供一个示例：
```
upstream backend {
    server backend1.example.com       weight=5;
    server backend2.example.com:8080;
    server unix:/tmp/backend3;

    server backup1.example.com:8080   backup;
    server backup2.example.com:8080   backup;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```
http模块中比较重要的几个节点

upstream name {....}

在upstream中常见的节点有  server，ip_hash，keepalive，least_conn,least_time

分别介绍下这几个节点

### 5.1 server节点
```
Syntax:	server address [parameters];
Default:	—
Context:	upstream
```
server的上下文为upstream，后面server地址和配置参数，如：`server 192.168.0.100 weight=10 max_fails=3 fail_timeout=5`

分别介绍下可选的几个参数的含义：
1. **weight=number**： 之前说过的，配置主机的权重，配合负载均衡算法
2. **max_conns=number**： 同时生效的链接数上线，默认为0，表示不限制。如果server group不在共享内存中，则次值按每个 worker process 来工作
3. **fail_timeout=number**： 1.在指定时间内超时，任务服务不可达时候尝试超时时间。2.判断服务不可用时间。默认时间为10s.
4. **max_fails=number**：配合fail_timeout，做大的尝试次数，默认值为1，设置为0表示不统计尝试次数。
5. **backup**：设置当前server 为备份机器，放主机器不可达的时候，请求会传递过来
6. **down**：标记当前节点宕机
7. **resolve**：指明解析的IP，要使用resolve ,需要先在http几点下面配置resolver，例如：
```
http {
    resolver 10.0.0.1;

    upstream u {
        zone ...;
        ...
        server example.com resolve;
    }
}
```
8. **route**：设置服务路由名称
9. **service**：启用DNS解析[SRV](https://tools.ietf.org/html/rfc2782)，并设置service名称
10. **slow_start**：设置多久之后，server回复自己的权重值，设置server从不可达到健康之后多久认为是可用。**次配置不能用在upstream 为 hash 或者ip_hash的算法中**。当server Group 中只有一个server的时候，max_fails、 fail_timeout 、slow_start都会被忽略。

### 5.2 hash/ip_hash节点
hash *key* [consistent];  使用key值来做hash负载均衡，一旦添加个删除机器，需要重新做hash，负载后的路径可坑改变

ip_hash; 在upstream 中启用按照IP进行hash的分配策略

### 5.3 keepalive节点

keepalive 激活服务器到upstream的缓存，设置上限的话，设置链接缓存的最大数量，如果超出数量，最少使用的链接就会被关闭。

例如：
```
upstream memcached_backend {
    server 127.0.0.1:11211;
    server 10.0.0.2:11211;

    keepalive 32;
}
```

### 5.4 least_conn/least_time节点

least_conn: 使用least_conn 的负载均衡方式,找到链接最少的机器处理，并且结合权重来处理，如果有多台候选机器的话，会接着使用轮询的方式。

least_time: 找到平均响应时间最少并且连接数最少的机器，并结合权重，如何有多台候选机器的话，会接着使用轮询的方式。

