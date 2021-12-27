---
title: Spring AOP - AOP原理分析
date: 2020-11-23
categories:
 - 基础框架
tags:
 - spring
---

## Spring AOP - AOP原理分析

- Advice 方法级别切面
  - MethodBeforeAdvice  方法前
  - AfterReturningAdvice  方法后
  - MethodInterceptor 环绕
  - ThrowsAdvice 异常
- ProxyFactoryBean 生成代理类 并关联上对应的 被代理类和切面advice
- AbstractAutoProxyCreator 自定生成代理类 不用显示配置ProxyFactoryBean了
- PointAdvisor 切面点 可以根据想要的规则，指定方法是否要被拦截
  - DefaultPointcutAdvisor  默认
  - RegexpMethodPointcutAdvisor  通过正则表达式来匹配拦截的方法
  - NameMatchMethodPointcutAdvisor 直接指定那些方法是需要拦截



态代理是Spring实现AOP的默认方式，分为两种：**JDK动态代理**和**CGLIB动态代理**。JDK动态代理面向接口，通过反射生成目标代理接口的匿名实现类；CGLIB动态代理则通过继承，使用字节码增强技术（或者`objenesis`类库）为目标代理类生成代理子类。Spring默认对接口实现使用JDK动态代理，对具体类使用CGLIB，同时也支持配置全局使用CGLIB来生成代理对象。

我们在切面配置中会使用到`@Aspect`注解，这里用到了**Aspectj**的切面表达式。Aspectj是java语言实现的一个AOP框架，使用静态代理模式，拥有完善的AOP功能，与Spring AOP互为补充。Spring采用了Aspectj强大的切面表达式定义方式，但是默认情况下仍然使用动态代理方式，并未使用Aspectj的编译器和织入器，当然也支持配置使用Aspectj静态代理替代动态代理方式。Aspectj功能更强大，比方说它支持对字段、POJO类进行增强，与之相对，Spring只支持对Bean方法级别进行增强。

Spring对方法的增强有五种方式：

- 前置增强（`org.springframework.aop.MethodBeforeAdvice`）：在目标方法执行之前进行增强；
- 后置增强（`org.springframework.aop.AfterReturningAdvice`）：在目标方法执行之后进行增强；
- 环绕增强（`org.aopalliance.intercept.MethodInterceptor`）：在目标方法执行前后都执行增强；
- 异常抛出增强（`org.springframework.aop.ThrowsAdvice`）：在目标方法抛出异常后执行增强；
- 引介增强（`org.springframework.aop.IntroductionInterceptor`）：为目标类添加新的方法和属性。



## Spring AOP 使用时候常见问题

### 1 同方法每部调用



### 2 循环依赖问题



### 3 非public方法



### 4 final关键字问题













---

参考链接：

- https://blog.csdn.net/zhangliangzi/article/details/52334964
- https://blog.csdn.net/weixin_34102807/article/details/85826055?utm_medium=distribute.pc_relevant_download.none-task-blog-2~default~BlogCommendFromBaidu~default-1.nonecase&depth_1-utm_source=distribute.pc_relevant_download.none-task-blog-2~default~BlogCommendFromBaidu~default-1.nonecas
- https://www.cnblogs.com/ityouknow/p/5329550.html
- https://blog.csdn.net/u013905744/article/details/91364736
- [Spring AOP中循环依赖解决](https://www.jianshu.com/p/3bc6c6713b08)

