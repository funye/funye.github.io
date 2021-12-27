---
title: 分布式RPC：DUBBO
date: 2021-05-20
categories:
 - 架构&分布式
tags:
 - dubbo
---

## 架构设计



## 分层说明

- **config 配置层**：对外配置接口，以 `ServiceConfig`, `ReferenceConfig` 为中心，可以直接初始化配置类，也可以通过 spring 解析配置生成配置类
- **proxy 服务代理层**：服务接口透明代理，生成服务的客户端 Stub 和服务器端 Skeleton, 以 `ServiceProxy` 为中心，扩展接口为 `ProxyFactory`
- **registry 注册中心层**：封装服务地址的注册与发现，以服务 URL 为中心，扩展接口为 `RegistryFactory`, `Registry`, `RegistryService`
- **cluster 路由层**：封装多个提供者的路由及负载均衡，并桥接注册中心，以 `Invoker` 为中心，扩展接口为 `Cluster`, `Directory`, `Router`, `LoadBalance`
- **monitor 监控层**：RPC 调用次数和调用时间监控，以 `Statistics` 为中心，扩展接口为 `MonitorFactory`, `Monitor`, `MonitorService`
- **protocol 远程调用层**：封装 RPC 调用，以 `Invocation`, `Result` 为中心，扩展接口为 `Protocol`, `Invoker`, `Exporter`
- **exchange 信息交换层**：封装请求响应模式，同步转异步，以 `Request`, `Response` 为中心，扩展接口为 `Exchanger`, `ExchangeChannel`, `ExchangeClient`, `ExchangeServer`
- **transport 网络传输层**：抽象 mina 和 netty 为统一接口，以 `Message` 为中心，扩展接口为 `Channel`, `Transporter`, `Client`, `Server`, `Codec`
- **serialize 数据序列化层**：可复用的一些工具，扩展接口为 `Serialization`, `ObjectInput`, `ObjectOutput`, `ThreadPool`

## 实现细节

- 解析服务
- 暴露服务
- 引用服务
- 拦截服务
- 远程调用细节
  - 提供者暴露服务详细过程
  - 消费者消费服务过程

## SPI机制扩展点

- 例如 负载均衡扩展
- 序列化扩展等




**参考文档** 

- [Dubbo开发指南 官方文档](https://dubbo.apache.org/zh/docs/v2.7/dev/)

- [Dubbo之基于“版本”的服务调度(路由规则)](
  http://blog.maxplus1.com/2017/06/14/Dubbo%E4%B9%8B%E5%9F%BA%E4%BA%8E%E2%80%9C%E7%89%88%E6%9C%AC%E2%80%9D%E7%9A%84%E6%9C%8D%E5%8A%A1%E8%B0%83%E5%BA%A6(%E8%B7%AF%E7%94%B1%E8%A7%84%E5%88%99)/)

- [阿里技术专家详解 Dubbo 实践，演进及未来规划](https://www.infoq.cn/article/IwZCAp3jo_H5fJFbWOZu)
- [阿里巴巴为什么不用 ZooKeeper 做服务发现？](http://jm.taobao.org/2018/06/13/做服务发现？/)



