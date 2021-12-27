---
autoGroup+1: MySQL
title: MySQL的事务隔离级别与实现原理
date: 2021-01-04
categories:
 - 数据库
tags:
 - MySQL


---

什么是脏读、幻读？怎么处理这些情况？

MVCC机制到底是怎么个原理？

<!-- more -->

# MySQL的事务隔离级别与实现原理

## 1.MySQL事务并发时可能出现的情况

mysql事务并发的时候回出现三种情况 脏读(Dirty Read)、不可重复读(Non-Repeatable Read)、幻读(Phantom Read)


### 1.1脏读
一个事务读到了另外一个事务修改过但未提交的数据

示例图：

时间点    |	事务A     |	事务B     
---------|------------|-----------
1        |	开启事务   |	
2       |		    |开启事务
3       |查询数据为100条|	
4       |		|insert一条数据
5       |	再查询，结果为101条|


### 1.2不可重复读

在一个事务中，相同的访问，两次却得到了不同的结果。

假设数据为id=1,value=100, 价格read commited情况

时间点    |	事务A     |	事务B     
---------|------------|-----------
1        |	开启事务   |	
2       |		    |开启事务
3       |查询id=1的数据，结果为100|	
4       |		|iupdate value=101 where id=1
5       |查询id=1的数据，结果为100|
6       |       | 提交事务
7       |查询id=1的数据，结果为101|

同一个事务A 查询的结果不同

### 1.3幻读

mysql官方文档的说法
>The so-called phantom problem occurs within a transaction when the same query produces different sets of rows at different times. 
>For example, if a SELECT is executed twice, but returns a row the second time that was not returned the first time, the row is a “phantom” row.

>在一个事务中，同一个查询产生不能结果集，结果rows变化了

时间点    |	事务A     |	事务B     
---------|------------|-----------
1        |	开启事务   |	
2       |		    |开启事务
3       |查询数据100调|	
4       |		|插入一条新数据
5       |       |提交事务
6       |查询数据101条 | 


## 2.MySQL的事务隔离级别

### 2.1隔离级别的定义

MySQL的事务隔离级别有4中，读未提交(READ UNCOMMITTED)、读已提交(READ COMMITTED)、可重复读(REPEATABLE READ)、可串行化(SERIALIZABLE)。

- 【RAED UNCOMMITED】：使用查询语句不会加锁，可能会读到未提交的行（Dirty Read）；
- 【READ COMMITED】：只对记录加记录锁，而不会在记录之间加间隙锁，所以允许新的记录插入到被锁定记录的附近，所以再多次使用查询语句时，可能得到不同的结果（Non-Repeatable Read）；
- 【REPEATABLE READ】：多次读取同一范围的数据会返回**第一次查询的快照**，不会返回不同的数据行，但是可能发生幻读（Phantom Read）；
- 【SERIALIZABLE】：InnoDB 隐式地将全部的查询语句加上共享锁，解决了幻读的问题；

MySQL的隔离级别的作用就是让事务之间互相隔离，互不影响，这样可以保证事务的一致性。

隔离级别比较：可串行化>可重复读>读已提交>读未提交

隔离级别对性能的影响比较：可串行化>可重复读>读已提交>读未提交

由此看出，隔离级别越高，所需要消耗的MySQL性能越大（如事务并发严重性），为了平衡二者，一般建议设置的隔离级别为可重复读，MySQL默认的隔离级别也是可重复读。


### 2.2隔离级别与并发情况

*打钩代表可能发生*

级别\并发情况 |	Dirty Read|	Non-Repeatable Read  |  Phantom Read 
---------|------------|-----------|----------
RAED UNCOMMITED |√   |	√ | √
READ COMMITED   |    |  √ | √
REPEATABLE READ |    |    | √	
SERIALIZABLE    |	 |    |  




## 3.事务隔离级别实现原理

数据库对于隔离级别的实现就是使用并发控制机制对在同一时间执行的事务进行控制，限制不同的事务对于同一资源的访问和更新，
而最重要也最常见的并发控制机制，在这里简单介绍三种最重要的并发控制器机制的工作原理。具体实现请看 [MySQL的并发控制机制](0041-mysql-mvcc.md)

### 3.1锁
锁是一种最为常见的并发控制机制，在一个事务中，我们并不会将整个数据库都加锁，而是只会锁住那些需要访问的数据项，
MySQL 和常见数据库中的锁都分为两种，共享锁（Shared）和互斥锁（Exclusive），前者也叫读锁，后者叫写锁。

读锁保证了读操作可以并发执行，相互不会影响，而写锁保证了在更新数据库数据时不会有其他的事务访问或者更改同一条记录造成不可预知的问题。

### 3.1时间戳

除了锁，另一种实现事务的隔离性的方式就是通过时间戳，使用这种方式实现事务的数据库，
例如 PostgreSQL 会为每一条记录保留两个字段；读时间戳中包括了所有访问该记录的事务中的最大时间戳，
而记录行的写时间戳中保存了将记录改到当前值的事务的时间戳。

使用时间戳实现事务的隔离性时，往往都会使用乐观锁，先对数据进行修改，在写回时再去判断当前值，也就是时间戳是否改变过，
如果没有改变过，就写入，否则，生成一个新的时间戳并再次更新数据，乐观锁其实并不是真正的锁机制，它只是一种思想，在这里并不会对它进行展开介绍。

这种思想也可以在业务上面使用，例如在mysql上，给表定义一个version列，通过version做乐观锁的方式来控制并发。

### 3.1多版本和快照隔离

通过维护多个版本的数据，数据库可以允许事务在数据被其他事务更新时对旧版本的数据进行读取，很多数据库都对这一机制进行了实现；
因为所有的读操作不再需要等待写锁的释放，所以能够显著地提升读的性能，MySQL 和 PostgreSQL 都对这一机制进行自己的实现，也就是 MVCC，
虽然各自实现的方式有所不同，MySQL 就通过回滚日志实现了 MVCC，保证事务并行执行时能够不等待互斥锁的释放直接获取数据。


::: danger
注意：MVCC并不能解决幻读的问题，需要配合 Next-key锁
:::

---
参考链接：

- [https://draveness.me/mysql-innodb/](https://draveness.me/mysql-innodb/)
- [https://draveness.me/mysql-transaction/](https://draveness.me/mysql-transaction/)
