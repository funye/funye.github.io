---
title: Java的日志体系
date: 2021-12-15
categories:
 - 基础框架
tags:
 - log4j

---

# Java的日志体系



## 1 日志介绍

1. log4j 早年的用户输出日志的框架



2. jul (java.util.logging) jdk版本的日志框架



3. jcl (Jakarta Commons Logging)  也就是 commons-logging-xxx.jar, JCL 只提供 log 接口，具体的实现则在运行时动态寻找。这样一来组件开发者只需要针对 JCL 接口开发，而调用组件的应用程序则可以在运行时搭配自己喜好的日志实践工具。JCL可以实现的集成方案如下图所示![image](https://www.cnblogs.com/images/cnblogs_com/rjzheng/1232869/o_log1.png)

jcl默认的配置：如果能找到Log4j 则默认使用log4j 实现，如果没有则使用jul(jdk自带的) 实现，再没有则使用jcl内部提供的SimpleLog 实现。



4. slf4j 

至于这个Log具体的实现类，JCL会在ClassLoader中进行查找。这么做，有三个缺点，缺点一是效率较低，二是容易引发混乱，三是在使用了自定义ClassLoader的程序中，使用JCL会引发内存泄露。
于是log4j的作者觉得jcl不好用，自己又写了一个新的接口api，那么就是slf4j。关于slf4j的集成图如下所示
![image](https://www.cnblogs.com/images/cnblogs_com/rjzheng/1232869/o_log4.png)

如图所示，应用调了sl4j-api，即日志门面接口。日志门面接口本身通常并没有实际的日志输出能力，它底层还是需要去调用具体的日志框架API的，也就是实际上它需要跟具体的日志框架结合使用。由于具体日志框架比较多，而且互相也大都不兼容，日志门面接口要想实现与任意日志框架结合可能需要对应的桥接器，上图红框中的组件即是对应的各种桥接器！



基本上，现在都是使用slf4j 的方式来作为日志输出，选择从 slf4j-api开始的一条线路即可，实际使用中，由于各模块可能日志组件不同，还是使用到适配器。



## 2 适配器

通常，在使用日志的时候，选择从 slf4j-api开始的一条线路即可，但是实际中可能有些框架使用别的路线，这个时候就需要使用适配器。

总的来说，就是以下几种适配器和使用情况

- 你在用JCL
    使用`jcl-over-slf4j.jar`适配，将jcl适配到 sfl4j线路
- 你在用log4j
    使用`log4j-over-slf4j.jar`适配，将log4j适配到 sfl4j线路
- 你在用JUL
    使用`jul-to-slf4j.jar`适配，将jul适配到 sfl4j线路



## 3 日志使用图解

使用方式如下图：![image](https://www.cnblogs.com/images/cnblogs_com/rjzheng/1232869/o_log12.png)



各个模块有自己的日志框架、最终统一到slf4j输出，不同框架通过 适配器 适配到slf4j, slf4j 再通过桥接器找到对应的日志框架实现。



## 3 实战示例

使用示例1：

![image](https://www.cnblogs.com/images/cnblogs_com/rjzheng/1232869/o_log13.png)

如上图：模块一使用log4j作为日志输出工具，模块二使用slf4j ， 如何让日志统一呢，这个时候使用 log4j-over-slf4j 的适配器，统一使用slf4j输出。



使用示例2：

**如何让spring以log4j2的形式输出？**
spring默认使用的是jcl输出日志，由于你此时并没有引入Log4j的日志框架，jcl会以jul做为日志框架。此时集成图如下
![image](https://www.cnblogs.com/images/cnblogs_com/rjzheng/1232869/o_log5.png)
而你的应用中，采用了slf4j+log4j-core，即log4j2进行日志记录，那么此时集成图如下
![image](https://www.cnblogs.com/images/cnblogs_com/rjzheng/1232869/o_log6.png)
那我们现在需要让spring以log4j2的形式输出？怎么办？
OK,第一种方案，走jcl-over-slf4j适配器，此时集成图就变成下面这样了
![image](https://www.cnblogs.com/images/cnblogs_com/rjzheng/1232869/o_log8.png)
在这种方案下，spring框架中遇到日志输出的语句，就会如上图红线流程一样，最终以log4J2的形式输出！
OK，有第二种方案么？
有，走jul-to-slf4j适配器，此时集成图如下
![image](https://www.cnblogs.com/images/cnblogs_com/rjzheng/1232869/o_log14.png)

`ps`:这种情况下，记得在代码中执行

```
SLF4JBridgeHandler.removeHandlersForRootLogger();
SLF4JBridgeHandler.install();
```

这样jul-to-slf4j适配器才能正常工作。







---

参考资料：

- [【原创】架构师必备，带你弄清混乱的JAVA日志体系！](https://www.cnblogs.com/rjzheng/p/10042911.html)