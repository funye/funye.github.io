---
title: Spring IOC - IoC容器启动过程分析
date: 2020-11-23
categories:
 - 基础框架
tags:
 - spring
---

# Spring IOC - IoC容器启动过程分析

**spring源码版本 version 4.0.5**

## 1 BeanFactory 和 ApplicationContext

spring IoC容器的核心的表现形式就是 BeanFactory和ApplicationContext

### 1.1 BeanFactory 
1. 可以通过getBean方法获得指定的bean
2. isSingleton 判断指定的bean是不是单例的

主要是BeanFactory的接口中方法

其中有两个BeanFactory的实现比较需要注意 `DefaultListableBeanFactory `和`AbstractAutowireCapableBeanFactory`。 使用比较多。


### 1.2 ApplicationContext 

其实使用编程的方式可以创建IoC,即创建factory ，然后对factory进行各种设置再使用(参见本文1.2.2最后的示例)。但是spring提供了更加方便的ApplicationContext，同时还更加了一些额外的操作。

1. 支持不同的信息资源。ApplicationContext扩展了MessageSource接口
2. 访问资源。继承自DefaultResourceLoader
3. 支持应用事件。继承自接口ApplicationEventPublisher
4. 附件服务

## 2 IoC 容器初始化过程

第一步：**Resource定位过程**。通过ResourceLoader的统一接口Resource找到BeanDefinition的资源定位。

第二步：**BeanDefinition 载入**。把用户定义好的Bean转换成IoC容器内部的数据结构BeanDefinition。

第三步：**向IoC容器注册这些BeanDefinition的过程**。调用BeanDefinitionRegistry.registerBeanDefinition实现。这个注册过程把载入过程中解析的BeanDefinition向IoC注册。实际上IoC内部是将BeanDefinition注入好一个HashMap中，通过这个HashMap来持有这些BeabDefinition的数据。

这个过程中不包含依赖注入，依赖注入和bean定义(BeanDefinition)的载入是两个独立的过程。 **依赖注入一般发生在第一次使用getBean获取bean的时候，但是如果bean配置了lazyinit的话，会提前初始化，不用等到第一次getBean触发**。

### 2.1 BeanDefinition的资源定位

看BeanDefinition的资源定位，以FileSystemXmlApplicationContext为例，查看一下过程。
FileSystemXmlApplicationContext的构造方法中，refresh() 方法启动IoC容器。 几种ApplicationContext的子类都是在构造方法中refresh里面启动容器的。

方法调用链路：

AbstractApplicationContext.refresh()-->obtainFreshBeanFactory()-->refreshBeanFactory-->AbstractRefreshableApplicationContext.refreshBeanFactory()-->loadBeanDefinitions-->AbstractXmlApplicationContext.loadBeanDefinitions()
```java
protected void loadBeanDefinitions(XmlBeanDefinitionReader reader) throws BeansException, IOException {
	// 通过config获取
	Resource[] configResources = getConfigResources();
	if (configResources != null) {
		reader.loadBeanDefinitions(configResources);
	}
	// 通过字符串获取
	String[] configLocations = getConfigLocations();
	if (configLocations != null) {
		reader.loadBeanDefinitions(configLocations);
	}
}
```

如果得到是String[] configLocations 则会最后进入到 AbstractBeanDefinitionReader的public int loadBeanDefinitions(String location, Set<Resource> actualResources)。此方法内部把String 转换成Resource。 整个获取BeanDefinition的过程就结束了，**定位BeanDefinition的主要目的就是把资源位置转换成可以处理的Resource**

上面两个分支最后都是走如下路径去加载BeanDefinition 

AbsractBeanDefinitionReader.loadBeanDefinitions(Resource... resources) --> XmlBeanDefinitionReader.loadBeanDefinitions(Resource resource) (loadBeanDefinitions(EncodedResource encodedResource))


### 2.2 BeanDefinition的载入

在找到资源位子时候，获取到很多的Resources只有，在需要根据资源类型，选择不同类型的BeanDefinitionReader载入资源，例如Xml的配置文件，最后载入的时候就是XmlBeanDefinitionReader来执行载入。

之前的说到过，ApplicationContext的子类都是在构造方法里面通过refresh方法启动容器的。所有BeanDefinition的资源定位和载入BeanDefinition的入口都是在refresh方法中。

