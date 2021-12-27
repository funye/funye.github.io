---
title: Spring 常用的扩展接口
date: 2021-12-03
categories:
 - 基础框架
tags:
 - spring

---

# Spring 常用的扩展接口

##  1 bean生命周期相关

### 1.1 扩展接口说明

扩展接口|作用说明
:--|---
BeanFactoryPostProcessor| 处理所有bean之前，对bean factory 进行预处理。bean还没有实例化，此时Bean刚被解析成 BeanDefinition对象 
BeanDefinitionRegistryPostProcessor| 可以添加自定义的bean（动态注册bean，修改属性值等），BeanFactoryPostProcessor 子类 
Aware| 获取ApplicationConext及其中的bean 
BeanPostProcessor| 在bean初始化前、后对bean进行处理 
InitialingBean| bean初始化完成，所有属性注入完成后执行 
DisposableBean| bean销毁前执行 
ApplicationListener| 事件监听 
FactoryBean| 通过实现该接口定制实例化bean的逻辑 



### 1.2 bean生成的顺序

所有的`Bean`生成都有个顺序: `定义 --> 创建（实例化） --> 初始化`.

- 定义：通过xml、注解、配置文件等生成 `BeanDefinition`

- 实例化：指创建类实例（对象）的过程。比如使用构造方法new对象，为对象在内存中分配空间。（要创建对象，但是并未生成对象）
- 初始化：指为类中各个类成员(被static修饰的成员变量)赋初始值的过程，是类生命周期中的一个阶段。简单理解为对象中的属性赋值的过程。（对象已经生成，为其属性赋值）

### 1.3 执行顺序

1. 初始化容器
2. 通过 `BeanDefinitionReader` 读取bean原信息，生成 `BeanDefinition`
3. 执行 `BeanDefinitionRegistryPostProcessor` 的 `postProcessBeanDefinitionRegistry()` 方法
4. 执行`BeanFactoryPostProcessor` 的 `postProcessBeanFactory()` 方法
5. 实例化业务Bean
6. Aware接口组调用
7. 执行 `BeanPostProcessor` 实现类的 `postProcessBeforeInitialization()` 方法
8. 执行 `InitializingBean` 实现类的 `afterPropertiesSet()` 方法
9. 执行bean的 `init-method` 属性执定的初始化方法
10. 执行 `BeanPostProcessor` 实现类的 `postProcessAfterInitialization()` 方法
11. 初始化完成
12. 关闭容器，执行 `DisposableBean` 的 `destory()` 方法
13. 执行bean 的 `destory-method` 属性执定的方法





## 2 扩展接口说明

 ### 2.1 BeanFactoryPostProcessor

- 作用&特点

    - 方法调用时，bean还没有实例化， 还是BeanDefinition 对象
    - 主要操作的是BeanDefinition, 可以对BeanDefinition 进行修改
    - BeanDefinition就是Bean的配置元数据或Bean的描述信息, 比如Bean的属性值, 构造方法的参数值等. 
    - bean定义阶段调用，调用一次

- 例子

    - 将Bean的scope从singleton改变为prototype
    - 修改Bean的属性值
    - PropertyPlaceholderConfigurer，替换xml文件中的占位符，替换为properties文件中相应的key对应的value
    - dubbo的AnnotationBean扫描注解
    - elastic-job的SpringZookeeperRegistryCenter启动基于Zookeeper的注册中心

    

- 代码示例

    ```java
    // 通过BeanFactoryPostProcessor修改Bean的属性值示例
    @Component
    public class TestBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    
        @Override
        public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
            System.out.println("beanFactory post processor....");
            BeanDefinition df = beanFactory.getBeanDefinition("testBean");
            // 获取spring的bean配置文件中给bean的属性配置的值
            PropertyValue propUserName = df.getPropertyValues().getPropertyValue("userName");
            if (propUserName == null || propUserName.getValue() == null) {
                // 没有配置值，就自己添加一个
                df.getPropertyValues().addPropertyValue(new PropertyValue("userName", "fun"));
            } else {
                System.out.println("prop name=" + propUserName.getName() + ", value=" + propUserName.getValue());
            }
    
        }
    
    ```

    

