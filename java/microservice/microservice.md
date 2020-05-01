# 微服务 {docsify-ignore-all}

微服务架构设计时候，思考的方向

- 1 RPC的实现
  - 协议实现
  - 调用方式

- 2 注册中心
  - 注册中心是 CP 还是 AP 系统?
  - 服务规模、容量、服务联通性
  - 注册中心需要持久存储和事务日志么？
  - Service Health Check
  - 注册中心的容灾考虑
  - 你有没有ZooKeeper的专家可依靠？

- 3 服务注册与发现
  - 自动的注册与发现服务

- 4 路由与负载
  - 路由
  - 负载均衡
  - 限流

- 5 应用降级与熔断
  - 服务降级处理
  - 服务熔断

- 6 链路跟踪
  - 埋点
  - 调用链分析

- 7 服务隔离
  - 灰度
  - 应用之间减少依赖



**参考文档** 

- [Dubbo之基于“版本”的服务调度(路由规则)](
  http://blog.maxplus1.com/2017/06/14/Dubbo%E4%B9%8B%E5%9F%BA%E4%BA%8E%E2%80%9C%E7%89%88%E6%9C%AC%E2%80%9D%E7%9A%84%E6%9C%8D%E5%8A%A1%E8%B0%83%E5%BA%A6(%E8%B7%AF%E7%94%B1%E8%A7%84%E5%88%99)/)

- [阿里技术专家详解 Dubbo 实践，演进及未来规划](https://www.infoq.cn/article/IwZCAp3jo_H5fJFbWOZu)
- [阿里巴巴为什么不用 ZooKeeper 做服务发现？](http://jm.taobao.org/2018/06/13/做服务发现？/)



