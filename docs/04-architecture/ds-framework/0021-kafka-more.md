---
title: 分布式消息：kakfa
date: 2020-11-20
categories:
 - 架构&分布式
tags:
 - 消息队列
 - kafka
---

- Kafka的一些概念
  - ISR(In-sync Replicas), OSR(Out-of-Sync Replicas)
  - HW(High watermark)、LSO(log Start Offset)、LEO(log End Offset)
- Kafka 如果保证数据一致性
  - follower 同步进度不同的时候，选举leader 
- Kafka的储存索引
  - Partition
  - Segment
    - .index (稀疏索引)
    - .log
- Kafka选举
  - Broker leader选举
  - Partition Leader 选举
- Kafka负载均衡



https://www.cnblogs.com/caozibiao/p/14248371.html



​	关于kafka要思考的问题： https://www.cnblogs.com/yoke/p/11477186.html

---

参考资料：
- [kafka分区、分段、稀疏索引实现高性能查询](https://www.jianshu.com/p/255de4d3874b)
- [Kafka文件存储机制那些事](https://tech.meituan.com/2015/01/13/kafka-fs-design-theory.html)
- https://www.cnblogs.com/caozibiao/p/14248371.html



