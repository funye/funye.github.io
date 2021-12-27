---
title: SpringBoot 启动过程分析
date: 2020-11-23
categories:
 - 基础框架
tags:
 - springboot
---

# SpringBoot 启动过程分析

## 1 前言

::: warning
说明：springboot版本2.3.7
::: 

分析springboot启动过程，那么从源码去看, 有两个关键步骤
- new SpringApplication()
- SpringApplication.run()

```java
// main方法一般的启动方式
public static void main( String[] args )
{
    SpringApplication.run(App.class, args);
}

// 跟踪进入会发现两个关键的步骤 
// 1. new SpringApplication
// 2. run()
public static ConfigurableApplicationContext run(Class<?>[] primarySources, String[] args) {
	return new SpringApplication(primarySources).run(args);
}
```

## 2 new SpringApplication() 

### 2.1 主流程分析
在 new SpringApplication()的时候的几个主要步骤，看如下源码注释
```java
public SpringApplication(ResourceLoader resourceLoader, Class<?>... primarySources) {
    // 复制classloader
    this.resourceLoader = resourceLoader;
    Assert.notNull(primarySources, "PrimarySources must not be null");
    // 保存主配置类（这里是一个数组，说明可以有多个主配置类）
    this.primarySources = new LinkedHashSet<>(Arrays.asList(primarySources));   
    // 判断应用类型
    this.webApplicationType = WebApplicationType.deduceFromClasspath();
    // 从类路径下找到 META/INF/Spring.factories 配置的所有 ApplicationContextInitializer，然后保存起来 
    setInitializers((Collection) getSpringFactoriesInstances(ApplicationContextInitializer.class));
    // 从类路径下找到 META/INF/Spring.factories 配置的所有 ApplicationListener，然后保存起来
    setListeners((Collection) getSpringFactoriesInstances(ApplicationListener.class));
    // 从多个配置类中找到有 main 方法的主配置类（只有一个）
    this.mainApplicationClass = deduceMainApplicationClass();
}
```

### 2.2 设置initializer和listener实例
上面的源码中，保存initializer和listener方法基本是相同的。关键方法 `getSpringFactoriesInstances` 进入源码如下
```java
private <T> Collection<T> getSpringFactoriesInstances(Class<T> type, Class<?>[] parameterTypes, Object... args) {
    // 获取classloader, 如果之前main方法有传入则使用传入的，否则使用默认的
    ClassLoader classLoader = getClassLoader();
    // Use names and ensure unique to protect against duplicates
    // 使用名称确保唯一性，使用找到Type的类的名称
    // 主要是ApplicationContextInitializer和ApplicationListener的实现类，注释1
    Set<String> names = new LinkedHashSet<>(SpringFactoriesLoader.loadFactoryNames(type, classLoader)); 
    // 根据类型创建实例，注释2
    List<T> instances = createSpringFactoriesInstances(type, parameterTypes, classLoader, args, names);
    // 根据注解的order属性进行一下排序
    AnnotationAwareOrderComparator.sort(instances);
    return instances;
}
```
注释1 和 注释2 分别为查找类名和创建实例，下面依次解析。

#### 2.2.1 查找类名称
上述源码中 **注释1** 主要是查询类名称，实现如下，其中方法 loadFactoryNames 进入源码后，发现关键部分为`loadSpringFactories(classloader)`
```java
public static List<String> loadFactoryNames(Class<?> factoryType, @Nullable ClassLoader classLoader) {
    String factoryTypeName = factoryType.getName();
    return loadSpringFactories(classLoader).getOrDefault(factoryTypeName, Collections.emptyList());
}

private static Map<String, List<String>> loadSpringFactories(@Nullable ClassLoader classLoader) {
    // ...省略
    try {
        // FACTORIES_RESOURCE_LOCATION = META-INF/spring.factories， 可以点开看看文件内容
        // 这段代码可以看出，就是从META-INF/spring.factories获取对应Type的配置，取值按照逗号隔开后，转换成一个多值的map
        // key=factoryTypeName, value是多个逗号分开的类名称
        Enumeration<URL> urls = (classLoader != null ?
                classLoader.getResources(FACTORIES_RESOURCE_LOCATION) :
                ClassLoader.getSystemResources(FACTORIES_RESOURCE_LOCATION));
        result = new LinkedMultiValueMap<>();
        while (urls.hasMoreElements()) {
            URL url = urls.nextElement();
            UrlResource resource = new UrlResource(url);
            Properties properties = PropertiesLoaderUtils.loadProperties(resource);
            for (Map.Entry<?, ?> entry : properties.entrySet()) {
                String factoryTypeName = ((String) entry.getKey()).trim();
                for (String factoryImplementationName : StringUtils.commaDelimitedListToStringArray((String) entry.getValue())) {
                    result.add(factoryTypeName, factoryImplementationName.trim());
                }
            }
        }
        cache.put(classLoader, result);
        return result;
    }
    // ... 省略
}
```

