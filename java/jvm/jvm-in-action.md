# JVM性能调优实战

`时间`：`{docsify-updated}` <br>

---

## 1 参数调试

### 1.1 GC日志参数
- -XX:+PrintGCDetails 打印GC详细日志
- -XX:+HeapDumpOnOutOfMemoryError 设置当OutOfMemoryError的时候，dump堆区的情况
- -XX:+HeapDumpBeforeFullGC 设置发现FullGC之前dump堆区信息
- -XX:+HeapDumpAfterFullGC 设置发现FullGC之后dump堆区信息
- -XX:HeapDumpPath 指定dump文件
- -Xloggc 指定GC日志文件

例如
```jvm
-Xms2048m 
-Xmx2048m 
-Xmn1048m 
-XX:+PrintGCDetails 
-XX:+HeapDumpOnOutOfMemoryError 
-XX:+HeapDumpBeforeFullGC 
-XX:+HeapDumpAfterFullGC 
-XX:HeapDumpPath=/tmp/headoom.dump 
-Xloggc:log/gc.log
```

### 1.2 堆区的参数控制
- -Xmx 堆区最大值
- -Xms 堆区初始大小
- -Xmn 年轻代空间
- -XX:NewRatio 老年代:年轻代的比例， 如2 代表 young:old = 1:2 
- -XX:SurvivorRatio Eden:Survivor的比例  如8 代表 eden:s0:s1 = 8:1:1

堆区内存溢出示例：
```java
/**
 * 堆溢出示例
 * 可以通过调整参数值，看看内存溢出时候GC的情况
 * VM-args:-Xms20m -Xmx20m -Xmn10m -XX:+PrintGCDetails -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=D:\tempwork\headoom.dump
 */
public class HeapOOM {
	static class OOMObject{
		private static String test="test";
	}

	public static void main(String[] args) {
		List<OOMObject> list = new ArrayList<>();
		while(true){
			list.add(new OOMObject());
		}
	}
}
```


### 1.3 方法区、数据元区参数控制
- -XX:PermSize 永久代初始大小
- -XX:MaxPermSize （永久区，jdk8之后为metaspace）
- -XX:MetaspaceSize=8m 元数据区初始大小
- -XX:MaxMetaspaceSize=80m 元数据区最大值
- -XX:CompressedClassSpaceSize=512m class压缩大小

元数据区内存溢出示例
```java
/**
 * 数据元区溢出示例
 * 数据元区存储的是类的信息，所以通过cglib不断的创建类，就可以使元数据区内存溢出，
 * 默认元数据区就是机器的物理内存，所以测试设置下最大值测试比较稳妥
 * VM-args: -Xms256m -Xmx256m -Xmn128m -XX:MetaspaceSize=5m -XX:MaxMetaspaceSize=9m -XX:+PrintGCDetails
 */
public class MetaspaceOOM {

    public static void main(String[] args) {
        int i = 0;

        try {
            while (true) {
                i++;

                Enhancer enhancer = new Enhancer();
                enhancer.setSuperclass(MetaspaceOOMObj.class);
                enhancer.setUseCache(false);
                enhancer.setCallback(new MethodInterceptor() {
                    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
                        return proxy.invokeSuper(obj, args);
                    }
                });
                enhancer.create();
            }
        } catch (Exception e) {
            System.out.println("第" + i + "次时发生异常");
            e.printStackTrace();
        }
    }

    static class MetaspaceOOMObj {
//        public static final String test = "test";
    }
}
```

### 1.4 栈区参数控制
- -Xss 栈空间大小

栈空间大小示例：
```java
/**
 * 栈溢出示例
 * 栈存储的方法的局部变量、操作栈、动态链接、返回地址。想要它溢出，使用一个没有结束的递归调用即可。
 * VM-args: -Xss128k  -XX:+PrintGCDetails -Xloggc:log/gc.log
 * 修改Xss的值，查看调用的栈的深度
 */
public class JavaVMStackSOF {

	private int stackLength = 1;

	public void staticLeak() {
		stackLength++;
		staticLeak();
	}

	public static void main(String[] args) {
		JavaVMStackSOF oom = new JavaVMStackSOF();
		try {
			oom.staticLeak();
		}catch(Throwable e){
			System.out.println("static length: "+ oom.stackLength);
//			throw e;
		}
	}
}
```

## 2 参数配置估算(内存估算)

### 2.1 参数基本策略

