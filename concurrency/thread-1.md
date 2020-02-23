<!-- toc -->

## 线程的一些基本概念

>编写线程安全的代码，其核心在于要对状态访问进行管理，特别是对共享（Shared）和可变（Mutable）状态的访问

（引自：《Java并发编程实战》）
>从非正式的意义上来说，对象的状态是指存储在状态变量（例如示例或静态域）中的数据

（引自：《Java并发编程实战》）

## 共享(Shared)与可变(Mutable)
>“共享” 意味着变量可以由多个线程同时访问，二“可变”则意味着变量的值在其生命周期内可以发现变化

（引自：《Java并发编程实战》）

这些可变的变量在被多个线程访问的时候，如何防止这些改变不受控制,解决方法如下：

>1、不在线程中共享该状态变量，可以将变量封装到方法中。
>
>2、将状态变量修改为不可变的变量（final）。
>
>3、访问状态变量时使用同步策略。
>
>4、使用原子变量类。
    

## 线程安全性
>线程安全是一个比较复杂的概念。其核心概念就是正确性。所谓正确性就是某各类的行为与其规范完全一致，即其近似与“所见即所知（we know it when we see it）”。当多个线程访问某各类时，不管运行时环境采用何种调度方式或者这些线程将如何交替执行，并且在主调代码中不需要任何额外的同步或者协同，这个类都能表现出正确的行为，那么就称这个类是线程安全的。

（引自：《Java并发编程实战》）

## 原子性、可见性、有序性

**原子性**：一个操作如果是不可分割的，那么这个操作可以被认为是具有原子性的

**可见性**：
线程可见性是指线程之间的可见性，即一个变量的修改对另外一个线程是可见的，这个变量的修改结果，另外一个线程可以立马知道。

**有序性**：
有序性指的是数据不相关的变量在并发的情况下，实际执行的结果和单线程的执行结果是一样的，不会因为重排序的问题导致结果不可预知。volatile, final, synchronized，显式锁都可以保证有序性。


## synchronized (内置锁)
java内置的锁机制synchronized 可以用来保证原子性

同步代码块包括两个部分：一个作为锁的对象引用，一个作为由这个锁保护的代码块。**以synchronized关键字来修饰的方法就是一种横跨整个方法体的同步代码块，其中该同步代码块的锁就是方法调用所在的对象**。静态的synchronized方法已Class对象作为锁

**每个java对象都可以用作一个实现同步的锁，这些锁被称为 内置锁(Intrinsic Lock)或者监视器锁(Monitor Lock)。** 也就是说内置锁是在java对象上面的，普通代码块还在synchronized(内置锁对象) 。同步方法就是在方法调用对象上加锁的 。

**获取【内置锁】的唯一方式就是进入同步锁的代码块或者方法**

java的内置锁是一种互斥锁，这就意味着最多只能有一个线程能持有这种锁。当线程A尝试说去线程B持有的锁的时候，线程A必须等待或者阻塞，直到线程B释放这个锁，否则A就一直等待下去。

例如上面的特性，可以实现一个死锁的例子：
```java
public class DeadLockDemo {

	public static void main(String[] args) {

		DeadLockDemo d = new DeadLockDemo();

		Thread a = new Thread(new Runnable() {
			@Override
			public void run() {
				System.out.println("thread a running...");
				synchronized (d) { // 获得对象d的锁
					System.out.println("thread a get the lock...");
					while (true) {
						// 只是简单的死循环，占用对象d的锁不释放
					}
				}
			}
		});

		Thread b = new Thread(new Runnable() {
			@Override
			public void run() {
				System.out.println("thread b running...");
				synchronized (d) { // 获得对象d的锁
					System.out.println("thread b get the lock...");
				}
			}
		});

		a.start();
		try {
			Thread.sleep(3000); // 确保a先启动，直接顺序start不能保证a比b先启动
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		b.start();
	}
}

// output
/*
thread a running...
thread a get the lock...
thread b running...
*/
```
上面的例子，线程b一直都没有获得锁，一直等待a释放锁，从而导致死锁

## 内置锁的重入

内置锁是可以重入的，也就是说某个线程试图获取他自己持有的锁的时候，这个请求会成功。

>“重入”意味着获取锁的操作粒度是“线程”，而不是“调用”

例如：
```java
/**
 * 测试锁的重入
 *
 * @author fun
 * @version v0.0.1
 * @date 2017-03-22 12:02
 */
public class LockOverride {

	public static class SuperClass {
		public synchronized void doSomething() {
			System.out.println("super do something....");
		}
	}

	public static class SubClass extends SuperClass {
		@Override
		public synchronized void doSomething() {
			System.out.println("sub do something and call super.doSomething()....");
			super.doSomething();
			System.out.println(this);
			System.out.println(super);
		}
	}

	public static void main(String[] args) {
		SubClass sub = new SubClass();
		sub.doSomething();
	}
}

// output
/*
sub do something and call super.doSomething()....
super do something....

*/
```

可以看到，正常打印了结果，分析一下这个代码，在sub.doSomething的是时候和super.doSomething 的时候都需要获得SuperClass的锁，如果锁不能重入的话，就会一直等待，出现死锁。

这个是《java并发编程实践》中对所重入的例子，网上也很多地方都是这个例子，但是我不太理解，子类在调用doSomething的时候，获取应该是子类实例对象的锁才对啊，当运行到super.doSomething的时候，获取父类的内置锁，不冲突啊 ？ 一直很不解

所有我自己根据锁的理解和重入理解，写了个简单点的例子
```java
/**
 * 测试锁的重入
 *
 * @author yehuan
 * @version v0.0.1
 * @date 2017-03-22 12:02
 */
public class LockOverride {

	public static void main(String[] args) {
		LockOverride lo = new LockOverride();

		synchronized (lo) { // 1
			System.out.println("outter get lock on lo....");
			synchronized (lo) { // 2
				System.out.println("inner get lock on lo");
			}
		}
	}
}
//output
/*
outter get lock on lo....
inner get lock on lo

*/
```
结果很明显，两次(注释1，2)同步块入口，获取锁成功了。但是1和2获取同一个锁，没等1释放，2就获得了。应为锁重入，2的时候已经有获得lo的内置锁了。

但是，如果上面代码变成如下方式，即2出变成一个新的线程呢：
```java
public class LockOverride {

	public static void main(String[] args) {
		LockOverride lo = new LockOverride();

		synchronized (lo) { // 1
			System.out.println("outter get lock on lo...."+System.currentTimeMillis());

			new Thread(new Runnable() {
				@Override
				public void run() {
					synchronized (lo) { // 2
						System.out.println("inner get lock on lo..."+System.currentTimeMillis());
					}
				}
			}).start();

			try {
				Thread.sleep(5000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}

		}
	}
}
// output
outter get lock on lo....1490166261911
inner get lock on lo...1490166266912
```
这是时候获取锁的1,2两处实际上是两个线程，所有2等到1释放才执行了里面的代码。这也解释了上面说的锁的获取操作粒度是线程而不是调用。对比也解释了前面的例子能获得锁是因为同一个线程+锁的重入















