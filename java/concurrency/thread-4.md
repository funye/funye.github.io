# JAVA的并发包JUC

## 1 Future与Callable
使用Runnable接口有很大的局限性，他不能够返回一个值或者一个受检查的异常。这种情况下，可以使用Callable<V>接口，其中V就是返回的结果。

Future<V>用来接收callable结束后返回的结果。ExecuteService 的submit方法都是返回一个Future,可以利用Future获取执行的结果，同时可以利用Future取消任务。任务生命周期 创建，提交，执行，结束。如果任务提交，但是没有执行，可以使用Future 取消。

使用线程池(ThreadPoolExecute)的时候，ExecuteService的submit方法实际上使用的是AbstractExecutorService的submit。查看源码可以看到提交任务后返回的是 FutureTask<T>


示例：
```java
package com.fun.concurrent;

import java.util.concurrent.*;

/**
 * callable示例
 *
 * @author fun
 * @date 2017-04-01 10:59
 */
public class FutureCallableDemo {

	public static void main(String[] args) {
		FutureCallableDemo test = new FutureCallableDemo();

		ExecutorService executorService = Executors.newFixedThreadPool(2);
		//do test
//		test.testCallableTask(executorService);
		test.testRunableTask(executorService);
		executorService.shutdown();
	}

	public void testCallableTask(ExecutorService executorService) {
		Callable<String> task = new Callable<String>() {
			@Override
			public String call() throws Exception {
				System.out.println("invoke method call, " + System.currentTimeMillis());
				Thread.sleep(3000);
				System.out.println("method call is going to return, " + System.currentTimeMillis());
				return "SUCCESS";
			}
		};
		Future<String> future = executorService.submit(task);

		System.out.println("main is going to get callable future result, " + System.currentTimeMillis());
		try {
			System.out.println("callable result = " + future.get());
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
		System.out.println("main got the future result, " + System.currentTimeMillis());
	}

	public void testRunableTask(ExecutorService executorService) {
		Runnable runTask = new Runnable() {
			@Override
			public void run() {
				System.out.println("invoke method run, " + System.currentTimeMillis());
				try {
					Thread.sleep(3000);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				System.out.println("method run is going to end, " + System.currentTimeMillis());
			}
		};

		Future<Integer> runFuture = executorService.submit(runTask,new Integer(100));
//		Future<?> runFuture = executorService.submit(runTask); // 这两种方式区别，打开注释观察

		try {
			System.out.println("main is going to get runnable future result, " + System.currentTimeMillis());
			System.out.println("runnable result = " + runFuture.get());
			System.out.println("main got the future result, " + System.currentTimeMillis());
		} catch (InterruptedException e) {
			e.printStackTrace();
		} catch (ExecutionException e) {
			e.printStackTrace();
		}
	}
}

```
执行会发现future.get() 方法是一个阻塞的方法，一直等到任务执行完成得到结果。

**思考**：看上面例子可以看到一个问题，runnable的任务和callable的任务都是可以返回Futrue的，那么他们有什么区别呢 ？ 

观察不难发现，Callable<V> 返回结果是在call方法执行完成后返回的，他返回什么结果可以是call里面的计算得到的，类型为V即可。他的结果是可变的，程序运行返回的是什么就是什么。

但是Runable的返回结果只是提前定义的一个结果，可预期正确执行后的一个结果。他的结果在任务提交的时候已经决定了具体的值。

## 2 原子类 atomic

原子类是如何保证原子操作的？

回答这个问题之前，先一起来看一个原子类的源码

```java
// AtomicInteger部分源码
// AtomicInteegr 加法操作
public final int getAndAdd(int delta) {
    for (;;) {
        int current = get();
        int next = current + delta;
        if (compareAndSet(current, next))
            return current;
    }
}

/**
 * Atomically sets the value to the given updated value
 * if the current value {@code ==} the expected value.
 *
 * @param expect the expected value
 * @param update the new value
 * @return true if successful. False return indicates that
 * the actual value was not equal to the expected value.
 */
public final boolean compareAndSet(int expect, int update) {
    return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
}
```

这段代码很关键的一个地方就是compareAndSwap (CAS) ，每次操作（写）之前，先比较一下值，确认没有被改过，才写数据。在compareAndSet的注释上面也很清楚的可以看到，只有当cuurent value==expect value的时候，才把value更新成update value。整个执行的原则就是： ***先检查后执行***

而compareAndSwapXXX是一个native的方法，是虚拟机底层的实现。