>各分区的大小对GC的性能影响很大。如何将各分区调整到合适的大小，分析活跃数据的大小是很好的切入点。
>
>活跃数据的大小是指，应用程序稳定运行时长期存活对象在堆中占用的空间大小，也就是Full GC后堆中老年代占用空间的大小。
>可以通过GC日志中Full GC之后老年代数据大小得出，比较准确的方法是在程序稳定后，多次获取GC数据，通过取平均值的方式计算活跃数据的大小。活跃数据和各分区之间的比例关系如下：
>
>空间|	倍数
>---|--
>总大小|	3-4 倍活跃数据的大小
>新生代|	1-1.5 活跃数据的大小
>老年代|	2-3 倍活跃数据的大小
>永久代|	1.2-1.5 倍Full GC后的永久代空间占用

例如，根据GC日志获得老年代的活跃数据大小为300M，那么各分区大小可以设为：

- 总堆：1200MB = 300MB × 4* 
- 新生代：450MB = 300MB × 1.5* 
- 老年代： 750MB = 1200MB - 450MB*

这部分设置仅仅是堆大小的初始值，后面的优化中，可能会调整这些值，具体情况取决于应用程序的特性和需求。

参考：[从实际案例聊聊Java应用的GC优化](https://tech.meituan.com/2017/12/29/jvm-optimize.html)

### 2.2 参数估算示例

参考示例：[每天百万交易的支付系统，生产环境该怎么设置JVM堆内存大小](https://youyou-tech.com/2019/11/22/%E6%AF%8F%E5%A4%A9%E7%99%BE%E4%B8%87%E4%BA%A4%E6%98%93%E7%9A%84%E6%94%AF%E4%BB%98%E7%B3%BB%E7%BB%9F%EF%BC%8C%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E8%AF%A5%E6%80%8E%E4%B9%88%E8%AE%BE/)


## 3 问题排查

通常我们在线上遇到JVM的问题大概有两种： 内存溢出（内存占用过大）、频繁GC或者FullGC。

### 3.1 JVM常见问题排查思路

**分析工具**

1. `ps`，查看进程id 
2. `top -p [pid] -H`，top命令：Linux命令。可以查看实时的内存使用情况。
3. `jstack -l [pid] > stack.log`，jstack跟踪堆栈信息。
4. `jmap -histo:live [pid]`，然后分析具体的对象数目和占用内存大小，从而定位代码。
5. `jmap -dump:live,format=b,file=xxx.xxx [pid]`，然后利用MAT工具分析是否存在内存泄漏等等。
6. 使用VisualVm 进行分析

`pmap -x [pid]` 查看进程的内存映射情况

**总结**
1. 如果有OOM的话，根据分析dump的情况，结合代码看是或否是代码的漏洞，如果有代码漏洞，修复代码(如：不小心写了产生死循环的代码)
2. 如果代码没有问题，可能是之前JVM设置的内存过小，调整JVM参数设置
3. 如果没有OOM，而是频繁的GC。分析调整 young old 的占比(-XX:NewRatio)，survivor的占比(-XX:SurvivorRatio)，考虑年轻代和老年代大小是否合适。

### 3.2 JVM常见问题排查示例

- [从一次线上故障思考Java问题定位思路](https://www.cnblogs.com/QG-whz/p/9647614.html)
- [jvm疯狂吞占内存，罪魁祸首是谁？](https://www.analysys.cn/article/detail/20019016)
- [记一次生产频繁出现 Full GC 的 GC日志图文详解](https://cloud.tencent.com/developer/article/1552089)

---

参考资料

- [JVM内存模型分析04篇-调优工具使用介绍](https://zhuanlan.zhihu.com/p/36597907)
- [从一次线上故障思考Java问题定位思路](https://www.cnblogs.com/QG-whz/p/9647614.html)
- [jvm疯狂吞占内存，罪魁祸首是谁？](https://www.analysys.cn/article/detail/20019016)
- [从实际案例聊聊Java应用的GC优化](https://tech.meituan.com/2017/12/29/jvm-optimize.html)
- [记一次生产频繁出现 Full GC 的 GC日志图文详解](https://cloud.tencent.com/developer/article/1552089)
- [一步步优化JVM四：决定Java堆的大小以及内存占用](https://my.oschina.net/u/347386/blog/1552781)
- [每天百万交易的支付系统，生产环境该怎么设置JVM堆内存大小](https://youyou-tech.com/2019/11/22/%E6%AF%8F%E5%A4%A9%E7%99%BE%E4%B8%87%E4%BA%A4%E6%98%93%E7%9A%84%E6%94%AF%E4%BB%98%E7%B3%BB%E7%BB%9F%EF%BC%8C%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E8%AF%A5%E6%80%8E%E4%B9%88%E8%AE%BE/)

{{comment}}