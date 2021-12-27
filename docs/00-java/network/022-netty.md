---
title: Netty的重要组件
date: 2020-11-23
categories:
 - Java基础
tags:
 - netty

---

# Netty的重要组件

## 1 EventLoop、EventLoopGroup



## 2 Bootstrap/ServerBootstrap



## 3 ChannelFuture、Channel



## 4 ChannelHandler、ChannelPipline、ChannelHandlerContext



## 5 编码器与解码器

### 5.1 TCP粘包/拆包问题 

TCP是个“流”协议，所谓流，就是没有界限的一串数据。大家可以想想河里的流水，它们是连成一片的，其间并没有分界线。TCP底层并不了解上层业务数据的具体含义，它会根据TCP缓冲区的实际情况进行包的划分，所以在业务上认为，一个完整的包可能会被TCP拆分成多个包进行发送，也可能把多个小的包封装成一个大的数据包发送，这就是所谓的TCP粘包和拆包问题。



**TCP 粘包/拆包发生的原因**：

1. 应用程序write写入的字节大小 > 套接字接口发送缓冲区大小
2. 进行MSS大小的TCP分段
3. 以太网帧的payload大于MTU进行IP分片



**TCP 粘包问题解决策略**

一般都是通过在上层协议设计上来解决这个问题，业界主流方案如下：

1. 消息定长，使用固定长度消息，不够空位补空格
2. 在包尾部增加回车换行符进行分割，例如FTP协议
3. 将消息分为消息头和消息体，消息头中包含消息总长度（或者消息体长度）的字段，通常设计思路为消息头的第一个字段使用int32来表示消息总长度
4. 其他更加复杂的应用层协议



在netty中，解决粘包、拆包问题最大的利器就是编码器和解码器。

### 5.1 编码器与解码器 

LineBasedFrameDecoder

DelimiterDasedFrameDecoder

FixedLengthFrameDecoder



# 6 Netty逻辑架构










参考资料：

- [一文理解Netty模型架构](https://juejin.im/post/5bea1d2e51882523d3163657)
- [netty-4-user-guide](https://waylau.gitbooks.io/netty-4-user-guide/)
- [Netty 系列之 Netty 线程模型](https://www.infoq.cn/article/netty-threading-model)
- [Netty & 网络(作者：益文的圈)](https://www.jianshu.com/nb/23688586)









