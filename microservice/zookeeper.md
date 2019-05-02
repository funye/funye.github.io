# 1 zookeeper网站

[Zookeeper中文网站](http://zookeeper.majunwei.com/document/3.4.6/DeveloperProgrammerGuide.html)

[Zookeeepr英文官网](https://zookeeper.apache.org/doc/r3.4.6/zookeeperProgrammers.html#ch_gotchas)

以上是zookeeper的学习网站，可以先看中文快速了解基础的概念，再看英文原版，从而保证理解上面经量少的偏差

# 2 zookeeper的安装和使用入门

## 2.1 zookeeper安装与启动

**1 安装启动**

在官方网站下载安装包之后，解压到喜欢的文件，在conf目录下创建一个zoo.cfg 文件作为配置文件,内容如下
```
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
```

**tickTime:** 在zookeeper体系中，以毫秒的为单位的基础时间单位值。用作心跳检测和session过期（两倍的tickTime时间）

**dataDir:** 存储目录

**clientPort:** 客户端连接时使用的端口

配置完成之后。执行安装目录下bin目录里面的 `zkServer.sh`, 例如：` /bin/zkServer.sh start ` ,启动服务

**2 客户端连接**

执行安装目录下的zkCli.sh 脚本使用命令行连接，`bin/zkCli.sh -server 127.0.0.1:2181`

连接进入之后，使用help可以看到一些操作命令，例如

```
`ls /` 查看根目录下面的节点
`create` 创建节点，例如 create /zk_test my_test_data ,在根目录下创建zk_test
`set` 设置节点的值，例如 set /zk_test my_new_test_data
`get` 获取节点的值， 例如 get /zk_test 
`delete` 删除节点，例如 delete /zk_testls
```

*在zookeeper里面，所有的节点都是一个路径，例如在zk_test下面创建一个test节点，就需要知名路径，create /zk_test/test test_data,所有操作中path 参数从根目录开始*  

## 2.2 zookeeper主从（replicated zookeeper）

主从模式配置和单点模式基本很相似，只是多加入了几个配置

```
tickTime=2000
dataDir=/var/lib/zookeeper
clientPort=2181
initLimit=5
syncLimit=2
server.1=zoo1:2888:3888
server.2=zoo2:2888:3888
server.3=zoo3:2888:3888
```
其中

**initLimit**: 设置参与的机器（quorum）连接到leader的超时时间，单位为tickTime设置的时间，如上配置 这个时间=2000*5=10000ms=10s

**syncLimit**: 设置从机器到leader的延时时间上限

**server.x** 代表服务器的，其中有一个是master，建议最少使用三台以上服务，zookeeper和redis有点像，使用选举的策略，所以，最好是奇数的服务器数量。 server name后面的两个端口，前面的端口用来连接follower和leader，当新的leader选出来之后，follower就通过这个端口和leader建立连接。后面的端口是作为leader选举时候的端口 

# 3 zookeeper

了解zookeeper的时候，四个最重要的元素一定要知道 ，数据结构(node/Sate)，Session, Watcher, ACL，从这开始，依次来了解这些东西

## 3.1 zookeeper的数据结构
zookeeper是一个分成的命名空间(hierarchal name space) ,非常像一个分布式文件系统。命令空间的每个节点可以有自己的数据和子节点。zookeeper的子节点称之为znode,znode维护了一个stat的数据结构

### 3.1.1 zookeeper计时

Zookeeper通过多种方式追踪计时：

**Zxid**

每个Zookeeper状态的变化都以zxid(事务ID)的形式接收到标记。这个暴露了Zookeeper所有变化的总排序。每个变化都会有一个zxid，并且如果zxid1早于zxid2则zxid1一定小于zxid2。

**版本号**

节点的每个变化都会引起那个节点的版本号的其中之一增加。这三个版本号是version(znode的数据变化版本号),cversion(子目录的变化版本号)，和aversion(访问控制列表的变化版本号)。

**Ticks**

当使用多服务器的Zookeeper时，服务器使用ticks定义事件的时间，如状态上传，会话超时，同事之间的连接超时等等。tick次数只是通过最小的会话超时间接的暴露；如果一个客户端请求会话超时小于最小的会话超时，服务器就会告诉客户端会话超时实际上是最低会话超时时间。

**Real time**

Zookeeper不使用实时或时钟时间，除了将时间戳加在znode创建和更新的stat结构上。

### 3.1.2 stat数据结构

执行 get命令查看一个节点的时候就可以看到，例如 get /zk_test
```
my_test_data
cZxid = 0x8
ctime = Fri Jun 23 11:05:38 CST 2017
mZxid = 0x8
mtime = Fri Jun 23 11:05:38 CST 2017
pZxid = 0xa
cversion = 2
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 12
numChildren = 0
```

my_test_data 使我们存放的数据


## 3.2 zookeeper session

主要是控制会话状态

下面是官网提供的状态转换图：
![zookeeper sessopn状体图](http://upload-images.jianshu.io/upload_images/4752922-f457dc7a6c9de5d2.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 3.3 zookeeper watcher(重点)

### 3.3.1 什么事watcher
zookeeper的读操作，- getData(), getChildren(), and exists() ，都可以设置watcher. zookeeper中关于watch的定义是： **当设置了watch的节点的数据发生了变化的时候，会向客户端发送一次（one-time trigger）watch的事件。（a watch event is one-time trigger, sent to the client that set the watch, which occurs when the data for which the watch was set changes）**。

针对这个定义，有下面三个方面的结论：

> 1. **一次触发**：当数据有了变化时将向客户端发送一个watch事件。例如，如果一个客户端用getData("/znode1",true)并且过一会之后/znode1的数据改变或删除了，客户端将获得一个/znode1的watch事件。如果/znode1再次改变，将不会发送watch事件除非设置了新watch。
>2. **发往客户端**:  这意味着事件发往客户端，但是可能在成功之前没到客户端。Watches是异步发往watchers。Zookeeper提供一个顺序保证：在看到watch事件之前绝不会看到变化。网络延迟或其他因素可能引起客户端看到watches并在不同时间返回code。关键点是不同客户端看到的是一致性的顺序。
>3. **为数据设置watch**:  一个节点可以有不同方式改变。它帮助Zookeeper维护两个watches：data watches和child watches。getData()和exists()设置data watches。getChildren()设置child watches。两者任选其一，它可以帮助watches根据类型返回。getData()和exists()返回关于节点数据的信息，然而getChildren()返回children列表。因此，setData()将会触发znode设置的data watches。一个成功的create()将会触发一个datawatches和一个父节点的child watch。一个成功的delete()将触发一个data watch和一个child watch

**watch事件类型列表及其触发方法**
- Created event:
Enabled with a call to exists.
- Deleted event:
Enabled with a call to exists, getData, and getChildren.
- Changed event:
Enabled with a call to exists and getData.
- Child event:
Enabled with a call to getChildren.

### 3.3.2 watch作用

zookeeper设置了watch,只要作用是什么呢
1. Watches和其他事件、watches和异步恢复都是有序的。Zookeeper客户端保证每件事都是有序派发
2. 当添加的watch的节点改变的了数据的时候，客户端会先看到watch事件，之后才看到新数据
3. watch事件的顺序是和服务的数据改变的顺序是一致的

## 3.4 zookeeper ACL访问控制

acl主要是对zookeeper的node做访问权限的控制，但是，这个访问权限是不递归到子元素的，也就是说，给node /test_node 设置的权限只会影响 /test_node ，不会影响他的子节点。

ACLs由对组成(scheme:expression,permissions)。expression的格式是针对scheme。

### 3.4.1 ACL 默认的权限如下：

- CREATE: you can create a child node (可以创建 **子节点**)
- READ: you can get data from a node and list its children.(可以查看节点数据和列出他的子节点)
- WRITE: you can set data for a node (可以向节点设置数据)
- DELETE: you can delete a child node (可以删除 **子节点**)
- ADMIN: you can set permissions (可以设置节点的权限)

在命令行创建的时候，直接使用cdrwa分别代表 create,delete,read,write,admin权限

### 3.4.2 ACL 内置的scheme

Zookeeper有下面的schemes：

world：有单独的id，anyone,代表任何人, 例如节点得默认权限 world:anyone:cdrwa
auth:不适用任何id，代表任何授权的用户。
digest：使用username;password字符串生成MD5哈希作为ACL ID身份。通过发送username:password明文授权。在ACL里使用时expression将会是username:base64编码的SHA1 password摘要。
ip:使用客户端IP作为ACL ID身份。

设置权限之后，要想访问，就要获得具体权限。

示例：

1. 命令行执行就会创建一个节点 /test_node 需要的用户名密码(fun:123123)登录
```
create /test_node test_acl_data auth:fun:123123:cdrwa
```
2. 查看权限 getAcl 
```
[zk: 127.0.0.1:2181(CONNECTED) 5] getAcl /test_node
'digest,'fun:lpYnLtsL5UprZTlY9EGtvYhMZU0=
: cdrwa
```
上面执行效果发现，auth 带上id(fun:123123)的时候，会得到效果就是digest的权限设置scheme,在没有密码的情况下执行例如 get 会提示权限不够

3. 授权之后，操作node
使用 addauth 方式授权
```
addauth digest fun:123123
```
之后操作就没有问题了


**关于zookeeper的ACL的总结：**

1. **acl的权限设置是对设置的节点有作用，对子节点没有递归作用效果**
2. **授权和scheme有关系，用什么scheme授权，添加授权(addauth)就用什么scheme**
3. **addauth授权的生命周期同session周期一致**

# 4 zookeeper 一致性保证