---
title: Java的线程池框架
date: 2020-11-23
categories:
 - Java基础
tags:
 - 线程池
---


# Java的线程池框架


为什么要有线程池 ？

我们知道。使用线程来处理任务，可以达到一定程度的并行计算的效果，在一些比较耗时的操作时候不用一直等待，比如以下i/o操作。那么每次需要的时候就创建一个线程来处理这种任务就好了，为什么要引入线程池这个概念呢？

主要存在三方面的原因：
1. **线程生命周期的开销非常高。** 创建线程是需要时间的，并且需要JVM和底层操作系统提供一些辅助的支持，无限创建线程，必定在创建线程的时候消耗很多资源。
2. **资源消耗。** 活跃的线程必定要占据一定的内存，线程越多，使用的内存越大。当可运行的线程多于可用的处理器数量的时候，线程就会闲置。大量的闲置线程就会占据大量内存，给垃圾回收带来很多的压力。而且这些线程在资源CPU竞争的时候也将产生更大的开销。
3. **稳定性。** 之前的JVM的OOM中有提到过，过多的线程还会可能出现OOM异常。因为线程数量受制于JVM的参数配置，Thread构造方法中的请求栈大小，以及底层操作系统对线程的闲置，一旦超出就会出现OOM的异常
 
所以，使用线程池，用它来管理线程，可以有效的减少因为线程创建和线程数量过多导致的问题


## 1 Executor框架

### 1.1 框架基础
先来看看住基本的框架结构图：

