---
title: Java内存结构分析
date: 2020-11-23
categories:
 - Java基础
tags:
 - jvm
 - java内存结构
---

# java内存结构


## 1 java内存结构图



理解学习java虚拟机内存结构，能够帮助我们更加清楚知道java程序在操作的时候如果存储数据，是java虚拟机的性能优化（GC调优）的基础。

谈到JVM内存结构，当然少不了这个经典的结构图

![java内存结构图](../../assets/jvm/jvm-structure.jpg)

上图清晰描述了JVM的内存结构，分别有以下几个部分组成
- 堆（Heap）：线程共享。所有的对象实例以及数组都要在堆上分配。回收器主要管理的对象。
- 方法区（Method Area）：线程共享。存储类信息、常量、静态变量、即时编译器编译后的代码。
- 方法栈（JVM Stack）：线程私有。存储局部变量表、操作栈、动态链接、方法出口，对象指针。
- 本地方法栈（Native Method Stack）：线程私有。为虚拟机使用到的Native 方法服务。如Java使用c或者c++编写的接口服务时，代码在此区运行。
- 程序计数器（Program Counter Register）：线程私有。有些文章也翻译成PC寄存器（PC Register），同一个东西。它可以看作是当前线程所执行的字节码的行号指示器。指向下一条要执行的指令。

## 2 java内存模块分析

以下这个图，帮忙理解jvm的一些参数控制  

![jvm](../../assets/jvm/jvm.jpg)

### 2.1 堆

堆的作用是存放对象实例和数组。从结构上来分，可以分为新生代和老年代。而新生代又可以分为Eden 空间、From Survivor 空间（s0）、To Survivor 空间（s1）。 所有新生成的对象首先都是放在新生代的。需要注意，Survivor的两个区是对称的，没先后关系，所以同一个区中可能同时存在从Eden复制过来的对象，和从前一个Survivor复制过来的对象。而且，Survivor区总有一个是空的。

- **新生代：** 新生代由 Eden 与 Survivor Space（S0，S1）构成，大小通过-Xmn参数指定，Eden 与 Survivor Space 的内存大小比例默认为8:1，可以通过-XX:SurvivorRatio 参数指定，比如新生代为10M 时，Eden分配8M，S0和S1各分配1M。
- **Eden：** 希腊语，意思为伊甸园，在圣经中，伊甸园含有乐园的意思，根据《旧约·创世纪》记载，上帝耶和华照自己的形像造了第一个男人亚当，再用亚当的一个肋骨创造了一个女人夏娃，并安置他们住在了伊甸园。
大多数情况下，对象在Eden中分配，当Eden没有足够空间时，会触发一次Minor GC，虚拟机提供了-XX:+PrintGCDetails/-Xlog:gc*参数，告诉虚拟机在发生垃圾回收时打印内存回收日志。
- **Survivor：** 意思为幸存者，是新生代和老年代的缓冲区域。当新生代发生GC（Minor GC）时，会将存活的对象移动到S0内存区域，并清空Eden区域，当再次发生Minor GC时，将Eden和S0中存活的对象移动到S1内存区域。
存活对象会反复在S0和S1之间移动，当对象从Eden移动到Survivor或者在Survivor之间移动时，对象的GC年龄自动累加，当GC年龄超过默认阈值15时，会将该对象移动到老年代，可以通过参数-XX:MaxTenuringThreshold 对GC年龄的阈值进行设置。

- **老年代**: 老年代的空间大小即-Xmx 与-Xmn 两个参数之差，用于存放经过几次Minor GC之后依旧存活的对象。当老年代的空间不足时，会触发Major GC/Full GC，速度一般比Minor GC慢10倍以上。

**控制参数**

- -Xms设置堆的初始空间大小。
- -Xmx设置堆的最大空间大小。
- -Xmn控制新生代大小。（jdk1.4之后使用） 
- -XX:NewSize设置新生代最小空间大小
- -XX:MaxNewSize设置新生代最小空间大小，
- -XX:NewRatio 老年代:年轻代的比例， 如2 代表 young:old = 1:2 
- -XX:SurvivorRatio Eden:Survivor的比例  如8 代表 eden:s0:s1 = 8:1:1

**垃圾回收**

此区域是垃圾回收的主要操作区域。

**异常情况**