核心入口：
```java
@Override
	public void refresh() throws BeansException, IllegalStateException {
		synchronized (this.startupShutdownMonitor) {
			// Prepare this context for refreshing.
			// refresh前准备工作
			prepareRefresh();

			// Tell the subclass to refresh the internal bean factory.
			// 通知子类调用内部 refresh bean factory的方法 refreshBeanFactory(),
			// 此refreshBeanFactory()是资源定位和载入的入口
			ConfigurableListableBeanFactory beanFactory = obtainFreshBeanFactory();

			// Prepare the bean factory for use in this context.
			// 设置beanFactory的标准上下文特征
			prepareBeanFactory(beanFactory);

			try {
				// Allows post-processing of the bean factory in context subclasses.
				// 设置beanFactory的后置处理
				postProcessBeanFactory(beanFactory);

				// Invoke factory processors registered as beans in the context.
				// 调用beanFactory的后处理器
				invokeBeanFactoryPostProcessors(beanFactory);

				// Register bean processors that intercept bean creation.
				// 注册bean 后处理器，在bean创建的过程中调用
				registerBeanPostProcessors(beanFactory);

				// Initialize message source for this context.
				// 初始化上下文的消息资源
				initMessageSource();

				// Initialize event multicaster for this context.
				// 初始化上下文事件
				initApplicationEventMulticaster();

				// Initialize other special beans in specific context subclasses.
				// 利用子类初始化一些特殊bean
				onRefresh();

				// Check for listener beans and register them.
				// 检查监听器并向容器注册这些监听器
				registerListeners();

				// Instantiate all remaining (non-lazy-init) singletons.
				// 实例化所有(non-lazy-init)的单例组件
				finishBeanFactoryInitialization(beanFactory);

				// Last step: publish corresponding event.
				// 最后一步，发布容器，结束refresh过程
				finishRefresh();
			}

			catch (BeansException ex) {
				// Destroy already created singletons to avoid dangling resources.
				// 防止单例组件占用资源，在异常中销毁
				destroyBeans();

				// Reset 'active' flag.
				// 设置'active'标识
				cancelRefresh(ex);

				// Propagate exception to caller.
				// 向外层调用这抛出异常
				throw ex;
			}
		}
	}
```

前面步骤和查找resource一样，xml形式的配置文件，最后走到XmlBeanDefinitionReader中(定位资源中有提到，最后进入XmlBeanDefinitionReader.loadBeanDefinitions(EncodedResource encodedResource)),进入如下方法:
```java
public int loadBeanDefinitions(EncodedResource encodedResource) throws BeanDefinitionStoreException {
		Assert.notNull(encodedResource, "EncodedResource must not be null");
		if (logger.isInfoEnabled()) {
			logger.info("Loading XML bean definitions from " + encodedResource.getResource());
		}

		Set<EncodedResource> currentResources = this.resourcesCurrentlyBeingLoaded.get();
		if (currentResources == null) {
			currentResources = new HashSet<EncodedResource>(4);
			this.resourcesCurrentlyBeingLoaded.set(currentResources);
		}
		if (!currentResources.add(encodedResource)) {
			throw new BeanDefinitionStoreException(
					"Detected cyclic loading of " + encodedResource + " - check your import definitions!");
		}
		try {
		    // 将资源转换成输入流
			InputStream inputStream = encodedResource.getResource().getInputStream();
			try {
				InputSource inputSource = new InputSource(inputStream);
				if (encodedResource.getEncoding() != null) {
					inputSource.setEncoding(encodedResource.getEncoding());
				}
				// 在doLoadBeanDefinitions方法中实现BeanDefinition的载入
				return doLoadBeanDefinitions(inputSource, encodedResource.getResource());
			}
			finally {
				inputStream.close();
			}
		}
		catch (IOException ex) {
			throw new BeanDefinitionStoreException(
					"IOException parsing XML document from " + encodedResource.getResource(), ex);
		}
		finally {
			currentResources.remove(encodedResource);
			if (currentResources.isEmpty()) {
				this.resourcesCurrentlyBeingLoaded.remove();
			}
		}
	}
```
从输入流中读取bean的定义，从doLoadBeanDefinitions 方法进入，开始载入BeanDefinition。在doLoadBeanDefinitions方法中通过InputSource和recource得到Document，紧接着调用registerBeanDefinitions，实际调用到DefaultBeanDefinitionDocumentReader.registerBeanDefinitions-->doRegisterBeanDefinitions(root)
```java
protected void doRegisterBeanDefinitions {
		String profileSpec = root.getAttribute(PROFILE_ATTRIBUTE);
		if (StringUtils.hasText(profileSpec)) {
			Assert.state(this.environment != null, "Environment must be set for evaluating profiles");
			String[] specifiedProfiles = StringUtils.tokenizeToStringArray(
					profileSpec, BeanDefinitionParserDelegate.MULTI_VALUE_ATTRIBUTE_DELIMITERS);
			if (!this.environment.acceptsProfiles(specifiedProfiles)) {
				return;
			}
		}
        
        // 任何嵌套的 <beans> 元素将会导致这个方法的循环，
        // 为了正确的传播和保存<beans>的default-*属性，追踪当前代理（可能为null）。
        // 创建一个新的代理对象，指向原来对象来达到回滚的目的，最终重置this.delegate到原来的对象。
        // 整个的表现模拟了一个代理栈，而不需要一个代理
		BeanDefinitionParserDelegate parent = this.delegate;
		this.delegate = createDelegate(this.readerContext, root, parent);

		preProcessXml(root);
		parseBeanDefinitions(root, this.delegate);
		postProcessXml(root);

		this.delegate = parent;
	}
```