测试示例：
```java
package com.fun.concurrent;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 原子类操作
 *
 * @author fun
 * @date 2017-04-01 12:07
 */
public class AtomicClassDemo {

	public static void main(String[] args) {
		AtomicInteger aint = new AtomicInteger(100);
		boolean b = aint.compareAndSet(100,200); // 修改expect与当前值不同测试
		if (b) {
			System.out.println(aint.get());
		}
		System.out.println(aint.getAndAdd(100));
		System.out.println(aint.get());

		System.out.println("-------------------");
		AtomicClassDemo ref1 = new AtomicClassDemo();
		AtomicClassDemo ref2 = new AtomicClassDemo();
		System.out.println("ref1=" + ref1);
		System.out.println("ref2=" + ref2);
		AtomicReference<AtomicClassDemo> ref3 = new AtomicReference<>(ref1);
		System.out.println("ref3 before set=" + ref3);
		boolean b2 = ref3.compareAndSet(ref2,ref1); // 修改expect为ref1测试
		System.out.println(b2);
		System.out.println("ref3 after set =" + ref3);
	}

}

/**
 output:
 200
 200
 300
 -------------------
 ref1=com.fun.concurrent.AtomicClassDemo@74a14482
 ref2=com.fun.concurrent.AtomicClassDemo@1540e19d
 ref3 before set=com.fun.concurrent.AtomicClassDemo@74a14482
 false
 ref3 after set =com.fun.concurrent.AtomicClassDemo@74a14482
 */
```

## 3 lock与ReentrantLock

此小节重点学习下ReentrantLock,区别于内置锁，ReentrantLock是一个显示锁。他那有那些特性呢？

### 3.1 轮询锁和定时锁
使用tryLock() 方法可以在不能获取到锁的情况下，使用定时或者轮询的方式获取所，执行时间内没有完成就释放锁，平滑的退出任务。而内置锁会阻塞在获取锁的地方，一旦操作不当就可能发生死锁，如果出现死锁了，唯一的解决办法就是重启程序。**使用定时或者轮询锁可以有效的避免死锁的问题**。

转账示例：
```java
package com.fun.concurrent;

import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Created by fun
 * @date 2017/4/12.
 */
public class ReentrantLockDemo {

    public static void main(String[] args) {

        ReentrantLockDemo test = new ReentrantLockDemo();

        Account fromAcct = test.newAccount(4000);
        Account toAcct = test.newAccount(1000);

        test.transferMoney(fromAcct,toAcct,1000L,20000,TimeUnit.NANOSECONDS);

        System.out.println("fromAccount balance=" + fromAcct.getBalance() + "\ntoAccount balance=" + toAcct.getBalance());

    }

    // 转账示例
    public boolean transferMoney(Account fromAcct,
                                 Account toAcct,
                                 long amount,
                                 long timeout,
                                 TimeUnit unit) {
        long stopTime = System.nanoTime() + unit.toNanos(timeout); // 超时时间
        while (true) {
            if (fromAcct.lock.tryLock()) {
                try {
                    if (toAcct.lock.tryLock()) {
                        try {
                            boolean rs = false;
                            if (fromAcct.debit(amount) ){
                                rs = toAcct.credit(amount);
                            }
                            return rs;
                        } finally {
                            toAcct.lock.unlock();
                        }
                    }
                } finally {
                    fromAcct.lock.unlock();
                }
            }
            if (System.nanoTime() > stopTime) { // 如果已经超时了，就直接返回，提前结束任务
                return false;
            }
            try {
                long x = new Random().nextInt(50) + 10;
                Thread.sleep(timeout/x ); // 过一会儿再尝试下一次获取锁
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    protected class Account {
        private Lock lock = new ReentrantLock();

        private long balance;

        public boolean debit(long amount) {
            if (balance < amount) {
                return false;
            }
            balance = balance - amount;
            return true;
        }

        public boolean credit(long amount) {
            balance = balance + amount;
            return true;
        }

        /*getter and setter*/
    }

    public Account newAccount(long balance) {
        Account account = new Account();
        if (balance > 0) {
            account.setBalance(balance);
        } else {
            account.setBalance(0);
        }
        return account;
    }
}

```

在几次获得锁的地方，都是trylock, 在多线程的情况下，如果没有获得锁的时候，线程并不会阻塞，而是之后往后面运行。进入判断是否超时的语句。如果超时就退出，可以避免等待加锁可能出现的死锁问题。

