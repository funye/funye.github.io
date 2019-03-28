
# java的线程Thread

>现在的操作系统是多任务操作系统。多线程是实现多任务的一种方式。
>
>进程是指一个内存中运行的应用程序，每个进程都有自己独立的一块内存空间，一个进程中可以启动多个线程。比如在Windows系统中，一个运行的exe就是一个进程。
>
>线程是指进程中的一个执行流程，一个进程中可以运行多个线程。比如java.exe进程中可以运行很多线程。线程总是属于某个进程，进程中的多个线程共享进程的内存。

引用网上对线程的一个说法，个人觉得比较的形象

## 线程的创建和启动

### 线程创建
创建线程方式主要有两个：
1. 继承Thread类，利用构造方法创建一个线程
2. 实现Runnable接口。在利用带Runnable参数的构造方法

看例子：

**1. 实现Thread类**

```java
 class PrimeThread extends Thread {
         long minPrime;
         PrimeThread(long minPrime) {
             this.minPrime = minPrime;
         }

         public void run() {
             // compute primes larger than minPrime
              . . .
         }
     }
     
 PrimeThread p = new PrimeThread(143);
 p.start();

```

**2. 实现Runnable 接口**

```java
 class PrimeRun implements Runnable {
         long minPrime;
         PrimeRun(long minPrime) {
             this.minPrime = minPrime;
         }

         public void run() {
             // compute primes larger than minPrime
              . . .
         }
     }

PrimeRun p = new PrimeRun(143);
     new Thread(p).start();

```

### Thread和Runnable

看了上面分别使用继承的方式和runnable接口的方式，那他们又有何不同呢

其实看看两者的代码区别就知道了，如果继承的话，每次new Thread创建一个新的线程，然而runnable的方式虽然也是每次new Thread() ，但是，**构造方法中的runnable可以是同一个也可以是每次new一个**。这点可以有很大的区别，可以很好利用

假如我们线程有个自己的私有成员，对应使用继承Thread 的方式，每次new ,这个私有成员一定是自己所有的。但是使用runnable的话，就不一定了。

```java

package com.fun.thread;

/**
 * 实现runnable接口的任务类
 *
 * @author fun
 * @version v1.0.0
 * @create 2017-03-13 21:46
 */
public class TestTask implements Runnable {

    private int taskId;
    volatile private int count; // 可以做共享变量

    public TestTask(int taskId,int count) {
        this.taskId = taskId;
        this.count = count;
    }

    @Override
    public void run() {
        System.out.println("taskId is:"+taskId+" , count is:"+count);
        try {
            System.out.println("threadId: "+Thread.currentThread().getId()+
                    ", threadName: "+Thread.currentThread().getName()+
                    ",isDaemon " + Thread.currentThread().isDaemon());
            Thread.sleep(200);
            count--;
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

```

上面这段代码是一个实现runnable接口的任务。请看在使用时候的区别

```java
@Test
	public void test1() throws InterruptedException {
		// 1. 每个线程都有一个新的Runnable
		for (int i = 0; i < 10; i++) {
			new Thread(new TestTask(i + 1, 10)).start();
			Thread.sleep(200);
		}
	}

	@Test
	public void test2()  throws InterruptedException {
		TestTask testTask = new TestTask(1, 10);
		for (int i = 0; i < 10; i++) {
			new Thread(testTask).start();
			Thread.sleep(200);
		}
	}

```

上面结果

1. test1中，每次new TestTask传递给Thread,所以打印的都是count=10
2. test2中，每个Thread其实都是用的一个runnable构造，这个时候他们共享TestTask的count值。打印的count减小了

所以这里可以利用这个特点处理共享资源，只要合理加锁，就可以处理好共享资源，如上面count加上volatile 保证可见性，再count-- 加块级锁就ok

### 线程启动

之前也有代码使用过线程，线程启动一般使用 start() 或者 run() 但是一般建议是start()

为什么建议使用start() ?

**其实使用run()和start()，最终都是调用的run,最重要的区别在于，执行方法的线程是谁。
使用 start() 方法，是新建立的线程在执行，然而使用run()时候，是run()调用处的线程**（如果在主线程直接调用了run() ,操作run()的线程就是main,并不是生成的新的线程）