### 2.2 BeanDefinitionRegistryPostProcessor

- 作用&特点

    - 是BeanDefinitionRegistry的后处理器，可以操作BeanDefinitionRegistry。（BeanDefinitionRegistry是用来注册BeanDefinition的）

    - 允许在`BeanFactoryPostProcessor`被调用之前对`BeanDefinition`做一些操作, 尤其是它可以注册`BeanFactoryPostProcessor`的`BeanDefinition`.

    - 方法`postProcessBeanDefinitionRegistry()`, 这个方法被调用的时候, 所有的`BeanDefinition`已经被加载了, 但是所有的`Bean`还没被创建. `postProcessBeanDefinitionRegistry()` 比 `postProcessBeanFactory()` 先执行
    - bean定义阶段调用，调用一次

- 示例

    - 因为是BeanFactoryPostProcessor的子类，BeanFactoryPostProcessor的功能他都有
    - 动态注册bean， mybatis中MapperScannerConfigurer在只有接口没有实现类的情况下找到接口方法与sql之间的联系从而生成BeanDefinition并注册，spring的ConfigurationClassPostProcessor将注解@Configuration中的相关生成bean的方法所对应的BeanDefinition进行注册

    

BeanDefinitionRegistryPostProcessor 和 BeanFactoryPostProcessor 有点像，但是他更加靠前



### 2.3 BeanPostProcessor

- 作用&特点
    - 主要操作bean的实例，bean此时已经实例化，但是没有初始化
    - 可以在bean初始化前后加入逻辑
    - 每个bean实例化时候都会调用，会出现多次调用
- 示例
    - aop的实现原理
    - ConfigurationPropertiesBindingPostProcessor重写postProcessBeforeInitialization绑定Properties属性到@ConfigurationProperties注解的对象



### 2.4 Aware

- 作用&特点
    - 如果检测到一个bean实现了Aware接口，则能在bean中获取相应的Spring资源
    - 如果某个对象实现了某个Aware接口，比如需要依赖Spring的上下文容器（ApplicationContext），则可以实现ApplicationContextAware接口。
    - Spring在Bean进行初始化（注意与实例化的区别）之前，会将依赖的ApplicationContext对象通过调用ApplicationContextAware#setApplicationContext注入。
    - 调用一次

- spring提供的Aware接口

