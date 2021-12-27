---
title: Spring事务传播机制与原理
date: 2021-01-14
categories:
 - 基础框架
tags:
 - spring
 - 事务
---

# Spring事务传播机制与原理

## 1 事务属性与行为

### 1.1 ACID

提到事务，不可避免需要涉及到事务的ACID属性：

- 原子性（Atomicity）：事务作为一个整体被执行，包含在其中的对数据库的操作要么全部被执行，要么都不执行。
- 一致性（Consistency）：事务应确保数据库的状态从一个一致状态转变为另一个一致状态。一致状态的含义是数据库中的数据应满足完整性约束。
- 隔离性（Isolation）：多个事务并发执行时，一个事务的执行不应影响其他事务的执行。
- 持久性（Durability）：已被提交的事务对数据库的修改应该永久保存在数据库中。

我们将严格遵循ACID属性的事务称为刚性事务。与之相对，期望最终一致性，在事务执行的中间状态允许暂时不遵循ACID属性的事务称为柔性事务，柔性事务的使用涉及到分布式事务方案

### 1.2 隔离级别
根据SQL92标准，MySQL的InnoDB引擎提供四种隔离级别（即ACID中的I）：
- 读未提交（READ UNCOMMITTED）
- 读已提交（READ COMMITTED）
- 可重复读（REPEATABLE READ）
- 串行化（SERIALIZABLE），InnoDB默认的隔离级别是REPEATABLE READ，其可避免脏读和不可重复读，但不能避免幻读，需要指出的是，InnoDB引擎的多版本并发控制机制（MVCC）并没有完全避免幻读，关于该问题以及隔离级别说明

## 2 Spring事务隔离级别

spring在处理事务隔离级别上和mysql类似, 在 Isolation 定义了5中事务隔离级别


- **DEFAULT**(TransactionDefinition.ISOLATION_DEFAULT)：spring 默认级别，即使用数据库定义的隔离级别
- **READ_UNCOMMITTED**(TransactionDefinition.ISOLATION_READ_UNCOMMITTED)： 读未提交
- **READ_COMMITTED**(TransactionDefinition.ISOLATION_READ_COMMITTED)：读已提交
- **REPEATABLE_READ**(TransactionDefinition.ISOLATION_REPEATABLE_READ)：可重复读
- **SERIALIZABLE**(TransactionDefinition.ISOLATION_SERIALIZABLE)：串行化

## 3 Spring事务传播机制

### 3.1 事务传播条件限制
因为 spring 是使用 aop 来代理事务控制 ，是针对于接口或类的，所以在同一个 service 类中两个方法的调用，传播机制是不生效的。关于具体的实现原理，下一节会具体分析。

### 3.2 事务传播类型

事务传播类型定义在枚举类 Propagation 中

下面的类型都是针对于被调用方法来说的，理解起来要想象成两个 service 方法的调用才可以。

- **PROPAGATION_REQUIRED (默认)**
  - 支持当前事务，如果当前没有事务，则新建事务
  - 如果当前存在事务，则加入当前事务，合并成一个事务
- **REQUIRES_NEW**
  - 新建事务，如果当前存在事务，则把当前事务挂起
  - 这个方法会独立提交事务，不受调用者的事务影响，父级异常，它也是正常提交
- **NESTED**
  - 如果当前存在事务，它将会成为父级事务的一个子事务，方法结束后并没有提交，只有等父事务结束才提交
  - 如果当前没有事务，则新建事务
  - 如果它异常，父级可以捕获它的异常而不进行回滚，正常提交
  - 但如果父级异常，它必然回滚，这就是和 REQUIRES_NEW 的区别
- **SUPPORTS**
  - 如果当前存在事务，则加入事务
  - 如果当前不存在事务，则以非事务方式运行，这个和不写没区别
- **NOT_SUPPORTED**
  - 以非事务方式运行
  - 如果当前存在事务，则把当前事务挂起
- **MANDATORY**
  - 如果当前存在事务，则运行在当前事务中
  - 如果当前无事务，则抛出异常，也即父级方法必须有事务
- **NEVER**
  - 以非事务方式运行，如果当前存在事务，则抛出异常，即父级方法必须无事务

::: tip
一般用得比较多的是 PROPAGATION_REQUIRED ， REQUIRES_NEW，NESTED

REQUIRES_NEW 一般用在子方法需要单独事务
:::



**事务传播特性示例： https://juejin.cn/post/6844903600943022088  (强烈建议看看)**




## 4 Spring事务实现原理

声明式事务的实现就是通过环绕增强的方式，在目标方法执行之前开启事务，在目标方法执行之后提交或者回滚事务