*注意：但是使用显示锁人的时候，很容易在编写程序的时候忘记了释放锁，切记，在使用显示锁的时候一定要在try-finally 的finally里面对锁进行释放。*


### 3.2 可中断的锁操作
lockInterruptibly()方法,可中断的获取锁的方式，在获取锁的过程中可能被中断，方法本身是可以抛出InterruptException的
```
// 此方法源码
 public void lockInterruptibly() throws InterruptedException {
    sync.acquireInterruptibly(1);
 }
```
他的使用和不同lock和tryLock一样，只是需要在外面处理lockInterruptibly的InterruptException.

### 3.3 非块结构加锁
对链表上的每个节点单独建立锁，使不同的线程可以独立的对链表的不同部分进行操作。所得很模糊，需要结合ConcurrentHashMap理解

### 3.4 公平性

公平性是在竞争资源时候的一种策略，大部分情况都是使用公平原则来获取锁，例如：FIFO 队列。但是，有时候前面的操作比较耗时的时候，会拖慢整个处理速率，这个时候不公平原则可以提前获得锁。例如，线程A获得一个对象的锁，现线程B和C都在等待这个锁，当A释放锁的时候，如果B唤醒的时间比较的久，此时C先获得锁，使用了并释放了，B刚好唤醒，获得锁。这个过程B的时间没有耽误。同时C也处理了，增加了吞吐量。但是，我还要说但是。使用不公平性的时候同样会有问题，不公平的比较极端的情况就是找出一个线程一直拿不到锁，一直等待。所以使用时候需要权衡和控制。

ReentrantLock 可以设置不保证公平性。

## 4 CountDownLatch & Semaphore

### 4.1 CountDownLatch

CountDownLatch 有什么作用呢 ？它就是一个同步助手，它能够让一个或者多个线程等到另外的线程完成一系列的操作之后再执行。

内部有一个倒数计数器，当倒数计数器减到0的时候释放锁。

先看示例：
```java
package com.fun.concurrent;

import java.util.concurrent.CountDownLatch;

/**
 * CountDownLatch 使用和测试
 *
 * @author fun
 * @date 2017-04-13 17:50
 */
public class CountDownLatchDemo {

	public static void main(String[] args) {

		CountDownLatchDemo test = new CountDownLatchDemo();

		int N = 10;
		CountDownLatch startSignal = new CountDownLatch(1);
		CountDownLatch doneSignal = new CountDownLatch(N);

		for (int i = 0; i < N; i++) {
			new Thread(test.newWorker(startSignal,doneSignal)).start();
		}

		try {
			System.out.println("do something else 1");
			startSignal.countDown();
			System.out.println("do something else 2");
			doneSignal.await();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}

	}

	public Worker newWorker(CountDownLatch startSignal, CountDownLatch doneSignal){
		return new Worker(startSignal,doneSignal);
	}

	class Worker implements Runnable {

		private final CountDownLatch startSignal;
		private final CountDownLatch doneSignal;

		Worker(CountDownLatch startSignal, CountDownLatch doneSignal) {
			this.startSignal = startSignal;
 			this.doneSignal = doneSignal;
 		}
	 	public void run() {
			try {
				startSignal.await();
				doWork();
				doneSignal.countDown();
			} catch (InterruptedException ex) {} // return;
 		}
		void doWork() {
			try {
				Thread.sleep(200);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			System.out.println("do something...");
		}
	}



}

```
此示例中，所有Runnable共享一个startSignal 和 一个 doneSignal。CountDownLatch的 await() 方法等待计数器变为0在唤醒。而在执行countDown() 方法的时候，每次countDown
就会是计数器减一，知道减少为0才释放。

查看源码中countDown 的过程
```java
// countDown
public void countDown() {
    sync.releaseShared(1);
}

// sync.releaseShared
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}

// tryReleaseShared 在countDownLatch中的Sync中有重写父类的方法
protected boolean tryReleaseShared(int releases) {
    // Decrement count; signal when transition to zero
    for (;;) {
        int c = getState();
        if (c == 0)
            return false;
        int nextc = c-1;
        if (compareAndSetState(c, nextc))
            return nextc == 0;
    }
}
```
很显然，只有当count=0的时候才会释放锁。在回头看上面的示例程序，分析如下：

1. startSignal.countDown(); Runnable任务线程创建并start了，但是出于wait状态，等待计数器变为0，次代码操作把计数器减一变为0，所有任务开始工作。
2. System.out.println("do something else 2");主线程忙其他事情
3. doneSignal.await();所有任务完成之前，主线程从此处开始阻塞(挂起等待)。doneSignal计数器不变为0，主线程一直挂起。完成一个任务，count-1,直到所有任务完成，count=0,主线程醒过来并完成后面的动作。