再进入parseBeanDefinitions解析。在parseBeanDefinitions中，如果是默认的namespace就进入`parseDefaultElement(ele, delegate)`,如果不是就进入`delegate.parseCustomElement(ele)`,在parseDefaultElement中分别解析 `import`、`alias`、`bean`、`beans` ,其中beans会进入递归，调用doRegisterBeanDefinitions。bean是节点才是我创建bean的解析过程。其中bean分支左后进入到DefaultBeanDefinitionDocumentReader.processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate)
```java
protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
    // 在BeanDefinitionParserDelegate中完成bean的解析，结果返回到BeanDefinitionHolder中
	BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
	if (bdHolder != null) {
	    // BeanDefinitionParserDelegate在对holder进行修饰（解析自定义的属性）
		bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
		try {
		    // Register the final decorated instance.
			// 向Ioc真正注册装饰之后的BeanDefinition实例
			BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
		}
		catch (BeanDefinitionStoreException ex) {
			getReaderContext().error("Failed to register bean definition with name '" +
					bdHolder.getBeanName() + "'", ele, ex);
		}
		// Send registration event.
		// BeanDefinition注册完成之后发送消息
		getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));
	}
}

```

### 2.3 BeanDefinition在IoC容器的注册
bean的注册过程，从上面解析过程完成之后，就开始注册了，上面带出显示 
```java
BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
```
进入BeanDefinitionReaderUtils，registerBeanDefinition方法中最后调用BeanDefinitionRegistry接口的registerBeanDefinition。查看DefaultListableBeanFactory中的实现
```java
public void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
			throws BeanDefinitionStoreException {

		Assert.hasText(beanName, "Bean name must not be empty");
		Assert.notNull(beanDefinition, "BeanDefinition must not be null");

		if (beanDefinition instanceof AbstractBeanDefinition) {
			try {
			    // 校验BeanDefinition
				((AbstractBeanDefinition) beanDefinition).validate();
			}
			catch (BeanDefinitionValidationException ex) {
				throw new BeanDefinitionStoreException(beanDefinition.getResourceDescription(), beanName,
						"Validation of bean definition failed", ex);
			}
		}
        
        // private final Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<String, BeanDefinition>(64);
        // key是beanName,value是BeanDefinition
		synchronized (this.beanDefinitionMap) {
			BeanDefinition oldBeanDefinition = this.beanDefinitionMap.get(beanName);
			if (oldBeanDefinition != null) {
			    // 如果同名的bean已经注册，但是设置allowBeanDefinitionOverriding为false(即不允许定义重复),则抛出异常
			    // 默认的allowBeanDefinitionOverriding为true
			    // 网上看到的设置allowBeanDefinitionOverriding的方法,但此方法有点局限在web项目中，方案链接如下：
			    // http://blog.csdn.net/zgmzyr/article/details/39380477
			    // 那么还有没有更好的办法呢 ？
				if (!this.allowBeanDefinitionOverriding) {
					throw new BeanDefinitionStoreException(beanDefinition.getResourceDescription(), beanName,
							"Cannot register bean definition [" + beanDefinition + "] for bean '" + beanName +
							"': There is already [" + oldBeanDefinition + "] bound.");
				}
				// 如果设置允许不定义不一致，但是重复的情况下，判断BeanDefition的role级别，日志提醒
				else if (oldBeanDefinition.getRole() < beanDefinition.getRole()) {
					// e.g. was ROLE_APPLICATION, now overriding with ROLE_SUPPORT or ROLE_INFRASTRUCTURE
					if (this.logger.isWarnEnabled()) {
						this.logger.warn("Overriding user-defined bean definition for bean '" + beanName +
								" with a framework-generated bean definition ': replacing [" +
								oldBeanDefinition + "] with [" + beanDefinition + "]");
					}
				}
				else {
					if (this.logger.isInfoEnabled()) {
						this.logger.info("Overriding bean definition for bean '" + beanName +
								"': replacing [" + oldBeanDefinition + "] with [" + beanDefinition + "]");
					}
				}
			}
			else {
			    // 如果没有重复，添加beanName到list中，按照注册顺序排序
				this.beanDefinitionNames.add(beanName);
				this.frozenBeanDefinitionNames = null;
			}
			// 添加BeanDefinition到map中
			this.beanDefinitionMap.put(beanName, beanDefinition);
		}

		resetBeanDefinition(beanName);
	}
```