```java

@Test
public void testRunAndStartDiff() {

	System.out.println("main threadId: "+Thread.currentThread().getId()+
					",main threadName: "+Thread.currentThread().getName()+
					",isDaemon " + Thread.currentThread().isDaemon());
	Thread t = new Thread(new TestTask(1,10));
	t.start();

	Thread t2 = new Thread(new TestTask(2,20));
	t2.run();
}

main threadId: 1,main threadName: main,isDaemon false
taskId is:2 , count is:20
threadId: 1, threadName: main,isDaemon false
taskId is:1 , count is:10
threadId: 11, threadName: Thread-0,isDaemon false	


```
可以看到 Task 2 是用的run() ,实际上是ThreadId=1 的线程执行的（main）
Task1 是自己生成的线程（ThreadId=11）执行的

所以，注意是谁执行自己，在多线程处理的时候，取Thread.currentThread()注意，是start()启动还是run启动

生活一个开关我们打开了，自己有可能把它关掉在打开。同样，如果一个线程start()之后，我还可以拿着这个Thread 在开始一次吗

例如：
```java
@Test
public void testMultiCallStart() {

	Thread t = new Thread(new TestTask(1,10));
	t.start();
	t.start(); 
}

测试结构是不能再次调用start，直接报java.lang.IllegalThreadStateException

```
跟进start() 方法源码就会发现
```java
if (threadStatus != 0)
            throw new IllegalThreadStateException();
```
start()之前会先判断线程状态,但是如果用 t.run() 是可以多次调用的。也算是start() 和 run()的区别吧 ，**因为直接调用run()其实都没有新建线程**

说到线程状态，那么来看看线程的状态到底有哪些？

## 线程状态

### 线程状态分析
```java
public enum State {
        /**
         * Thread state for a thread which has not yet started.
         */
        NEW,

        /**
         * Thread state for a runnable thread.  A thread in the runnable
         * state is executing in the Java virtual machine but it may
         * be waiting for other resources from the operating system
         * such as processor.
         */
        RUNNABLE,

        /**
         * Thread state for a thread blocked waiting for a monitor lock.
         * A thread in the blocked state is waiting for a monitor lock
         * to enter a synchronized block/method or
         * reenter a synchronized block/method after calling
         * {@link Object#wait() Object.wait}.
         */
        BLOCKED,

        /**
         * Thread state for a waiting thread.
         * A thread is in the waiting state due to calling one of the
         * following methods:
         * <ul>
         *   <li>{@link Object#wait() Object.wait} with no timeout</li>
         *   <li>{@link #join() Thread.join} with no timeout</li>
         *   <li>{@link LockSupport#park() LockSupport.park}</li>
         * </ul>
         *
         * <p>A thread in the waiting state is waiting for another thread to
         * perform a particular action.
         *
         * For example, a thread that has called <tt>Object.wait()</tt>
         * on an object is waiting for another thread to call
         * <tt>Object.notify()</tt> or <tt>Object.notifyAll()</tt> on
         * that object. A thread that has called <tt>Thread.join()</tt>
         * is waiting for a specified thread to terminate.
         */
        WAITING,

        /**
         * Thread state for a waiting thread with a specified waiting time.
         * A thread is in the timed waiting state due to calling one of
         * the following methods with a specified positive waiting time:
         * <ul>
         *   <li>{@link #sleep Thread.sleep}</li>
         *   <li>{@link Object#wait(long) Object.wait} with timeout</li>
         *   <li>{@link #join(long) Thread.join} with timeout</li>
         *   <li>{@link LockSupport#parkNanos LockSupport.parkNanos}</li>
         *   <li>{@link LockSupport#parkUntil LockSupport.parkUntil}</li>
         * </ul>
         */
        TIMED_WAITING,

        /**
         * Thread state for a terminated thread.
         * The thread has completed execution.
         */
        TERMINATED;
    }
```

