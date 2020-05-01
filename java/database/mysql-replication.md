# MySQL主从同步

## 1 MySQL的安装

关于MySQL的安装，可以在官网搜索教程或者在网上查找教程，也可以参考 [Mysql 8.0.12解压版安装](https://blog.csdn.net/wsdc0521/article/details/82864901) 

具体配置就不一一介绍了。基本按照上面的链接可以搞定。如果不行的话，就是用户权限或者目录权限的一些问题，调整下即可。

## 2 MySQl主从同步实践

MySQL复制有两种方法：
- 传统方式：基于主库的bin-log将日志事件和事件位置复制到从库，从库再加以 应用来达到主从同步的目的
- Gtid方式：global transaction identifiers是基于事务来复制数据，因此也就不依赖日志文件位置，同时又能更好的保证主从库数据一致性

MySQL复制有多种类型：
- 异步复制：一个主库，一个或多个从库，数据异步同步到从库
- 同步复制：在MySQL Cluster中特有的复制方式
- 半同步复制：在异步复制的基础上，确保任何一个主库上的事务在提交之前至 少有一个从库已经收到该事务并日志记录下来
- 延迟复制：在异步复制的基础上，人为设定主库和从库的数据同步延迟时间，即保证数据延迟至少是这个参数

复制的工作原理是数据库修改事件记录到bin log中并传递到slave，然后slave在本地还原的过程。而事件记录到bin log的格式会有所不同。

MySQL复制有三种核心格式
- 基于语句的复制(statement based replication)：基于主库将SQL语句写入到 bin log中完成复制
- 基于行数据的复制(row based replication)：基于主库将每一个行数据变化的信息作为事件写入到bin log中完成日志
- 混合复制(mixed based replication)：上述两者的结合。默认情况下优先使用基于语句的复制，只有当部分语句如果基于语句复制不安全的情况下才会自动切换为基于行数据的复制

以下binlog方式的主从同步实战

### 2.1 主从同步配置

#### 2.1.1 配置方式1

**mysql-master /etc/my.cnf 的配置**

```text
# mysql主节点编号
[mysqld] 
server-id = 1 #Mysql服务的唯一编号 每个mysql服务Id需唯一
log-bin=mysql-bin # logbin的名字
binlog-do-db=test01 #需要同步的数据库的名字，多个时候重复此配置
binlog-do-db=test02
#binlog-ignore-db=test03 #不需要同步的数据库的名字，多个时候重复此配置
log-slave-updates=1 # log更新间隔
slave-skip-errors=1 # 是跳过错误，继续执行复制操作(可选)
```

**mysql-slave /etc/my.cnf 的配置**
```text
[mysqld] 
#Mysql服务的唯一编号 每个mysql服务Id需唯一
server-id = 2
# read_only=1只读模式，可以限定普通用户进行数据修改的操作，但不会限定具有super权限的用户（如超级管理员root用户）的数据修改操作。
# 如果想保证super用户也不能写操作，就可以就需要执行给所有的表加读锁的命令 “flush tables with read lock;”
read_only = 1
```

#### 2.1.2 配置方式2

**mysql-master /etc/my.cnf 的配置**

```text
[mysqld] 
#Mysql服务的唯一编号 每个mysql服务Id需唯一
server-id = 1
log-bin=mysql-bin # logbin的名字
```

**mysql-slave /etc/my.cnf 的配置**
```text
[mysqld] 
#Mysql服务的唯一编号 每个mysql服务Id需唯一
server-id = 2
# read_only=1只读模式，可以限定普通用户进行数据修改的操作，但不会限定具有super权限的用户（如超级管理员root用户）的数据修改操作。
# 如果想保证super用户也不能写操作，就可以就需要执行给所有的表加读锁的命令 “flush tables with read lock;”
read_only = 1
replicate-do-db=test01 #需要复制的数据库名，如果复制多个数据库，重复设置这个选项即可
replicate-ignore-db=test03 #需要复制的数据库名，如果复制多个数据库，重复设置这个选项即可
```
### 2.2 启动主从同步

**1. 创建同步账号**

在从库创建同步账号并授权
```text
mysql>CREATE USER 'slave'@'%' IDENTIFIED BY '123456';
mysql>GRANT REPLICATION SLAVE ON *.* TO 'slave'@'%';
mysql>FLUSH PRIVILEGES;
```

**2. 查看 master同步状态**

查看master同步状态，记录结果中的file文件名和Position值，在从库开启同步的设置时候需要使用
```text
# 查看主节点状态
mysql>show master status;
+------------------+----------+--------------+------------------+-------------------+
| File             | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+------------------+----------+--------------+------------------+-------------------+
| mysql-bin.000001 |     3693 |              |                  |                   |
+------------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)
```

**3. 开启slave同步**

在从库上进行如下操作开启同步
```text
# 停止正在进行的slave(如果有)
mysql>stop slave;
# 需要主机名，上面步骤的账户密码以及日志文件名字和位置(请根据实际情况自行修改)
mysql>change master to master_host='192.168.109.129', master_user='slave', master_password='123456', 
\ master_log_file='mysql-bin.000001', master_log_pos=3693;
# 启动
mysql>start slave;
# 查看状态验证是否成功
mysql>show slave status\G;
*************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 192.168.109.128
                  Master_User: slave
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000001
          Read_Master_Log_Pos: 3693
               Relay_Log_File: localhost-relay-bin.000005
                Relay_Log_Pos: 624
        Relay_Master_Log_File: mysql-bin.000001
             Slave_IO_Running: Yes # 网络OK
            Slave_SQL_Running: Yes # SQL同步OK
              Replicate_Do_DB: test_rp
                ......其他就不复制了.....
1 row in set (0.00 sec)
```

>***注意：***
>如果遇到Slave_IO_Running/Slave_SQL_Running 为NO 的情况，一般原因可能有：
>- 1：机器网络不通
>- 2：配置项写错，例如ip，密码等
>- 3：防火墙问题
>- 4：my.cnf的server-id或者 auto.cnf里面的server-uuid 重复


### 2.3 主从同步的异常处理

```text
#在Slave上查看 
mysql> show slave status\G 
Slave_IO_Running: Yes 
Slave_SQL_Running: No 
#可见是Slave不同步 
```

针对这类同步异常的情况，一般有以下两种方式解决
- 方式1：跳过错误，继续执行后续同步
- 方式2：dump主库数据，恢复到从库后，重新开始同步

**方式1：** 适合于主从数据相差不大，数据一致性要求不是特别严格的情况，允许跳过部分错误，继续进行。操作如下：
```text
## 进入从库的mysql
mysql>stop slave; 
mysql>et global sql_slave_skip_counter =1; #表示跳过一步错误，后面的数字可变 
mysql>start slave; 
mysql>show slave status\G; #查看
Slave_IO_Running: Yes 
Slave_SQL_Running: Yes 
```
出现以上结果，表示主从同步状态正常了。。。

**方式2：** 适合主从数据相差比较大，数据一致性要求比较高。
实现思路就是先把主库写停止，然后dump数据，在从库恢复，恢复之后再重新开启主从同步

操作如下：
```text
1.先进入主库，进行锁表，防止数据写入 
使用命令： 
mysql> flush tables with read lock; 
注意：该处是锁定为只读状态，语句不区分大小写 

2.进行数据备份 
#把数据备份到mysql.bak.sql文件 
[root@server01 mysql]#mysqldump -uroot -p -hlocalhost -D dasenamexxx > mysql.bak.sql 
这里注意一点：数据库备份一定要定期进行，可以用shell脚本或者python脚本，都比较方便，确保数据万无一失 

3.查看master 状态 
mysql> show master status; 
+-------------------+----------+--------------+-------------------------------+ 
| File | Position | Binlog_Do_DB | Binlog_Ignore_DB | 
+-------------------+----------+--------------+-------------------------------+ 
| mysqld-bin.000001 | 3260 | |  | 
+-------------------+----------+--------------+-------------------------------+ 
1 row in set (0.00 sec) 

4.把mysql备份文件传到从库机器，进行数据恢复 
#使用scp命令 
[root@server01 mysql]# scp mysql.bak.sql root@192.168.109.129:/tmp/ 

5.停止从库的状态 
mysql> stop slave; 

6.然后到从库执行mysql命令，导入数据备份 
mysql> source /tmp/mysql.bak.sql; 

7.设置从库同步，注意该处的同步点，就是主库show master status信息里的| File| Position两项 
mysql>change master to master_host = '192.168.109.129', master_user = 'slave', master_port=3306, master_password='123456', 
\ master_log_file = 'mysqld-bin.000001', master_log_pos=3260; 

8.重新开启从同步 
mysql> stop slave; 

9.查看同步状态 
mysql> show slave status\G; 
Slave_IO_Running: Yes 
Slave_SQL_Running: Yes 

```

[Mysql主从（主从不同步解决办法，常见问题及解决办法，在线对mysql做主从复制）](https://blog.51cto.com/13407306/2067333)


## 3 MySQl主从同步原理

<img src="java/assets/mysql/mysql-master-slave.jpg" width="800"/>

1. 在master机器上的操作：
    
    当master上的数据发生变化时，该事件变化会按照顺序写入bin-log中。当slave链接到master的时候，master机器会为slave开启binlog dump线程。
    当master的binlog发生变化的时候，bin-log dump线程会通知slave，并将相应的binlog内容发送给slave。

2. 在slave机器上操作：

    当主从同步开启的时候，slave上会创建两个线程：I\O线程。该线程连接到master机器，master机器上的binlog dump 线程会将binlog的内容发送给该I\O线程。
    该I/O线程接收到binlog内容后，再将内容写入到本地的relay log；sql线程。该线程读取到I/O线程写入的ralay log。并且根据relay log 的内容对slave数据库做相应的操作。
    
--- 

参考链接
- [Mysql 8.0.12解压版安装](https://blog.csdn.net/wsdc0521/article/details/82864901)
- [Mysql主从同步实战(一)【知其然】](https://juejin.im/post/5c9d8109f265da612f1bb019)
- [Mysql主从（主从不同步解决办法，常见问题及解决办法，在线对mysql做主从复制）](https://blog.51cto.com/13407306/2067333)
- [线上MYSQL同步报错故障处理方法总结(必看篇)](https://www.jb51.net/article/109107.htm)
- [深度探索MySQL主从复制原理](https://zhuanlan.zhihu.com/p/50597960)
- [Mysql主从基本原理，主要形式以及主从同步延迟原理 (读写分离)导致主库从库数据不一致问题的及解决方案](https://blog.csdn.net/helloxiaozhe/article/details/79548186)