细节源码分析请参阅：[Spring事务传播行为](https://juejin.cn/post/6844903600943022088)

### 4.1 Spring事务抽象

- PlatformTransactionManager / AbstractPlatformTransactionManager
- TransactionDefinition
- TransactionStatus

接口`PlatformTransactionManager`定义了事务操作的行为，其依赖`TransactionDefinition`和`TransactionStatus`接口，其实大部分的事务属性和行为我们以MySQL数据库为例已经有过了解，这里再对应介绍下。

- `PlatformTransactionManager`：事务管理器
- `getTransaction`方法：事务获取操作，根据事务属性定义，获取当前事务或者创建新事物；
- `commit`方法：事务提交操作，注意这里所说的提交并非直接提交事务，而是根据当前事务状态执行提交或者回滚操作；
- `rollback`方法：事务回滚操作，同样，也并非一定直接回滚事务，也有可能只是标记事务为只读，等待其他调用方执行回滚。
- `TransactionDefinition`：事务属性定义
- `getPropagationBehavior`方法：返回事务的传播属性，默认是`PROPAGATION_REQUIRED`；
- `getIsolationLevel`方法：返回事务隔离级别，事务隔离级别只有在创建新事务时才有效，也就是说只对应传播属性`PROPAGATION_REQUIRED`和`PROPAGATION_REQUIRES_NEW`；
- `getTimeout`方法：返回事务超时时间，以秒为单位，同样只有在创建新事务时才有效；
- `isReadOnly`方法：是否优化为只读事务，支持这项属性的事务管理器会将事务标记为只读，只读事务不允许有写操作，不支持只读属性的事务管理器需要忽略这项设置，这一点跟其他事务属性定义不同，针对其他不支持的属性设置，事务管理器应该抛出异常。
- `getName`方法：返回事务名称，声明式事务中默认值为“类的完全限定名.方法名”。
- `TransactionStatus`：当前事务状态
- `isNewTransaction`方法：当前方法是否创建了新事务（区别于使用现有事务以及没有事务）；
- `hasSavepoint`方法：在嵌套事务场景中，判断当前事务是否包含保存点；
- `setRollbackOnly`和`isRollbackOnly`方法：只读属性设置（主要用于标记事务，等待回滚）和查询；
- `flush`方法：刷新底层会话中的修改到数据库，一般用于刷新如Hibernate/JPA的会话，是否生效由具体事务资源实现决定；
- `isCompleted`方法：判断当前事务是否已完成（已提交或者已回滚）。



### 4.2 Spring事务切面(代理类生成)

- AbstractAutoProxyCreator



### 4.3 Spring事务拦截

- TransactionInterceptor
- MethodInterceptor



### 4.4 Spring事务同步

- AbstractPlatformTransactionManager



## 5 Spring事务失效的几种情况

### 5.1 数据库引擎不支持事务

这里以 MySQL 为例，其 MyISAM 引擎是不支持事务操作的，InnoDB 才是支持事务的引擎，一般要支持事务都会使用 InnoDB



### 5.2 Bean没有被Spring管理

```java
// @Service
public class OrderServiceImpl implements OrderService {

    @Transactional
    public void updateOrder(Order order) {
        // update order
    }

}
```

如果此时把 `@Service` 注解注释掉，这个类就不会被加载成一个 Bean，那这个类就不会被 Spring 管理了，事务自然就失效了。原因在与spring事务管理是基于AOP完成的，没有被Spring管理，自然也AOP不了。

### 5.3 方法不是public的

这个的原因主要是因为AOP切面的时候 不支持非public的方法，切面不生效，自然事务也生效不了



### 5.4 方法自身调用

```	java
@Service
public class OrderServiceImpl implements OrderService {

    public void update(Order order) {
        updateOrder(order);
    }

    @Transactional
    public void updateOrder(Order order) {
        // update order
    }

}
```

因为它们发生了自身调用，就调该类自己的方法，而没有经过 Spring 的代理类，默认只有在外部调用事务才会生效，这也是老生常谈的经典问题了。原因也是AOP的特性导致。



### 5.5 数据源没有配置事务管理器

```java
@Bean
public PlatformTransactionManager transactionManager(DataSource dataSource) {
    return new DataSourceTransactionManager(dataSource);
}
```

要开启事务，必须要加上事务管理器才行。



### 5.6 事务传播机制配置了不支持

```java
@Service
public class OrderServiceImpl implements OrderService {

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void updateOrder(Order order) {
        // update order
    }

}

```

### 5.7 异常捕获没有抛出

```java
// @Service
public class OrderServiceImpl implements OrderService {

    @Transactional
    public void updateOrder(Order order) {
        try {
            // update order
        } catch {

        }
    }

}
```

想这种异常直接捕获，然后不爬出异常，触发不了事务回滚。



### 5.8 异常类型错误

```java
// @Service
public class OrderServiceImpl implements OrderService {

    @Transactional
    public void updateOrder(Order order) {
        try {
            // update order
        } catch {
            throw new Exception("更新错误");
        }
    }

}
```

抛出了Exception ，但是事务要生效需要的是 RuntimeException 才行。



---

参考链接：

- [【技术干货】Spring事务原理一探](https://zhuanlan.zhihu.com/p/54067384)
- [Spring事务传播行为](https://juejin.cn/post/6844903600943022088)
- [Spring事务失效的 8 大原因，这次可以吊打面试官了！](https://zhuanlan.zhihu.com/p/101396825)