1. **NEW** 创建完成，但是没有启动
2. **RUNABLE** 运行状态。正在java虚拟中被执行，但是有可能正在等待系统资源，比如处理器资源
3. **BLOCKED** 受阻塞，并在等待监视器锁。线程正在等待监视器锁，以便进入同步方法/块，或者这调用Object.wait()方法后再次进入同步方法/块
4. **WAITING** 等待中，线程调用如下方法会进入等待状态
    1. Object.wait()并且没有超时时间
    2. Thread.join() 并且没有超时时间
    3. LockSupport.park()

例如：已经在某一对象上调用了 Object.wait() 的线程正等待另一个线程，以便在该对象上调用 Object.notify() 或 Object.notifyAll()。
5. **TIMED_WAITING** 指定等待时间的等待，调用如下方法会进入此状态
    1. Thread.sleep()
    2. Object.wait() 指定超时时间
    3. Thread.join() 执行超时时间
    4. LockSupport.parkNanos
    5. LockSupport.parkUntil
6. **TERMINATED** 线程结束，完成执行

### 线程状态转换图

线程状态之间的转换图

![线程状态转换图](http://7xsv3u.com1.z0.glb.clouddn.com/210219518789897.jpg)


## 关于守护线程 Daemon Thread

java中的线程分为两类：**用户线程(User Thread)、守护线程(Daemon Thread)**

守护线程就是程序运行的时候在后台提供一种通用的服务的线程。比如：垃圾回收线程。这种线程并不是程序中不可或缺的，因此，**当所有的非守护线程结束时候，程序也会终止，同时会杀死进程中所有的守护线程**。

用户线程和守护线程几乎没有什么区别，唯一的不同之处在于虚拟机的离开：如果所有的用户线程结束了，守护线程没有守护对象，程序还是会结束。

将线程转换成守护线程可以通过Thread对象的setDaemon(true)方法来实现。使用守护线程需要注意：

>1.  thread.setDaemon(true)必须在thread.start()之前设置，否则会跑出一个IllegalThreadStateException异常。你不能把正在运行的常规线程设置为守护线程。 
>2.  在Daemon线程中产生的新线程也是Daemon的
>3.  守护线程应该永远不去访问固有资源，如文件、数据库，因为它会在任何时候甚至在一个操作的中间发生中断(如：非守护线程都停止了)。

## Thread类常用方法

### start()

start作用就是启动一个线程，他和run()的区别在前面也有说过

需要注意的是，如果多个线程在程序代码中顺序的调用start方法，并能保证两个线程的启动顺序，例如：
```java
Thread
    t1 = new Thread(),
    t1 = new Thread(),
    t1 = new Thread();

t1.start();
t2.start();
t3.start();

```
实际的启动顺序是随机，和cpu的调度有关

### sleep()
sleep(long mills) 是Thread 类的一个今天native的方法，调用sleep线程进入阻塞。参数为0则一直等待。

需要注意的是，**如果线程中获得某个对象的内置锁，在sleep的时候是不会释放锁的，这点和后面要说的wait()不同，wait()是会释放锁的**

>Causes the currently executing thread to sleep (temporarily cease execution) for the specified number of milliseconds, subject to the precision and accuracy of system timers and schedulers. The thread does not lose ownership of any monitors.

以上引用自sleep方法源码上面的解释，最后一句说明了，sleep不释放锁


### interrupt()
调用线程打断，如果线程正因为调用了wait() ,sleep(),join等方法阻塞的时候，就会抛出一个InterruptedException

### wait、notify()/notifyAll()

这三个方法都是Object类实例的方法，**由于这三个方法在使用的时候都涉及到锁的操作(获取和释放)，因此，这三个方法必须要在同步代码块中执行**，否则抛出IllegalMonitorStateException异常。

使用示例：
```java
/**
 * Thread wait方法学习
 *
 * @author fun
 * @version v0.0.1
 * @date 2017-03-21 14:45
 */
public class WaitTest {
	private static volatile Integer o = 0;

	public static void main(String[] args) {

		Thread t1 = new Thread(new Runnable() {
			@Override
			public void run() {
				System.out.println("thread one start..."+System.currentTimeMillis());
				try {
					Thread.sleep(3000);// 让t2先获得o的内置锁
					synchronized (o) {
						System.out.println("notify thread two on object o before..."+System.currentTimeMillis());
						o.notify();
						System.out.println("notify thread two on object o end..."+System.currentTimeMillis());
					}
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				System.out.println("thread one end..."+System.currentTimeMillis());

			}
		});

		Thread t2 = new Thread(new Runnable() {
			@Override
			public void run() {
				synchronized (o) {
					System.out.println("thread two start..."+System.currentTimeMillis());
					try {
						o.wait(0);
						System.out.println("awake...."+System.currentTimeMillis());
						Thread.sleep(1000);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
					System.out.println("thread two end..."+System.currentTimeMillis());
				}
			}
		});

		t2.start();
		t1.start();

	}
}
// output
/*
thread two start...1490176028853
thread one start...1490176028853
notify thread two on object o before...1490176031854
notify thread two on object o end...1490176031854
thread one end...1490176031854
awake....1490176031854
thread two end...1490176032854

*/

```

可以看到，t1 和 t2 都是对Object o 加锁，但是在t2里面o.wait之后，t1就能拿到锁了（awake.... 比 notify xxxx 后打印，t2的同步块没有执行完，锁就释放了），所以可以看出，wait是会释放锁的。

同时程序中为了使t2先拿到锁o从而先wait住，然后让t1 中释放锁o,故意在t1进来后先sleep了。那实际开发中肯定不能这样，实际应该怎样做呢 ？

在多线环境先一般建议在循环中使用wait,使用循环的条件做判断，例如在join的源码中有一段，如果join的是时间传的是0的情况的处理：
```java
if (millis == 0) {
            while (isAlive()) {
                wait(0);
            }
        }
```

这样在线程顺序未知的情况下，依然可以让wait生效

所有借鉴这个，实际生产中，我们控制好循环条件，就可以正确的使用wait了。

总的来说就是： **wait方法会释放锁，当前的线程(上例中的t2)被挂起,且wait方法要在循环中使用，控制好条件来跳出循环**，notify/notifyAll 配饰wait使用

结合上面的例子就是，t2中调用o.wait的时候，t2线程被挂起，不在执行，需要等待唤醒。o.wait() 释放掉t2对o的锁，使t1能够获得o的锁，执行o.notify唤醒t2,然后t2继续执行完成。

### yield()

简单讲就是告诉cpu我可以让出资源，注意是可以，也就是说，具体会不会让出，看cpu的调度了。此方法一般少用

### join()

join方法的实质是wait, 理解join单词的字面意思，也许会更好理解join做的事情。join就是加入，如果线程A里面执行了线程b.join() 就是A线程进入等待，等b线程执行完。再接着执行。 换个角度就像是A在完成一件事的时候，把另外一件事B加进来，所以join就很形象。

示例代码：
```java
/**
 * join方法测试
 *
 * @author fun
 * @version v0.0.1
 * @date 2017-03-21 9:37
 */
public class JoinTest {
	public static void main(String[] args) throws InterruptedException {
		Thread t1 = new Thread(new Runnable() {
			public void run()
			{
				System.out.println("First task started");
				System.out.println("Sleeping for 2 seconds");
				try
				{
					Thread.sleep(2000);
				} catch (InterruptedException e)
				{
					e.printStackTrace();
				}
				System.out.println("First task completed");
			}
		});
		Thread t2 = new Thread(new Runnable(){
			public void run()
			{
				try {
					t1.join();
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				System.out.println("Second task completed");
			}
		});
		t1.start();
		t2.start();
	}
}
// ouput
/*
First task started
Sleeping for 2 seconds
First task completed
Second task completed
*/
```

从结果可以很清楚的看到，t2是在等t1执行完在执行的，哪怕t1中有sleep


**关于join的执行过程，他本质上是执行wait,那又是在哪notify的呢 ？调用join的过程是怎样的呢 ？**

先看源码：
```java
    public final synchronized void join(long millis)
    throws InterruptedException {
        long base = System.currentTimeMillis();
        long now = 0;

        if (millis < 0) {
            throw new IllegalArgumentException("timeout value is negative");
        }

        if (millis == 0) {
            while (isAlive()) {
                wait(0);
            }
        } else {
            while (isAlive()) {
                long delay = millis - now;
                if (delay <= 0) {
                    break;
                }
                wait(delay);
                now = System.currentTimeMillis() - base;
            }
        }
    }
    
    public final void join() throws InterruptedException {
        join(0);
    }
```

首先这个方法是一个Thread的实例的方法，并且注意是个同步的方法（很好理解，前面说的wait方法会操作锁嘛）

就那示例程序分析吧，t1.join() 最后调用到了join(0) ，那么就会进入如下代码块

```java
    if (millis == 0) {
        while (isAlive()) {
            wait(0);
        }
    }
```

这段代码，isAlive是谁在调用，wait(0) 是谁在调用？肯定是调用join的实例也就是t1，那么也就是说这段的逻辑就是如果t1还存活，就一直调用t1.wait() ,而整个代码(t1.join)是在t2里面调用的。

那么，整个意思就是 t2中调用t1.join实际就是判断如果t1.isAlive == true 就调用t1.wait() ，t2 需要获取一个t1内置锁。直到某个地方调用t1.notify 释放t1的内置锁，t2才继续执行。

以上就是join的过程，那么，t1内置锁什么时候释放的呢 ？谁通知的t2(即执行t1.notify)的呢？刚才源码分析没见哪里notify,示例运行t2确实执行了啊，没有一直等待锁啊？

这个之前也困扰我很久，后来在知乎上看到了答案 https://www.zhihu.com/question/44621343 回答者cao解释了。

在线程退出的jvm源码中有如下一段：
```c
作者：cao
链接：https://www.zhihu.com/question/44621343/answer/97640972
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

//一个c++函数：
void JavaThread::exit(bool destroy_vm, ExitType exit_type) ；

//这家伙是啥，就是一个线程执行完毕之后，jvm会做的事，做清理啊收尾工作，
//里面有一个贼不起眼的一行代码，眼神不好还看不到的呢，就是这个：

ensure_join(this);

//翻译成中文叫 确保_join(这个)；代码如下：

static void ensure_join(JavaThread* thread) {
  Handle threadObj(thread, thread->threadObj());

  ObjectLocker lock(threadObj, thread);

  thread->clear_pending_exception();

  java_lang_Thread::set_thread_status(threadObj(), java_lang_Thread::TERMINATED);

  java_lang_Thread::set_thread(threadObj(), NULL);

  //同志们看到了没，别的不用看，就看这一句，妈了个淡淡，
//thread就是当前线程，是啥是啥？就是刚才说的b线程啊。
  lock.notify_all(thread);

  thread->clear_pending_exception();
}
```

这样整个过程就清晰了。t1执行完了之后，对t1内置锁执行了notifyAll(),所有t2被唤醒，执行完成。


## wait-notify/notifyAll 和 循环检测等待的区别

之前有说过，wait和notify可以类似个等待通知，其实不用wait-notify模式也是可以做的，例如现有如下场景：

A让B帮自己去买包烟回来，A等到B把烟买回交给自己的时候，A才给B钱

**wait-notify的模式**

A中
```java
while(!isGetCigarette) { //没有得到烟
    cigarette.wait(0)
}
giveMoneyToB();
```
B中
```java
    // 如果自己买到烟,就通知A 
    cigarette.notify() 
```

**不用wait-notify**

A中
```java
while(!isGetCigarette) { //没有得到烟
    // doNothing
}
giveMoneyToB();
```

B中

```java
    
    // 如果自己买到烟就设置标识为true
    isGetCigarette = true;

```

两种都要求isGetCigarette是一个共享的变量。

那么这两种有什么区别呢 ？ 如果没有区别，是不是wait-notify岂不是没有存在意义 ？

原因就在于：处于wait()中的线程是中断的，被挂起的，不会抢占cpu的计算时间；而相反的，无线循环保证了线程的就绪态，会占用cpu时间。占用cpu即会减少其他线程的计算资源，导致性能下降


