回答上面提到的问题，如果设置allowBeanDefinitionOverriding还有什么方法，那就是使用IoC的释放，方法换掉
```java
@Test
public void testProgramWayIoC() {
	// 确定资源
	Resource res = new ClassPathResource("application.xml");
	// 创建一个BeanFactory,设置部分不想使用默认值的属性
	DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
	factory.setAllowBeanDefinitionOverriding(false);
	// 创建BeanDefinitionReader
	XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(factory);
	// 加载DeanDefinition并向IoC容器注册
	reader.loadBeanDefinitions(res);
	// 使用bean
	TestBean test = factory.getBean("testBean",TestBean.class);
	test.testMethod();

}
```
虽然这样可以，但是相比较来讲，代码注释的地方提到的方案，相对更加实用。这里说明这个只是说可以用编程的方式使用IoC容器。

## 3 IoC的依赖注入

依赖注入的地方是在第一次使用getBean的时候注入的。但是当设置了lazy-init的时候会在BeadDefinition载入的时候注入。

getBean是BeanFactory接口提供的方法，其实现在AbstractBeanFactory中 

另外：ListableBeanFactory中有一个`<T> T getBean(Class<T> requiredType) throws BeansException;`的接口，在`DefaultListableBeanFactory`中实现。

依赖注入过程
```
AbstractBeanFactory.doCreateBean()-->AbstractBeanFactory.createBean()-->AbstractAutowireCapableBeanFactory.createBean()-->AbstractAutowireCapableBeanFactory.doCreateBean()-->AbstractAutowireCapableBeanFactory.createBeanInstance()-->initializeBean()-->registerDisposableBeanIfNecessary
```

## 4 前后处理器与容器的感知

## 4.1 BeanPostProcessor 与 BeanFactoryPostProcessor
`BeanFactoryPostProcessor` 是BeanFactory的后置处理器
```java
public interface BeanFactoryPostProcessor {
	void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;
}
```
他只在beanFactory创建完成时候调用过一次，可以得到一个BeanFactory的子类。操作BeanFactory

`BeanPostProcessor` 是Bean的前后置处理器，可以在bean的初始化前后操作。可是获得beanName,修改Bean
```java
public interface BeanPostProcessor {
    Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException;
    Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException;
}
```
这里面的两个方法在所有的bean的初始化过程中都会调用，可以理解为一个拦截去的样子。


`InitializingBean` 接口，主要实在bean实例化之后设置属性，即各种感知器执行完成之后


## 4.2 感知（Aware）
有些时候需要在bean使用IoC容器，对IoC容器进行操作，这个时候就可以利用感知器的特点得到IoC进行操作。

几种常用的感知器：

1. BeanNameAware, 可以在Bean中得到它在IoC容器中的实例名称
2. BeanFactoryAware, 可以在Bean中得到bean所在的容器（beanFactory对象），从而在bean中直接使用IoC容器的服务。
3. ApplicationContextAware, 可以在bean中得到bean所在应用的上下文，从而直接在Bean中使用上下文的服务。例如利用上下文getBean
4. MessageSourceAware, 在Bean中得到消息源
5. ApplicationEventPublisherAware,在Bean中得到上下文事件发布器，从而可以在Bean中发布应用上下文事件
6. ResourceLoaderAware, 在Bean中得到ResourceLoader，从而在bean中使用ResourceLoader加载外部对应的Resource资源



## 5 Bean生命周期

bean的生命周期，整个过程就是先执行BeanFactory的创建，如果有就不用再创建，在执行beanFactory的后置处理器，再执行实例化感知器。接下实例化。注入属性。调用各种Bean的感知器。调用bean的前后置处理器。如下图：

*图片来源：http://www.cnblogs.com/zrtqsk/p/3735273.html*

![bean生命周期](https://images0.cnblogs.com/i/580631/201405/181453414212066.png)
![](https://images0.cnblogs.com/i/580631/201405/181454040628981.png)