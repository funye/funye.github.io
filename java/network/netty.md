# netty 知识梳理与总结

本文主要梳理下netty相关的知识体系，并对关键知识点进行总结

# 1 常见I/O模型


## 1.1 阻塞I/O - BIO


## 1.2 异步IO - NIO


# 2 线程模型

## 2.1 事件驱动模型


## 2.2 reactor线程模型


## 2.3 netty的线程模型


# 3 netty的工作原理架构


# 4 netty的重要组件

## 4.1 Bootstrap/ServerBootstrap

## 4.2 ChannelFuture、Channel

## 4.3 NioEventLoop、NioEventLoopGroup

## 4.4 ChannelHandler、ChannelPipline、ChannelHandlerContext

## 4.5 编解码器

# 5 netty的传输

- OIO——阻塞传输
- NIO——异步传输
- Local——JVM 内部的异步通信
- Embedded——测试你的ChannelHandler










参考资料：
- [一文理解Netty模型架构](https://juejin.im/post/5bea1d2e51882523d3163657)
- [netty-4-user-guide](https://waylau.gitbooks.io/netty-4-user-guide/)
- [Netty 系列之 Netty 线程模型](https://www.infoq.cn/article/netty-threading-model)
- [Netty & 网络(作者：益文的圈)](https://www.jianshu.com/nb/23688586)









