---
title: Netty实战之长连接推送
date: 2020-11-23
categories:
 - Java基础
tags:
 - netty
---
# Netty实战之长连接推送



- Channel Attribute 传递共享变量
- 优先使用epoll



性能调优：

- netty参数优化
    - 使用netty-transport-native-epoll
    - 使用netty-tcnative-boringssl
    - 使用内存池，不要使用Unpooled工具类
    - 合理配置TCP队列大小（SO_BACKLOG）
    - 合理配置TCP发送缓冲区大小（SO_SNDBUF）
    - 合理配置TCP接收缓冲区大小（SO_RCVBUF）
    - 合理配置CHannel Write Buffer 大小
    - ChannelHandler.Sharable 单例
- Linux 内核参数优化
    - 卸载iptables模块
    - fs.file-max=5048576
    - net.core.somaxconn=262144
    - tcp_max_tw_buckets=102400
    - net.ipv4.tcp_fin_timeout=10
    - net.ipv4.tcp_timestamps=1
    - net.ipv4.tcp_tw_resue=1
    - net.ipv4.tcp_tw_recycle=0







一个偏实战的netty应用示例

- [netty 4.x 用户指南(中文)](https://www.w3cschool.cn/netty_4_user_guide/6worbozt.html) 
- [一个简单可参考的API网关架构设计（内含代码）](https://mp.weixin.qq.com/s?__biz=MzIwMzg1ODcwMw==&mid=2247487606&idx=1&sn=4b8d0d1b7bfd18b52c57ab7256128244&chksm=96c9a616a1be2f000f7948209081c8ff8311d2469b2e00f148b55d6d07d0dee04b15b823034e#rd)
- [徒手撸框架--实现 RPC 远程调用](https://github.com/diaozxin007/DouRpc)

- [A simple RPC framework based on Netty, ZooKeeper and Spring](https://github.com/luxiaoxun/NettyRpc)
- [Netty学习](https://github.com/code4craft/netty-learning)
- [NettyRPC is high performance java rpc server base on Netty,using kryo,hessian,protostuff support message serialization.](https://github.com/tang-jie/NettyRPC)