#### 2.2.2 生成实例

**注释2** 为创建实例，查看 `createSpringFactoriesInstances` 的源码发现逻辑比较的简单，这里就不贴源码了，就是利用`ClassUtils` 生成相应的实例。

### 2.3 new SpringApplication总结

::: danger
至此，启动部分的 new SpringApplication 的工作基本完成。总结下步骤如下：
1. 设置resourceloader和主类
2. 判断并设置web应用的类型
3. 查询并实例化 ApplicationContextInitializer 的实现类（ 通过META-INF/spring.factories的配置）
4. 查询并实例化 ApplicationListener 的实现类（ 通过META-INF/spring.factories的配置）
5. 设置主启动类（包含main方法的配置类）
:::


## 3 run()方法分析

### 3.1 run()主流程分析

在创建完 SpringApplication对象后，回看之前的动作，下一步要执行的就是其run()方法，分析其源码如下：

```java
public ConfigurableApplicationContext run(String... args) {
    // 启动计时器
    StopWatch stopWatch = new StopWatch();
    stopWatch.start();
    ConfigurableApplicationContext context = null;
    Collection<SpringBootExceptionReporter> exceptionReporters = new ArrayList<>();
    // 设置headless的配置值
    configureHeadlessProperty();
    // 找到 SpringApplicationRunListeners 配置，生成实例，并开启执行。
    // 从META-INF/spring.factories获SpringApplicationRunListeners取配置并创建实例，
    // 方式和之前new SpringApplication()时候一样
    SpringApplicationRunListeners listeners = getRunListeners(args);
    listeners.starting();
    try {
        // 封装命令行传入的参数
        ApplicationArguments applicationArguments = new DefaultApplicationArguments(args);
        // 准备环境，准备完成回调 SpringApplicationRunListeners.environmentPrepared 方法, 注释3-1
        ConfigurableEnvironment environment = prepareEnvironment(listeners, applicationArguments);
        configureIgnoreBeanInfo(environment);

        // 打印banner
        Banner printedBanner = printBanner(environment);

        // 创建 IOC 容器（决定创建 web 的 IOC 容器还是普通的 IOC 容器），注释3-2
        context = createApplicationContext();
        
        // 从META-INF/spring.factories获取 SpringBootExceptionReporter的类并创建实例
        exceptionReporters = getSpringFactoriesInstances(SpringBootExceptionReporter.class,
                new Class[] { ConfigurableApplicationContext.class }, context);
        
        /*
         * 注释3-3
         * 准备上下文环境，将 environment 保存到 IOC 容器中，并且调用 applyInitializers() 方法
         * applyInitializers() 方法回调之前保存的所有的 ApplicationContextInitializer 的 initialize() 方法
         * 然后回调所有的 SpringApplicationRunListener#contextPrepared() 方法 
         * 最后回调所有的 SpringApplicationRunListener#contextLoaded() 方法 
         */
        prepareContext(context, environment, listeners, applicationArguments, printedBanner);
        
        // 刷新容器，IOC 容器初始化（如果是 Web 应用还会创建嵌入式的 Tomcat），扫描、创建、加载所有组件的地方 注释3-4
        refreshContext(context);

        // 从 IOC 容器中获取所有的 ApplicationRunner 和 CommandLineRunner 进行回调 注释3-5
        afterRefresh(context, applicationArguments);

        stopWatch.stop();
        if (this.logStartupInfo) {
            new StartupInfoLogger(this.mainApplicationClass).logStarted(getApplicationLog(), stopWatch);
        }
        // 调用 所有 SpringApplicationRunListeners#started()方法 
        listeners.started(context);
        
        // 启动ApplicationRunner 和 CommandLineRunner 的run方法
        callRunners(context, applicationArguments);
    }
    catch (Throwable ex) {
        handleRunFailure(context, ex, exceptionReporters, listeners);
        throw new IllegalStateException(ex);
    }

    try {
        listeners.running(context);
    }
    catch (Throwable ex) {
        handleRunFailure(context, ex, exceptionReporters, null);
        throw new IllegalStateException(ex);
    }
    return context;
}
```

