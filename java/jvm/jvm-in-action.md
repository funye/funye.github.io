# JVM性能调优实战

创建时间：2020-04-20

---

## 1 参数调试

### 1.1堆区的参数控制

### 1.2方法区、数据元区参数控制

### 1.3栈区参数控制

## 2 参数配置估算(内存估算)

## 3 问题排查

### 3.1 JVM常见问题排查思路

1. `ps`，查看进程id 
2. `top -p [pid] -H`，top命令：Linux命令。可以查看实时的内存使用情况。
3. `jstack -l [pid] > stack.log`，jstack跟踪堆栈信息。
4. `jmap -histo:live [pid]`，然后分析具体的对象数目和占用内存大小，从而定位代码。
5. `jmap -dump:live,format=b,file=xxx.xxx [pid]`，然后利用MAT工具分析是否存在内存泄漏等等。
6. 使用VisualVm 进行分析

`pmap -x [pid]` 查看进程的内存映射情况

如果有OOM的话，调整对应的内存的大小，如果没有OOM，而是频繁的GC 分析调整 young old 的占比，survivor的占比

### 3.2 JVM常见问题排查示例

---
参考资料

- [JVM内存模型分析04篇-调优工具使用介绍](https://zhuanlan.zhihu.com/p/36597907)
- [从一次线上故障思考Java问题定位思路](https://www.cnblogs.com/QG-whz/p/9647614.html)
- [jvm疯狂吞占内存，罪魁祸首是谁？](https://www.analysys.cn/article/detail/20019016)
- [记一次生产频繁出现 Full GC 的 GC日志图文详解](https://cloud.tencent.com/developer/article/1552089)
- [一步步优化JVM四：决定Java堆的大小以及内存占用](https://my.oschina.net/u/347386/blog/1552781)
- [每天百万交易的支付系统，生产环境该怎么设置JVM堆内存大小](https://youyou-tech.com/2019/11/22/%E6%AF%8F%E5%A4%A9%E7%99%BE%E4%B8%87%E4%BA%A4%E6%98%93%E7%9A%84%E6%94%AF%E4%BB%98%E7%B3%BB%E7%BB%9F%EF%BC%8C%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E8%AF%A5%E6%80%8E%E4%B9%88%E8%AE%BE/)