![executor](http://7xsv3u.com1.z0.glb.clouddn.com/executor.png)

**1. 主要元素：**
1. 顶层是一个Executor接口，主要常用的实现类是ThreadPoolExecutor和ScheduledThreadPoolExecutor
2. BlockingQueue接口及其实现
3. Future接口以及实现
4. Executors 创建线程池的关键类

**2. 框架执行原理**

关于执行原理，说到这个问题，不得不说jdk源码的作者写代码真是习惯好，跟进源码，查看Executor接口，在类上面，很大段的解释和说明，还有示例代码来说明。相比周围的我们写的代码，简简单单的几行注释，甚至有的完全写出来就是没有注释，试问这样代码怎么看。很多时候我觉得写代码好不好，代码风格和格式很重要。

回答我们刚才的话题，一起来看看Executor接口上面的注释吧 

**2.1 Excutor接口**

我们去看源码就发现，`Executor`接口只有个方核心方法`execute`,接收的参数是`Runnable`。Runnable在jdk里面，我们都称之为Task也就是要执行的任务，使用Executor可是避免我们反复的使用`new Thread(new(RunnableTask())).start()`。当有很多任务需要执行的时候，可以如下的方式：
```java
// 异步执行任务
 Executor executor = anExecutor; // 此处伪代码，实现时候就是使用Executors创建一个子类
 executor.execute(new RunnableTask1());
 executor.execute(new RunnableTask2());
 ...
```

上面的代码，会使得多个任务异步的执行。在executor源码注释上有写明，这个接口也可以不要求任务是异步执行的，一个简单例子就是直接执行提交的任务的run方法
```java
// 直接同步执行
class DirectExecutor implements Executor {
    public void execute(Runnable r) {
        r.run();
    }
}
```

但是更典型的方式使用一个线程来执行任务而不是使用run方法，例如：
```java
// 每个任务一个线程异步去执行
class ThreadPerTaskExecutor implements Executor {
    public void execute(Runnable r) {
        new Thread(r).start();
    }
}
```

而在Executor框架中，`Executor`的实现类都是解决的批量任务的执行顺序和时间的问题。下面的例子是一个顺序执行的Executor的一个实现。
```java
// 多任务顺序执行
class SerialExecutor implements Executor {
    final Queue<Runnable> tasks = new ArrayDeque<Runnable>();
    final Executor executor;
    Runnable active;

    SerialExecutor(Executor executor) {
        this.executor = executor;
    }

    public synchronized void execute(final Runnable r) {
        tasks.offer(new Runnable() {
            public void run() {
                try {
                    r.run();
                } finally {
                    scheduleNext();
                }
            }
        });
        if (active == null) {
            scheduleNext();
        }
    }
 
    protected synchronized void scheduleNext() {
        if ((active = tasks.poll()) != null) {
            executor.execute(active);
        }
    }
}

```
上面这个例子基本能简单表现出执行任务的思路，值得注意的一点就是，这个jdk注释中的例子在executor中引入了一个任务队列，再把队列中的任务取出顺序执行。在JDK提供的Executor的实现类中，使用workQueue来存储需要执行的任务，使用一个Worker集合works来执行任务（不同于上例中的顺序执行，且上例中工作线程相当于只有一个）。执行Worker启动后执行完自己的runnable后还会从workQueue中继续获取任务执行，直到任务队列为空。

**2.2 ExecutorService 接口**

ExecutorService接口继承自Executor 接口，主要增加了线程生命周几管理的几个方法以及Future 来跟踪任务一个或多个异步任务的处理情况。

其中
1. shutDown() 关闭executor，已经提交的任务会被执行，新的任务不会再接受 
2. shutDownNow() 立即关闭executor,停止执行，并返回一个等待执行的任务列表
3. isShutDown() executor是否终止
4. isTerminated() 所有任务执行完成，只有在调用了shutDown或者shutDownNow之后，才会返回true
5. submit() 几种提交任务的方式 

**2.3 Executors**

提供各种方法创建线程池，从大的方向看，线程主要分为两类，一种就是不同的异步执行的，一种就是实现了ScheduledExecutorService 接口的线程，两类线程的区别在于在于ScheduledExecutorService是那种有计划执行的任务，比如说定时任务或者延时执行的任务。

具体使用查看Executors.newXXX() 相关文档

### 1.2 ThreadPoolExecutor & ScheduledThreadPoolExecutor
ThreadPoolExecutor 和 ScheduledThreadPoolExecutor 都是executorService的实现类，他们关系从之前类图已经可以清楚地看出来。基本使用差不多，却别就在于定位或者延时功能。所以本文只分析ThreadPoolExecutor的源码，来看看线程池的工作大致流程。
#### 1.2.1 ThreadPoolExecutor源码分析

在分析源码前，我根据个人的理解，先简单说明线程池工作的流程，在进入代码查看。

之前在看JDK的Executor接口的文档的时候，在源码上面的标准注释里面的例子（也是生成的javadoc里面的注释）的最后一个，有提到过一个概念，**任务队列**。前文还简单说了下具体实现类和那个例子的不同。现在来具体看看，在说之前，先明白几个概念。
1. 工作队列 `BlockingQueue<Runnable> workQueue`。存放所有的runnable任务。
2. 工作线程集合 `HashSet<Worker> workers`。线程池中所有的工作线程集合

Runnable都清楚是什么，Woker呢，先看看worker类可能更能方便理解线程池的工作过程

```java
// Woker
private final class Worker
        extends AbstractQueuedSynchronizer
        implements Runnable
    {
        /**
         * This class will never be serialized, but we provide a
         * serialVersionUID to suppress a javac warning.
         */
        private static final long serialVersionUID = 6138294804551838833L;

        /** Thread this worker is running in.  Null if factory fails. */
        final Thread thread;
        /** Initial task to run.  Possibly null. */
        Runnable firstTask;
        /** Per-thread task counter */
        volatile long completedTasks;

        /**
         * Creates with given first task and thread from ThreadFactory.
         * @param firstTask the first task (null if none)
         */
        Worker(Runnable firstTask) {
            setState(-1); // inhibit interrupts until runWorker
            this.firstTask = firstTask;
            this.thread = getThreadFactory().newThread(this);
        }

        /** Delegates main run loop to outer runWorker  */
        public void run() {
            runWorker(this);
        }
.....
```

很明显就是有个线程，一个任务，和任务完成数量，核心方法是runWorker

```java
// runWorker
final void runWorker(Worker w) {
        Thread wt = Thread.currentThread();
        Runnable task = w.firstTask;
        w.firstTask = null;
        w.unlock(); // allow interrupts
        boolean completedAbruptly = true;
        try {
            while (task != null || (task = getTask()) != null) {
                w.lock();
                // If pool is stopping, ensure thread is interrupted;
                // if not, ensure thread is not interrupted.  This
                // requires a recheck in second case to deal with
                // shutdownNow race while clearing interrupt
                if ((runStateAtLeast(ctl.get(), STOP) ||
                     (Thread.interrupted() &&
                      runStateAtLeast(ctl.get(), STOP))) &&
                    !wt.isInterrupted())
                    wt.interrupt();
                try {
                    beforeExecute(wt, task);
                    Throwable thrown = null;
                    try {
                        task.run();
                    } catch (RuntimeException x) {
                        thrown = x; throw x;
                    } catch (Error x) {
                        thrown = x; throw x;
                    } catch (Throwable x) {
                        thrown = x; throw new Error(x);
                    } finally {
                        afterExecute(task, thrown);
                    }
                } finally {
                    task = null;
                    w.completedTasks++;
                    w.unlock();
                }
            }
            completedAbruptly = false;
        } finally {
            processWorkerExit(w, completedAbruptly);
        }
    }
```

runWorker做的事情很明确，如果Worker创建的时候带了任务，则执行这个任务的run()方法，如果没有就去执行getTask()在workQueue中获得一个任务来执行，直到没任务可执行为止。

在回头看execute方法：
```java
public void execute(Runnable command) {
        if (command == null)
            throw new NullPointerException();
        /*
         * Proceed in 3 steps:
         *
         * 1. If fewer than corePoolSize threads are running, try to
         * start a new thread with the given command as its first
         * task.  The call to addWorker atomically checks runState and
         * workerCount, and so prevents false alarms that would add
         * threads when it shouldn't, by returning false.
         *
         * 2. If a task can be successfully queued, then we still need
         * to double-check whether we should have added a thread
         * (because existing ones died since last checking) or that
         * the pool shut down since entry into this method. So we
         * recheck state and if necessary roll back the enqueuing if
         * stopped, or start a new thread if there are none.
         *
         * 3. If we cannot queue task, then we try to add a new
         * thread.  If it fails, we know we are shut down or saturated
         * and so reject the task.
         */
        int c = ctl.get();
        if (workerCountOf(c) < corePoolSize) {
            if (addWorker(command, true))
                return;
            c = ctl.get();
        }
        if (isRunning(c) && workQueue.offer(command)) {
            int recheck = ctl.get();
            if (! isRunning(recheck) && remove(command))
                reject(command);
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        else if (!addWorker(command, false))
            reject(command);
    }
```

这段执行逻辑：
1. 查看当前Worker(工作线程)数量有没有达到coreSize,没有就创建一个工作线程
2. 如果线程池没有关闭，并且添加到队列成功，再次执行下检测，或者拒绝，或者由于工作线程没有重新添加工作线程。这个分支需要注意的是，可能这个分支走完只添加了任务，没有添加线程。也就是重复利用线程。利用已有的工作线程自己去队列中消费任务。例外注意runWorker里面使用的getTask() 实际是个阻塞的，一直循环在取队列中的任务，取不到一直循环，这个线程就会一直在。runWorker也是个死循环一直执行task.run。所以线程中的线程其实一直在运行的。但是getActiveCount 是去`HashSet<Worker>` workers 里面的上锁(在执行run的线程，而不是在getTask的)的线程数量。
3. 添加任务失败的时候，直接拒绝

这里另外说一下，。

```java
// addWorker 部分代码
...
w = new Worker(firstTask);
 final Thread t = w.thread;
...
  if (workerAdded) {
        t.start();
        workerStarted = true;
    }
...
```
addWorker最后会启动worker的私有属性thread的线程，开始执行runWorker,同事把worker添加到`HashSet<Worker>`中
由于worker的构造函数中`this.thread = getThreadFactory().newThread(this);` 所以woker的thread启动的时候，执行的就是Wroker的run，即threadPoolExecutor的runWorker方法。整个执行链如下：

`ThreadPoolExecutor.execute()-->addWorkder(可能添加成功或者失败，失败是涉及到拒绝处理问题)-->Workder.thread.start()-->Worker.run-->threadPoolExecutor.runWorker-->循环执行getTask、task.run`

以上就是线程基本的执行流程了，观察ThreadPoolExecutor的完整参数的构造方法发现：
```java
public ThreadPoolExecutor(int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) {
```

其中ThreadFactory 是用来创建Worker的thread用的，管理所有的线程。
RejectedExecutionHandler handler是在addWorker的时候如果添加失败，执行的饱和策略。JUC(java.util.concurrent)包中有提供几种实现。也可以根据需要自己实现自己的饱和策略。

#### 1.2.2 Exexutors.newXXX的参数意义和是使用时候注意的问题

1. **newFixedThreadPool**
创建一个固定长度的线程池，每次提交任务就会创建线程，知道达到最大线程数。如果线程发生Exception死掉，会新补充线程进来。默认工作队列最大长度是Integer.MXA_VALUE。认为是一个无界的队列

2. **newCachedThreadPool**
创建一个可缓存的线程池，如果线程池的当前规模超出了处理需求，就回收空闲线程，如果需求增加就添加新的线程。线程值规模不受限制，所以在使用的时候，操作不当可能创建很多线程导致OOM。
使用的队列是SynchronousQueue.
 
3. **newScheduledThreadPool**
创建固定长度线程池，而且以延迟或定时的方式来执行任务

4. **newSingleThreadExecutor、newSingleThreadScheduledExecutor**
创建一个单线程的Executor，如果单个线程出现Exeception死掉，就是创建一个线程来替代。他可以确保任务队列中的任务是顺序执行的。

## 2 线程池任务管理Queue&Deque
ThreadPoolExecutor提供了三中队列方式：无界队列、有界对列、同步移交。队列的选择与其他的参数有关，例如：线程池的大小。

**无界、有界队列**。使用无界队列当线程池中的线程都处于忙碌状态的时候，工作队列就会无限制的增长。一种更加稳妥的方式使用有界队列，例如：ArrayBlockingQueue，有界LinkedBlockingQueue，PriorityBlockingQueue。有界队列有助于避免资源耗尽情况的发生，但是就需要考虑队列填满时候的饱和策略问题。

**同步移交**。对于非常大或者无界的线程池，可以使用SynchronousQueue来避免任务排队，以及直接将任务从生产者直接移交给工作线程，移交的时候必须要求有线程等待接受，如果没有切线程池线程数小于最大线程，就创建线程接受，否则就拒绝。

**执行顺序** 。ArrayBlockingQueue 和 PriorityBlockingQueue是FIFO类型队列，如果想进一步的控制任务执行的顺序，可以使用PriorityBlockingQueue来进行管理，任务优先级是通过自然顺序或者Comparator接口来定义的。

**注意：只有当任务相互独立是，为线程池或者工作队列设置界限才是合理的，如果任务之间存在依赖，那么有界的线程池或者队列就可能导致“饥饿”死锁问题**

## 3 线程池饱和策略RejectedExecutionHandler
当有界队列被填满的时候，饱和策略就开始发挥作用了。ThreadPoolExecutor的饱和策略可以通过调用setRejectedExecutionHandler来修改。JDK提供了四种默认的饱和策略。

**AbortPolicy** 默认策略，抛出一个未经检测的RejectedExecutionException,调用者捕获这个异常，根据自己的需求编写自己的代码。

**DiscardPolicy** 抛弃策略， 当新的任务无法添加到队列的时候，默默的抛弃该任务

**DiscardOldestPolicy** 抛弃最早策略，次策略会抛弃写一个要执行的任务，然后尝试提交任务
```java
 public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
    if (!e.isShutdown()) {
        e.getQueue().poll();
        e.execute(r);
    }
}
```
因此如果是个优先队列，则抛弃优先级最高的策略，所有不建议这个策略和优先队列一起使用

**CallerRunsPolicy** 调用者直接执行run策略，这种直接在调用者的线程执行任务的run方法。
```java
public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
    if (!e.isShutdown()) {
        r.run();
    }
}
```
因为直接下调用者里面执行的任务，所有会是一个同步的效果，就会带来响应的延时。

以上四种是JDK提供的策略，我们还可以根据自己的需要，自己实现RejectedExecutionHandler，实现我们自己的饱和策略。


## 4 线程池如何重复利用线程的？

### 4.1 ThreadFactory

线程工厂是创建线程的地方，实际就是创建工作线程。

```java 
// DefaultthreadFactory
public Thread newThread(Runnable r) {
    Thread t = new Thread(group, r,
                          namePrefix + threadNumber.getAndIncrement(),
                          0);
    if (t.isDaemon())
        t.setDaemon(false);
    if (t.getPriority() != Thread.NORM_PRIORITY)
        t.setPriority(Thread.NORM_PRIORITY);
    return t;
}
```

### 4.2 线程池如何重复利用线程？

通过前面对线程池的理解，线程池的实现思路基本有一定的了解，那么线程池究竟如何重复利用线程的呢？

其实这里的“重复” 并没有放开重新获取，而是工作线程一直运行。当运行的线程数量没有达到coreSize的时候，不管任务多少，新来任务会重新创建工作线程。工作线程中执行的是死循环一直获取任务来执行。通过使用工作线程来执行任务的run方法达到避免创建线程的目的。前面源码分析部分，查看execute、addWorker、runWorker、getTask 四个方法就很明了。

1. execute: 添加工作线程，或者只添加任务、或者拒绝任务
2. addWorker: 实际上的创建工作线程，并start
3. runWorker: 工作线程的run方法里面执行的代码，循环取队列的中的任务进行执行。
4. getTask: 一直去任务，队列为空就一直循环直到取到值或者线程池关闭。

所以线程池的工作线程一点启动，是一直在运行的。没有任务可执行的时候，也是在执行，只不过这个时候是阻塞在了getTask方法中。所以千万不要理解成线程池做完任务就把线程放回去，要用的时候在拿出来。