利用CountDownLacth 能做很多事，例如进项大数据的一个累加，可以分成多个线程处理，然后在主线程中合并(累加)多个任务的结果。增加处理速率（这个有点像MapReduce的思想）。

**思考**： 其实看了CountDownLatch 之后，发现和volatile+synchronized效果很像。完全可以控制一个volatile的count变量等于任务数，完成一个任务，count-1,主线程wait,等到count=0。 效果差不多。但是代码实现上就较CountDownLatch 复杂点。所有有类似这样的功能，应该优先想到CountDownLatch

### 4.2 Semaphore

使用信号量的时候，一个线程想要获得一个item,必须要先从Semaphore那里获得许可(permit)，保证item是可用的。当线程完成任务的时候，在向pool归还item同时还需要向Semaphore归还许可，以便其他线程可以使用item。需要注意的是，**当调用acquire的时候，不需要额外加锁限制，因为这样将会阻止item被归还到pool。** 实际上Semaphore已经封装了同步锁来保证item的获取，并且pool对每个item有单独的维护。

当Semaphore被初始化成一个并且只有之多一个许可的时候，他就表现成了一个互斥锁。这个更像一个Binary Semaphore一样，因为他只有两个状态： 有一个可用许可，没有可用许可。当以这种方式使用的时候，semaphore 和其他Lock的实现不同，他能够允许锁被线程本身释放，而不是锁的所有者。

Semaphore 构造方法有个释放使用公平锁的方式。当使用不公平锁的时候，不保证获取许可的先后顺序。公平性在前文有说过，有时候可以提高吞吐量，避免一直等待。但是也同样也会出现一直获取不到锁也进去一直等待。

Semaphore可以设定一个阈值，基于此，多个线程竞争获取许可信号，做完自己的申请后归还，超过阈值后，线程申请许可信号将会被阻塞。Semaphore可以用来构建一些对象池，资源池之类的，比如数据库连接池

**实现分析：**

Semaphore 实现和CountDownLatch有几分相似：

1. CountDownLatch里面有个count计数器，每次操作countDown 则count = count-1 ,当count==0 的时候才释放所
2. Semaphore 则是内部维护一个available的数量，每次减去获取permits的数量，得到剩余的数量，释放锁的时候available加上归还的permit的数量。获取的锁的过程就是对available减操作，release则是加回对available的操作。

Semaphore默认实现是不公平性的，就以不公平性的实现来看吗：
```java
final int nonfairTryAcquireShared(int acquires) {
    for (;;) {
        int available = getState();
        int remaining = available - acquires;
        if (remaining < 0 ||
            compareAndSetState(available, remaining))
            return remaining;
    }
}

protected final boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        int next = current + releases;
        if (next < current) // overflow
            throw new Error("Maximum permit count exceeded");
        if (compareAndSetState(current, next))
            return true;
    }
}
```
选取源码中关键的两个方法吗，加锁和解锁。

1. **获取permit**： 先使用getState后去当前可用的permit的数量，剩余数量=当前数量-申请的数量，然后再执行CAS设置状态,并返回剩余可用数量。
2. **释放锁**：释放锁的过程时间就是归还permit可用数量的过程。当前可用数量+归还数量 < 当前数量的是时候，或者已经溢出，归还数量为负数了，如果current + releases >=cuurent,执行CAS 设置状态值。
 

## 5 ConcurrentHashMap
使用分段锁(Lock striping)的方式，使锁的粒度更细来实现更大程度的共享，提高并发性和伸缩性。

>锁分段(Lock striping)：在某些情况下，可以将锁分解技术进一步扩展为对一组独立对象上的锁进行分解。这种情况被称为锁分段。

例如： 在concurrentHashMap 中使用一个包含16个锁的数组，每个锁保护一个散列桶，其中第N个散列桶由第（N mod 16）个锁来写入。假设散列函数具有合理性，并且关键字分布均匀，那么这大约能都把对于锁的请求减少到原来1/16。正是这项技术使得ConcurrentHashMap能够支持多大16个并发的写入器。

锁分段劣势： 与采用单个锁来实现独占访问相比，要获取多个锁来实现独占访问将更加困难并且开销更高。例如：ConcurrentHashMap在扩容的时候，以及重新计算Hash并且重新散列分布时候，都需要获取所有锁，实现整个Map的独占访问。