![img](https://img-blog.csdnimg.cn/20210531204423256.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM4ODI2MDE5,size_16,color_FFFFFF,t_70)

- 代码示例

    1. ```java
        // 获取ApplicationContext 并使用
        @Component
        public class TestApplicationContextAware implements ApplicationContextAware {
        
            private ApplicationContext applicationContext;
        
            @Override
            public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
                System.out.println("TestApplicationContextAware--->setApplicationContext");
                // 通过setApplicationContext 方法把applicationContext 注入，之后使用TestApplicationContextAware.applicationContext
                // 就相当于直接使用ApplicationContext
                this.applicationContext = applicationContext;
            }
        
            // 例如这个示例为 一个获取bean的工具
            public Object getBean(String beanName) {
                return applicationContext.getBean(beanName);
            }
        }
        
        // 使用示例
        @Autowired
        TestApplicationContextAware contextAware;
        
        TestBean bean2 = (TestBean)contextAware.getBean("testBean");
        bean2.getAge();
        ```

    2. ```java
        // 获取 ApplicationEventPublisher 并发布事件
        public class ServiceBean<T> extends ServiceConfig<T> implements InitializingBean, DisposableBean,
                ApplicationContextAware, BeanNameAware, ApplicationEventPublisherAware {
        
        
            private static final long serialVersionUID = 213195494150089726L;
        
            private final transient Service service;
        
            private transient ApplicationContext applicationContext;
        
            private transient String beanName;
        
            private ApplicationEventPublisher applicationEventPublisher;
            // ....省略....
            /**
             * @since 2.6.5
             */
            @Override
            protected void exported() {
                super.exported();
                // Publish ServiceBeanExportedEvent
                publishExportEvent();
            }
        
            /**
             * @since 2.6.5
             */
            private void publishExportEvent() {
                ServiceBeanExportedEvent exportEvent = new ServiceBeanExportedEvent(this);
                applicationEventPublisher.publishEvent(exportEvent); // 发布暴露服务完成事件
            }
        }
        ```

    

### 2.5 InitialingBean 和 DisposableBean

Spring Bean 的初始化和消费相关的接口

在spring中提供了三种自定义初始化和销毁的方式

>1. 通过@Bean指定init-method和destroy-method属性
>
>2. Bean实现InitializingBean（定义初始化逻辑），DisposableBean（定义销毁逻辑）;
>
>3. @PostConstruct：在bean创建完成并且属性赋值完成；来执行初始化方法




- 作用&特点

    - Bean实现InitializingBean（定义初始化逻辑），DisposableBean（定义销毁逻辑）
    - 使用时，优先考虑通过指定init-method和destroy-method属性方式自定义初始化和销毁逻辑
- 使用示例

    - dubbo ServiceBean 在 afterPropertiesSet() 设置服务path

- 代码示例

```java
@Component
@Data
public class TestInitializingBean implements InitializingBean {

    private String name;

    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("TestInitializingBean--->afterPropertiesSet...");
        this.name = "testName";
    }
}

```



### 2.6 FactoryBean

一般情况下，Spring通过反射机制利用bean的class属性指定实现类来实例化bean 。

在某些情况下，实例化bean过程比较复杂，如果按照传统的方式，则需要在bean中提供大量的配置信息，配置方式的灵活性是受限的，这时采用编码的方式可能会得到一个简单的方案。

Spring为此提供了一个org.Springframework.bean.factory.FactoryBean的工厂类接口，用户可以通过实现该接口定制实例化bean的逻辑。

(后面Spring又提供了@Configration和@Bean这种方式，一定程度上可以替代FactoryBean)


- 作用&特点

    - 实例化bean的一种方式，通常用来处理比较复杂的bean， 可以个性化地定制自己想要实例化出来的Bean

- 示例

    - mybatis的MapperFactoryBean获取mapper接口实例对象

    -  mybatis的SqlSessionFactoryBean通过buildSqlSessionFactory获取sqlSessionFactory实例对象

    - dubbo的ReferenceBean获取refrence接口实例对象

    - spring-boot通过PropertiesConfigurationFactory的bindPropertiesToTarget绑定配置属性到对象

- 代码示例

```java
@Component
public class TestFactoryBean implements FactoryBean<TestBean> , InitializingBean {

    private TestBean testBean;

    @Override
    public TestBean getObject() throws Exception {
        return testBean;
    }

    @Override
    public Class<?> getObjectType() {
        return TestBean.class;
    }

    // 这里使用 InitializingBean.afterPropertiesSet() 创建TestBean
    @Override
    public void afterPropertiesSet() throws Exception {
        if (this.testBean == null) {
            TestBean tb = new TestBean();
            tb.setUserName("fun");
            tb.setAge(30);
            this.testBean = tb;
        }
    }
}

```



### 2.7 ApplicationListener

- [Spring 事件机制详情](./0013-spring-event.md)



最后，各种PostProcessor 各种Aware，看的眼花缭乱，其实 XxxPostPorcessor 就是用来处理Xxx  这个的，例如 BeanFactoryPostProcessor 就是可以操作 BeanFactory，BeanPostProcessor 就是可以操作Bean， 而XxxAware 也是类似的，ApplicationContextAware 就是获取applicationContext 用来做一下逻辑，ApplicationEventPublisherAware 就是获取ApplicationEventPublisher 用来做一些操作。 简单来看就是 PostProcessor 和 Aware 两种组件。



---

参考资料

- [Spring常用扩展点-星夜孤帆](https://blog.csdn.net/qq_38826019/article/details/117389466)
- [Spring 中的事件机制](https://www.cnblogs.com/rickiyang/p/12001524.html)
