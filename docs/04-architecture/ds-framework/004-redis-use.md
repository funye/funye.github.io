---
title: 分布式组件：Redis使用场景与用法
date: 2021-02-02
categories:
 - 架构&分布式
tags:
 - 缓存
 - Redis
---

# 分布式缓存：Redis使用场景与用法



## string类型的使用

这是最简单的类型，就是普通的 set 和 get，做简单的 KV 缓存。

```bash
set college szu
```



## list类型的使用

Lists 是有序列表，这个可以玩儿出很多花样。

比如可以通过 list 存储一些列表型的数据结构，类似粉丝列表、文章的评论列表之类的东西。

比如可以通过 lrange 命令，读取某个闭区间内的元素，可以基于 list 实现分页查询，这个是很棒的一个功能，基于 Redis 实现简单的高性能分页，可以做类似微博那种下拉不断分页的东西，性能高，就一页一页走。

```bash
# 0开始位置，-1结束位置，结束位置为-1时，表示列表的最后一个位置，即查看所有。
lrange mylist 0 -1
```

比如可以搞个简单的消息队列，从 list 头怼进去，从 list 尾巴那里弄出来。

```bash
lpush mylist 1
lpush mylist 2
lpush mylist 3 4 5

# 1
rpop mylist
```



## hash类型的使用

这个是类似 map 的一种结构，这个一般就是可以将结构化的数据，比如一个对象（前提是**这个对象没嵌套其他的对象**）给缓存在 Redis 里，然后每次读写缓存的时候，可以就操作 hash 里的**某个字段**。

```bash
hset person name bingo
hset person age 20
hset person id 1
hget person name
```



```json
(person = {
  "name": "bingo",
  "age": 20,
  "id": 1
})Copy to clipboardErrorCopied
```



## set类型的使用

Sets 是无序集合，自动去重。

直接基于 set 将系统里需要去重的数据扔进去，自动就给去重了，如果你需要对一些数据进行快速的全局去重，你当然也可以基于 jvm 内存里的 HashSet 进行去重，但是如果你的某个系统部署在多台机器上呢？得基于 Redis 进行全局的 set 去重。

可以基于 set 玩儿交集、并集、差集的操作，比如交集吧，可以把两个人的粉丝列表整一个交集，看看俩人的共同好友是谁？对吧。

把两个大 V 的粉丝都放在两个 set 中，对两个 set 做交集。

```bash
#-------操作一个set-------
# 添加元素
sadd mySet 1

# 查看全部元素
smembers mySet

# 判断是否包含某个值
sismember mySet 3

# 删除某个/些元素
srem mySet 1
srem mySet 2 4

# 查看元素个数
scard mySet

# 随机删除一个元素
spop mySet

#-------操作多个set-------
# 将一个set的元素移动到另外一个set
smove yourSet mySet 2

# 求两set的交集
sinter yourSet mySet

# 求两set的并集
sunion yourSet mySet

# 求在yourSet中而不在mySet中的元素
sdiff yourSet mySet
```



## sorted set类型的使用

Sorted Sets 是排序的 set，去重但可以排序，写进去的时候给一个分数，自动根据分数排序。

```bash
zadd board 85 zhangsan
zadd board 72 lisi
zadd board 96 wangwu
zadd board 63 zhaoliu

# 获取排名前三的用户（默认是升序，所以需要 rev 改为降序）
zrevrange board 0 3

# 获取某用户的排名
zrank board zhaoliu
```



## bitmap的使用

### bitmap介绍

BitMap 原本的含义是用一个比特位来映射某个元素的状态。由于一个比特位只能表示 0 和 1 两种状态，所以 BitMap 能映射的状态有限，但是使用比特位的优势是能大量的节省内存空间。

在 Redis 中，可以把 Bitmaps 想象成一个以比特位为单位的数组，数组的每个单元只能存储0和1，数组的下标在 Bitmaps 中叫做偏移量

**Redis 其实只支持 5 种数据类型，并没有 BitMap 这种类型，BitMap 底层是基于 Redis 的字符串类型实现的。**

假如 BitMap 偏移量的最大值是 OFFSET_MAX，那么它底层占用的空间就是：

```
(OFFSET_MAX/8)+1 = 占用字节数
```

### 基本操作命令

#### SETBIT 
`SETBIT key offset value`

对 `key` 所储存的字符串值，设置或清除指定偏移量上的位(bit)。
位的设置或清除取决于 `value` 参数，可以是 `0` 也可以是 `1` 。
当 `key` 不存在时，自动生成一个新的字符串值。
字符串会进行伸展(grown)以确保它可以将 `value` 保存在指定的偏移量上。当字符串值进行伸展时，空白位置以 `0` 填充。

