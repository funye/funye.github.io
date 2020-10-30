分布式事务

1. 产生的原因
2. CAP/ BASE 理论
3. 确定是否真的需要用分布式事务（尽量避免）
4. 解决方案
    1. 2PC (2 phase commit) XA协议
    2. TCC (try-confirm-cancel)
    3. 本地消息表
    4. MQ事务 （RocketMQ实现）
    5. Saga事务



TCC 实战：
- https://github.com/liuyangming/ByteTCC
- https://github.com/changmingxie/tcc-transaction
- https://github.com/prontera/spring-cloud-rest-tcc
- https://github.com/QNJR-GROUP/EasyTransaction

seata(前身Fescar)
- https://zhuanlan.zhihu.com/p/87097525
- http://seata.io/zh-cn/docs/overview/what-is-seata.html


--- 

参考资料
- https://juejin.im/post/6844903647197806605
- https://xiaomi-info.github.io/2020/01/02/distributed-transaction/