如果在堆中没有内存完成实例分配，并且堆也无法再扩展时，将会抛出OutOfMemoryError 异常


### 2.2 方法区

方法区（Method Area）与Java 堆一样，是各个线程共享的内存区域，它用于存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。虽然Java 虚拟机规范把方法区描述为堆的一个逻辑部分，但是它却有一个别名叫做Non-Heap（非堆），目的应该是与Java 堆区分开来。

很多人愿意把方法区称为“永久代”（Permanent Generation），本质上两者并不等价，仅仅是因为HotSpot虚拟机的设计团队选择把GC 分代收集扩展至方法区，或者说使用永久代来实现方法区而已。对于其他虚拟机（如BEA JRockit、IBM J9 等）来说是不存在永久代的概念的。在Java8中永生代彻底消失了。


**控制参数**

- -XX:PermSize 设置最小空间 
- -XX:MaxPermSize 设置最大空间。

- -XX:MetaspaceSize=8m （1.8之后去掉方法区，使用元数据区）
- -XX:MaxMetaspaceSize=80m（1.8之后去掉方法区，使用元数据区）
- -XX:CompressedClassSpaceSize（1.8之后去掉方法区，使用元数据区）

>在JDK8后，方法区被移除了，引入了新的空间Metaspace来存放类的信息。
>
>Metaspace不在虚拟机中，而是使用本地内存，这样困扰我们的PermenGen的内存就不存在了，其上限变成了物理内存，当然可以通过参数进行设置。
>
>-XX:MetaspaceSize=8m -XX:MaxMetaspaceSize=80m 
>
>那么曾经在其中的常量池被转移到哪里了？答案是在堆中。

关于PermGen 和 metaspace, 请一定看看，请参考 [深入理解堆外内存 Metaspace](https://www.javadoop.com/post/metaspace)，
  [聊聊jvm的PermGen与Metaspace](https://segmentfault.com/a/1190000012577387)

**垃圾回收**

对此区域会涉及但是很少进行垃圾回收。这个区域的内存回收目标主要是针对常量池的回收和对类型的卸载，一般来说这个区域的回收“成绩”比较难以令人满意。


**异常情况**

根据Java 虚拟机规范的规定， 当方法区无法满足内存分配需求时，将抛出OutOfMemoryError。


### 2.3 方法栈

每个线程会有一个私有的栈。每个线程中方法的调用又会在本栈中创建一个栈帧。在方法栈中会存放编译期可知的各种基本数据类型（boolean、byte、char、short、int、float、long、double）、对象引用（reference 类型，它不等同于对象本身。局部变量表所需的内存空间在编译期间完成分配，当进入一个方法时，这个方法需要在帧中分配多大的局部变量空间是完全确定的，在方法运行期间不会改变局部变量表的大小。


**控制参数**

-Xss控制每个线程栈的大小。


**异常情况**

在Java 虚拟机规范中，对这个区域规定了两种异常状况：
- StackOverflowError： 异常线程请求的栈深度大于虚拟机所允许的深度时抛出；
- OutOfMemoryError 异常： 虚拟机栈可以动态扩展，当扩展时无法申请到足够的内存时会抛出。

### 2.4 本地方法栈

本地方法栈（Native Method Stacks）与虚拟机栈所发挥的作用是非常相似的，其区别不过是虚拟机栈为虚拟机执行Java 方法（也就是字节码）服务，而本地方法栈则是为虚拟机使用到的Native 方法服务。


**控制参数**

在Sun JDK中本地方法栈和方法栈是同一个，因此也可以用-Xss控制每个线程的大小。


**异常情况**

与虚拟机栈一样，本地方法栈区域也会抛出StackOverflowError 和OutOfMemoryError异常。


### 2.5 程序计数器

它的作用可以看做是当前线程所执行的字节码的行号指示器。


**异常情况**

此内存区域是唯一一个在Java 虚拟机规范中没有规定任何OutOfMemoryError 情况的区域。

---

参考链接
  - [InfoQ-程晓明](https://www.infoq.cn/profile/1278512/publish)
  - [JVM内存结构和Java内存模型](https://zhuanlan.zhihu.com/p/38348646)
  - [深入理解堆外内存 Metaspace](https://www.javadoop.com/post/metaspace)
  - [聊聊jvm的PermGen与Metaspace](https://segmentfault.com/a/1190000012577387)