根据上面的源码，分析几个关键步骤
1. 注释3-1，准备环境 prepareEnvironment
2. 注释3-2，创建上下文IOC容器 createApplicationContext
3. 注释3-3，上下文刷新前的处理 prepareContext
4. 注释3-4，刷新上下文 refreshContext
5. 注释3-5，上下文刷新后的处理 afterRefresh

接下来依次简单分析下以上步骤的流程

### 3.2 prepareEnvironment

注释3-1 `prepareEnvironment` 主要是创建Environment对象并进行配置。`prepareEnvironment`的实现中有个方法 `configureEnvironment` 源码如下：

```java
protected void configureEnvironment(ConfigurableEnvironment environment, String[] args) {
    if (this.addConversionService) {
        ConversionService conversionService = ApplicationConversionService.getSharedInstance();
        environment.setConversionService((ConfigurableConversionService) conversionService);
    }
    // 配置properties和
    configurePropertySources(environment, args);
    // 配置profile
    configureProfiles(environment, args);
}
```

基本上如方法名描述的，准备一些环境相关的东西

### 3.3 createApplicationContext

注释3-2，创建上下文IOC容器 createApplicationContext， 这段源码很简单，就是根据 webApplicationType 的类型利用Class.forName创建class,
再使用BeanUtils.instantiateClass 创建实例，源码就不贴了。

### 3.4 prepareContext

```java
private void prepareContext(ConfigurableApplicationContext context, ConfigurableEnvironment environment,
			SpringApplicationRunListeners listeners, ApplicationArguments applicationArguments, Banner printedBanner) {
    // 设置环境
    context.setEnvironment(environment);
    // 注册beanNameGenerator 并设置resourceLoader
    postProcessApplicationContext(context);
    // 调用initializer.initialize()方法
    applyInitializers(context);
    // 使用SpringApplicationRunListener广播上下文准备启动的通知，其他ApplicationListener实现类监听到后做相应处理
    listeners.contextPrepared(context);
    if (this.logStartupInfo) {
        logStartupInfo(context.getParent() == null);
        logStartupProfileInfo(context);
    }
    // Add boot specific singleton beans
    // 添加一些启动时候的需要的一些单例类
    ConfigurableListableBeanFactory beanFactory = context.getBeanFactory();
    beanFactory.registerSingleton("springApplicationArguments", applicationArguments);
    if (printedBanner != null) {
        beanFactory.registerSingleton("springBootBanner", printedBanner);
    }
    if (beanFactory instanceof DefaultListableBeanFactory) {
        ((DefaultListableBeanFactory) beanFactory)
                .setAllowBeanDefinitionOverriding(this.allowBeanDefinitionOverriding);
    }
    if (this.lazyInitialization) {
        context.addBeanFactoryPostProcessor(new LazyInitializationBeanFactoryPostProcessor());
    }
    // Load the sources
    Set<Object> sources = getAllSources();
    Assert.notEmpty(sources, "Sources must not be empty");
    load(context, sources.toArray(new Object[0]));
    listeners.contextLoaded(context);
}
```

### 3.5 refreshContext

refresh 方法就是调用spring的IOC容器的refresh() 刷新容器

### 3.6 afterRefresh

暂无实现

### 3.7 run()流程总结

::: danger
至此，run()方法分析结束，总结下步骤如下：
1. 准备环境 prepareEnvironment, 设置profile和properties
2. 创建上下文IOC容器 createApplicationContext, 创建ApplicationContext实例
3. 上下文刷新前的处理 prepareContext，设置context的环境，启动initializer, 广播启动准备通知，实例化并注册一些特殊的单例bean, 装在Source等 
4. 刷新上下文 refreshContext，刷新IOC容器
5. 上下文刷新后的处理 afterRefresh。
:::


--- 

参考资料
- [这样讲 SpringBoot 自动配置原理，你应该能明白了吧](https://juejin.cn/post/6844903849178873870)
- [SpringBoot2.2.2.release源码](https://spring.io/projects/spring-boot)