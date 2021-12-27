---
title: Spring 的事件机制
date: 2021-12-03
categories:
 - 基础框架
tags:
 - spring


---

# Spring 的事件机制

## 1. 基本流程

在 Spring 容器中通过 `ApplicationEvent` 类和 `ApplicationListener` 接口来处理事件，如果某个 `bean`实现 `ApplicationListener` 接口并被部署到容器中，那么每次对应的 `ApplicationEvent` 被发布到容器中都会通知该 `bean` ,这是典型的观察者模式。

Spring 的事件默认是同步的，即调用 `publishEvent` 方法发布事件后,它会处于阻塞状态,直到 `onApplicationEvent` 接收到事件并处理返回之后才继续执行下去,这种单线程同步的好处是可以进行事务管理。



## 2. 基本使用

一般使用过程按照如下三个步骤：定义事件、定义监听处理逻辑、发布事件

1. 通过  `ApplicationEvent` 类定义事件

示例：

```java
public class MyApplicationEvent extends ApplicationEvent {

    public MyApplicationEvent(Object source) {
        super(source);
    }
}
```



2. 通过 `ApplicationListener`  接口定义事件监听处理逻辑

示例：

```java
@Component
public class MyApplicationListener implements ApplicationListener<MyApplicationEvent> {

    @Override
    public void onApplicationEvent(MyApplicationEvent myApplicationEvent) {

        System.out.println("Default  Listener on event happen...." + myApplicationEvent
                           .getSource().toString());
    }
}
```



3. 通过 `ApplicationEventPublisher` 的 `publishEvent` 发布事件

示例：

```java
ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("application-event.xml");
// ClassPathXmlApplicationContext 实现了ApplicationEventPublisher的publishEvent
ctx.publishEvent(new MyApplicationEvent("HelloEvent")); 
```

此处只是为方便示例，通常有以下两种方式使用

1. 实现 `ApplicationEventPublisherAware`的类，持有一个 `ApplicationEventPublisher` , 通过Aware给  ApplicationEventPublisher ，然后在需要的时候利用这个发布事件。
2. 通过`ApplicationContextAware`方式拿到 `applicationContext`, 使用`context` 发布事件（本质也是`ApplicationEventPublisher`，应为`applicationContext`实现了`ApplicationEventPublisher`的方法）

例如(以下为使用 `ApplicationEventPublisher`， 使用`ApplicationContext` 也是类似的 )：

```java
@Component
public class MyPublisher implements ApplicationEventPublisherAware {

    // 持有一个事件发布器
    private ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        // 通过Aware给applicationEventPublisher赋值
        this.applicationEventPublisher = applicationEventPublisher;
    }

    /**
     * 封装事件发布方法，在需要的发布事件的时候调用
     * @param event
     */
    public void publishEvent(ApplicationEvent event) {
        this.applicationEventPublisher.publishEvent(event);
    }
}


// 使用示例
@Autowired
MyPublisher publisher;

publisher.publishEvent(new MyApplicationEvent("HelloEvent"));

```



## 3. 有序监听

当事件触发之后，监听器监听到事件后进行逻辑处理，然后有时候需要顺序执行的话，可通过实现 `SmartApplicationListener` 来达到顺序监听的目的。通过order方法定义执行的顺序。

示例：

```java
@Component
public class FirstExecuteApplicationListener implements SmartApplicationListener {

    @Override
    public boolean supportsEventType(Class<? extends ApplicationEvent> eventType) {
        if (eventType.equals(MyApplicationEvent.class)) {
            return true;
        }
        return false;
    }

    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        System.out.println("First Listener on event happen...." + event.getSource().toString());
    }


    @Override
    public int getOrder() {
        return 1;
    }
}

@Component
public class SecondExecuteApplicationListener implements SmartApplicationListener {

    @Override
    public boolean supportsEventType(Class<? extends ApplicationEvent> eventType) {
        if (eventType.equals(MyApplicationEvent.class)) {
            return true;
        }
        return false;
    }

    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        System.out.println("Second  Listener on event happen...." + event.getSource().toString());
    }

    @Override
    public int getOrder() {
        return 2;
    }
}

```



## 4. 注解支持

spring事件也支持使用注解的方法定义监听器，使用起来更加方便

示例：

```java
@Component
public class AnnotationWayApplicationListener {

    @Order(3)
    @EventListener(classes = {MyApplicationEvent.class})
    public void onEvent(ApplicationEvent event) {
        System.out.println("Annotation Listener on event happen...." + event.getSource().toString());
    }
}

```



## 5. 异步监听

spring 的事件机制默认是阻塞的，也就是在 pulishEvent 时候，需要等待事件监听器执行完才进入下一步，更多的时候 ，我们可能需要异步执行，例如用户登录后，添加登录日志、添加登录积分等。

使用异步方式要开始spring异步功能 @EnableAsync 。开始异步功能，需要提供一个TaskExecutor.

示例：

```java
@EnableAsync
@Service
public class AsyncApplicationListener {

    @Async
    @Order(4)
    @EventListener(classes = {MyApplicationEvent.class})
    public void onEvent(ApplicationEvent event) throws InterruptedException {
        System.out.println("Async listener start event happen....");
        System.out.println("Async listener event happen...." + event.getSource().toString());
        Thread.sleep(3000);
        System.out.println("Async listener end happen...." + event.getSource().toString());
    }

    @Bean
    public TaskExecutor taskExecutor() {
        ThreadFactory namedThreadFactory = new ThreadFactoryBuilder()
                .setNameFormat("consumer-queue-thread-%d").build();
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        // 线程池维护线程的最少数量
        executor.setCorePoolSize(5);
        // 线程池维护线程的最大数量
        executor.setMaxPoolSize(10);
        // 缓存队列
        executor.setQueueCapacity(25);
        //线程名
        executor.setThreadFactory(namedThreadFactory);
        // 线程池初始化
        executor.initialize();
        return executor;
    }
}

// 测试
public static void main(String[] args) {

        ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("application-event.xml");

        ctx.publishEvent(new MyApplicationEvent("HelloEvent"));

        System.out.println("========started=======");
}

// 执行结果如下:
/* 
        First Listener on event happen....HelloEvent
        Second  Listener on event happen....HelloEvent
        Annotation Listener on event happen....HelloEvent
        Default  Listener on event happen....HelloEvent
        ========started=======
        Async listener start event happen....
        Async listener event happen....HelloEvent
        Async listener end happen....HelloEvent
 */
// AsyncListener 不会在 publishEvent 后阻塞，而是直接继续执行
```





---

参考资料

- [Spring 中的事件机制](https://www.cnblogs.com/rickiyang/p/12001524.html)