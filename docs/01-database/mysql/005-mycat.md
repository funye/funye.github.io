---
title: MySQL中间件 - MyCat
date: 2020-11-23
categories:
 - 数据库
tags:
 - MySQL
 - MyCat
---

# MySQL中间件 - MyCat

在使用MySQL的时候，当数据达到一定量，简单的单库、单表、单实例已经不能满足需求的时候，很多人选择的方式就是引入分库分表、读写分离来缓解压力，解除瓶颈。

mysql有很多优秀的中间件来作为读写分离和分库分表的解决方案，如： Atlas、cobar、TDDL、mycat、sharding-jdbc 、heisenberg、Oceanus、vitess、OneProxy等

这些中间件在解决读写分离和分库分表上，一般分为两种：
1. 代理模式（实现mysql协议，提供一个对应用透明的服务），例如：Atlas、cobar、mycat
2. 实现jdbc规范，以依赖包提供给应用使用。如：TDDL、sharding-jdbc

以下简单实战一下mycat中间件使用

## mycat的原理



## mycat的特性



## mycat使用实战

 



---

参考资料：

- [Mycat2权威指南](https://www.yuque.com/ccazhw/ml3nkf/bef923fb8acc57e0f805d45ef7782670 )

  

