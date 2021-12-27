---
title: SpringBoot 自动配置原理
date: 2020-11-23
categories:
 - 基础框架
tags:
 - springboot
---

# SpringBoot 自动配置原理
::: warning
说明：springboot版本2.3.7
::: 

要搞明白springboot自动配置的原理，我们从源码去分析，我们知道，所有springboot项目，启动类上面只要加上 `@SpringBootApplication` 注解就可以，
那么我们就从这个注解入手，一起来一探究竟。

## 1 @SpringBootApplication

点击进入@SpringBootApplication 发现他包含了三个重要的注解

- @SpringBootConfiguration 表示这是一个springboot的配置类，本质是一个@Configuration
- @EnableAutoConfiguration 看名字，就知道是开启自动配置的注解
- @ComponentScan 组件扫描注解

从上面的配置三个注解可以看出，实现自动配置的关键就在，@EnableAutoConfiguration，那么接下来看看这个注解

## 2 @EnableAutoConfiguration

进入 EnableAutoConfiguration ，可以看到两个注解

- @AutoConfigurationPackage
- @Import(AutoConfigurationImportSelector.class)

下面分别看看这两个注解

### 2.1 @AutoConfigurationPackage

AutoConfigurationPackage 注解的源码，发现是 Import AutoConfigurationPackages.Registrar这个类

```java
static class Registrar implements ImportBeanDefinitionRegistrar, DeterminableImports {

    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
        // 注册自动配置的类，new PackageImport(metadata).getPackageName() = 当前main方法在的类的包名
        register(registry, new PackageImport(metadata).getPackageName());
    }

    @Override
    public Set<Object> determineImports(AnnotationMetadata metadata) {
        return Collections.singleton(new PackageImport(metadata));
    }

}

// register方法如下， 大致意思就是保存自动装载的包名
public static void register(BeanDefinitionRegistry registry, String... packageNames) {
    if (registry.containsBeanDefinition(BEAN)) {
        BeanDefinition beanDefinition = registry.getBeanDefinition(BEAN);
        ConstructorArgumentValues constructorArguments = beanDefinition.getConstructorArgumentValues();
        constructorArguments.addIndexedArgumentValue(0, addBasePackages(constructorArguments, packageNames));
    }
    else {
        GenericBeanDefinition beanDefinition = new GenericBeanDefinition();
        beanDefinition.setBeanClass(BasePackages.class);
        beanDefinition.getConstructorArgumentValues().addIndexedArgumentValue(0, packageNames);
        beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
        registry.registerBeanDefinition(BEAN, beanDefinition);
    }
}
```

@AutoConfigurationPackage 注解就是将主配置类（@SpringBootConfiguration标注的类）的所在包及下面所有子包里面的所有组件扫描到Spring容器中。
所以说，默认情况下主配置类包及子包以外的组件，Spring 容器是扫描不到的。

### 2.2 AutoConfigurationImportSelector

上面 AutoConfigurationPackage 讲主配置包名下的组件扫描到了spring容器，只是完成了自动配置的一部分。另外的一部分叫要靠 
@Import(AutoConfigurationImportSelector.class) 来实现，像我们用的mybatis、redis 等等

我们进入AutoConfigurationImportSelector, 网上很多人都是直接拿 `public String[] selectImports(AnnotationMetadata annotationMetadata)` 这个方法进行分析的。
这里也许是版本不同的问题吧，我断点的时候，没有进入这个方法，进入的是 
`AutoConfigurationGroup.process(AnnotationMetadata annotationMetadata, DeferredImportSelector deferredImportSelector)`

看看这个源码， 主要的方法就是`getAutoConfigurationEntry(annotationMetadata);`

调用链依次是  getAutoConfigurationEntry -> getCandidateConfigurations -> SpringFactoriesLoader.loadFactoryNames -> loadSpringFactories

这里看看 loadSpringFactories 的源码

```java
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

接下来按照spring.factories 中配置的类，会对应的去创建实例

这里在创建实例过程中，并不是任何条件都创建，而是依赖 @Conditional 、@ConditionalOnXXX 这些注解，决定是否加载。最终实现了自动装载配置


### 2.3 自动配置总结

::: danger
springboot 自动配置原理总结

1. 利用 @EnableAutoConfiguration 启动自动配置
2. @AutoConfigurationPackage 装载主配置包下的类，如： @Entity @Repository 这些
3. @Import(AutoConfigurationImportSelector.class) 最中查找到 META-INF/spring.factories 下配置的配置类
4. 利用 @Conditional 、@ConditionalOnXXX 这些注解，决定是否创建配置类
::: 

## 3 存疑

1. 源码里面怎么进入到AutoConfigurationImportSelector 的一些方法的，看调用链都是 ConfigurationClassParser.parse , 这个类有机会研究下 ？



---

参考资料

- [这样讲 SpringBoot 自动配置原理，你应该能明白了吧](https://juejin.cn/post/6844903849178873870)