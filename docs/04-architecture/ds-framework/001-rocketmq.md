---
title: 分布式消息：RocketMQ
date: 2021-05-20
categories:
 - 架构&分布式
tags:
 - 消息队列
 - RocketMQ

---

## RocketMQ架构

- rocketmq 架构设计
  - producer 
  - consumer
  - nameserver
  - broker
    - Remoting Module
    - Client Manager
    - Store Service
    - HA Service
    - Index Service
- 部署结构
  - producer、consumer、broker、nameserver

## 通信机制

- 消息编解码
- 同步、异步、单向
- reactor多线程模型



## 消息存储

- 消息存储架构
  - ConsumerQueue
  - commitLog
    - minOffset
    - consumerOffset
    - maxOffset
  - IndexFile
- PageCache与Mmap
- 消息刷盘（同步、异步）
- 消息查询
  - IndexFile (按照key或者MessageId)

##  消息类型

- 普通消息
- 顺序消息（顺序消息实现，指定队列，消费这执行队列消费）
- 定时延时消息
- 事务消息

## 消息投递

- 发送方式（同步、异步）
- 消息消费
- 广播消费与集群消费
- 消息消费重试

## 负载均衡

- producer负载均衡
  - 随机
  - sendLatencyFaultEnable 开启则 随机+过滤not available (按时间做退避)
- consumer负载均衡
  - pull
  - push
  - 按照consumer 和 messagequeue 做排序后平均分配

## 思考

- 如何保证高可用 ？
  - broker采用master-slave架构
  - 发送端负载时候使用时间退避
  - 消费消息实现重试机制
- 如何保证可靠性（丢失、重复消费）？
  - 发送端丢失，确认，设置重试次数或者业务自己实现重试
  - broker丢失，一般刷盘改为同步刷盘，尽量少丢失
  - 消费丢失，没有收到消费确认的，自动重试
  - 重复消费，接口做幂等处理，不能幂等加入消费id消费过滤。
- NameServer 一致性问题？
  - NameServer  是一个ap的模型，server之前不进行通信，broker和每个nameserver 同步信息
- 事务消息二阶段如何从half队列中找到原始消息？
  - sendMessageInTransaction-->send--> sendResult-->endTransaction-->endTransactionOneWay-->EndTransactionProcessor --> TransactionalMessageServiceImpl.commitMessage --> getHalfMessageByOffset
  - 利用sendResult 的 offsetMsgId 解析出MessageId 在解析出coommitLog的offset 通过offset直接获取原消息





---

参考资料：

- [RocketMQ官方文档-架构设计](https://github.com/apache/rocketmq/blob/master/docs/cn/architecture.md)

- [RocketMQ入门介绍](https://www.cnblogs.com/myseries/p/13153797.html)

- [RocketMQ NameServer深入剖析](https://cloud.tencent.com/developer/article/1543490)