#### GETBIT
`GETBIT key offset`

对 `key` 所储存的字符串值，获取指定偏移量上的位(bit)。
当 `offset` 比字符串值的长度大，或者 `key` 不存在时，返回 `0` 。

#### BITCOUNT
`BITCOUNT key [start end]`

计算给定字符串中，被设置为 `1` 的比特位的数量。
一般情况下，给定的整个字符串都会被进行计数，通过指定额外的 `start` 或 `end` 参数，可以让计数只在特定的位上进行。

`start` 和 `end` 参数的设置和 [*GETRANGE*](http://doc.redisfans.com/string/getrange.html#getrange) 命令类似，都可以使用负数值：比如 `-1` 表示最后一个位，而 `-2` 表示倒数第二个位，以此类推。

不存在的 `key` 被当成是空字符串来处理，因此对一个不存在的 `key` 进行 `BITCOUNT` 操作，结果为 `0` 。

#### BITOP
`BITOP operation destkey key [key ...]`

`operation` 可以是 `AND` 、 `OR` 、 `NOT` 、 `XOR` 这四种操作中的任意一种：
- `BITOP AND destkey key [key ...]` ，对一个或多个 `key` 求逻辑并，并将结果保存到 `destkey` 。
- `BITOP OR destkey key [key ...]` ，对一个或多个 `key` 求逻辑或，并将结果保存到 `destkey` 。
- `BITOP XOR destkey key [key ...]` ，对一个或多个 `key` 求逻辑异或，并将结果保存到 `destkey` 。
- `BITOP NOT destkey key` ，对给定 `key` 求逻辑非，并将结果保存到 `destkey` 。

### bitmap使用场景

**1. 用户签到**

很多网站都提供了签到功能，并且需要展示最近一个月的签到情况，这种情况可以使用 BitMap 来实现。
根据日期 offset = （今天是一年中的第几天） % （今年的天数），key = 年份：用户id。

如果需要将用户的详细签到信息入库的话，可以考虑使用一个一步线程来完成。



**2. 统计活跃用户（用户登陆情况）**

使用日期作为 key，然后用户 id 为 offset，如果当日活跃过就设置为1。具体怎么样才算活跃这个标准大家可以自己指定。

假如 20201009 活跃用户情况是： [1，0，1，1，0]
20201010 活跃用户情况是 ：[ 1，1，0，1，0 ]

统计连续两天活跃的用户总数：

```
bitop and dest1 20201009 20201010 
# dest1 中值为1的offset，就是连续两天活跃用户的ID
bitcount dest1
```

统计20201009 ~ 20201010 活跃过的用户：

```
bitop or dest2 20201009 20201010 
```



**3. 统计用户是否在线**

如果需要提供一个查询当前用户是否在线的接口，也可以考虑使用 BitMap 。即节约空间效率又高，只需要一个 key，然后用户 id 为 offset，如果在线就设置为 1，不在线就设置为 0。



**4. 实现布隆过滤器**

通过布隆过滤器可以快速实现判断一个元素不在集合中的需求，例如在解决缓存穿透问题的时候可以用布隆过滤器做一次拦截。



## hyperloglog

### hyperLogLog介绍

HyperLogLog 是一种**基数估算**算法。所谓基数估算，就是估算在一批数据中，不重复元素的个数有多少。

从数学上来说，基数估计这个问题的详细描述是：对于一个数据流 {x1，x2，...，xs} 而言，它可能存在重复的元素，用 n 来表示这个数据流的不同元素的个数，并且这个集合可以表示为{e1，...，en}。目标是：使用 m 这个量级的存储单位，可以得到 n 的估计值，其中 m<<n 。并且估计值和实际值 n 的误差是可以控制的。

对于上面这个问题，如果是想得到精确的基数，可以使用字典（dictionary）这一个数据结构（Set）。对于新来的元素，可以查看它是否属于这个字典；如果属于这个字典，则整体计数保持不变；如果不属于这个字典，则先把这个元素添加进字典，然后把整体计数增加一。当遍历了这个数据流之后，得到的整体计数就是这个数据流的基数了。

这种算法虽然精准度很高，但是使用的空间复杂度却很高。那么是否存在一些近似的方法，可以估算出数据流的基数呢？HyperLogLog 就是这样一种算法，既可以使用较低的空间复杂度，最后估算出的结果误差又是可以接受的。



### 基本操作命令

#### PFADD

`PFADD key element [element...]`

添加元素到hyperloglog



#### PFCOUNT

`PFCOUNT key [key...]`

统计



#### PFMERGE

合并几个不同的hyperloglog到一个中



###  hyperLogLog应用场景

- UV统计（借用 [巧用 Redis Hyperloglog，轻松统计 UV 数据](https://segmentfault.com/a/1190000020523110) 的例子，可以直接点击进去看）

比如，有这么个场景，用户登录到系统，我们需要在一小时内统计不同的用户。 因此，我们需要一个 key，例如 USER:LOGIN:2019092818。 换句话说，我们要统计在 2019 年 09 月 28 日下午 18 点至 19 点之间发生用户登录操作的非重复用户数。对于将来的时间，我们也需要使用对应的 key 进行表示，比如 2019111100、2019111101、2019111102 等。

假设，用户 A、B、C、D、E 和 F 在下午 18 点至 19 点之间登录了系统

```
# 记录
pfadd USER:LOGIN:2019092818 A B C D E F
#统计
pfcount USER:LOGIN:2019092818
```

- 滑动窗口统计

在上面的例子的基础上，分多个时间段后，根据统计维度不同，合并不同的时间段进行统计 

1.直接在多个时间段进行统计

```
pfcount 201909281821 201909281822 201909281823 201909281824 201909281825
```

2.合并时间段后再进行统计

```
pfmerge USER:LOGIN:2019092818-19 USER:LOGIN:2019092818 USER:LOGIN:2019092819

pfcount USER:LOGIN:2019092818-19
```



## geospatial

从Redis3.2开始，Redis基于geohash和有序集合(zset)提供了地理位置相关功能，用来实现类似微信中**附近的人**的功能，使用起来十分方便。

Redis Geo模块大概提供了6个命令，分别为：
1）geoadd：将给定的位置对象（纬度、经度、名字）添加到指定的key；
2）geopos：从key里面返回所有给定位置对象的位置（经度和纬度）；
3）geodist：返回两个给定位置之间的距离；
4）geohash：返回一个或多个位置对象的geohash表示；
5）georadius：以给定的经纬度为中心，返回目标集合中与中心的距离不超过给定最大距离的所有位置对象；
6）georadiusbymember：以给定的位置对象为中心，返回与其距离不超过给定最大距离的所有位置对象。

关于geo原理，可以查看 [Redis GEO 功能使用场景](https://www.shuzhiduo.com/A/x9J2NjZZJ6/)



## 使用lua脚本

语法

`eval "script" KEYS_NUM key(1)...key(KEYS_NUM) args...`

示例1

```
eval "return redis.call('set',KEYS[1],ARGV[1])" 1 foo bar

脚本：return redis.call('set',KEYS[1],ARGV[1])
KEYS_NUM=1
key=foo
args=bar
```

示例2——redisson中RedissonLock 的lock实现

```
"if (redis.call('exists', KEYS[1]) == 0) then " +
  "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
  "return nil; " +
"end; " +
"if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
  "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
  "return nil; " +
"end; " +
"return redis.call('pttl', KEYS[1]);"
```



Redis 使用单个 Lua 解释器去运行所有脚本，并且， Redis 也**保证脚本会以原子性(atomic)的方式执行**： 当某个脚本正在运行的时候，不会有其他脚本或 Redis 命令被执行。 这和使用 [MULTI](http://www.redis.cn/commands/multi.html) / [EXEC](http://www.redis.cn/commands/exec.html) 包围的事务很类似。 在其他别的客户端看来，脚本的效果(effect)要么是不可见的(not visible)，要么就是已完成的(already completed)。 另一方面，这也意味着，执行一个运行缓慢的脚本并不是一个好主意。写一个跑得很快很顺溜的脚本并不难， 因为脚本的运行开销(overhead)非常少，但是当你不得不使用一些跑得比较慢的脚本时，请小心， 因为当这些蜗牛脚本在慢吞吞地运行的时候，其他客户端会因为服务器正忙而无法执行命令。



---

参考链接：

- [Redis 中 BitMap 的使用场景](https://www.cnblogs.com/54chensongxia/p/13794391.html)
- [业务场景中如何巧妙的应用bitmap和zset](https://juejin.cn/post/6844904020587315207)
- [Redis 中 HyperLogLog 的使用场景](https://www.cnblogs.com/54chensongxia/p/13803465.html)
- [巧用 Redis Hyperloglog，轻松统计 UV 数据](https://segmentfault.com/a/1190000020523110)
- [Redis GEO 功能使用场景](https://www.shuzhiduo.com/A/x9J2NjZZJ6/)

