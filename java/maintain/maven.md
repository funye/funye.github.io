# 十分钟解惑，让你真正用好MAVEN

我们日常工作中经常使用到maven，基本操作大家都会，但是涉及到父子pom继承和多模块的时候，很多时候使用的就会很混乱。

本篇文章主要针对maven的父子pom继承和多模块展开一些讨论，默认读者以使用过maven（可参考：https://www.ibofine.com/mavenbook/index.html）

## MAVEN的关于依赖的基本配置

### 1. 坐标（定位三要素）

```xml
<project>
    <groupId>xxx.xxxxx.xxxx</groupId> <!-- 公司业务 -->
    <artifactId>xxx-xxxx</artifactId> <!-- 项目 -->
    <version>1.0.0</version> <!-- 版本 -->

    <!-- ....其他配置 -->
</project>
```

### 2. 定义属性

```xml
<project>
    <properties>
        <custom-data>hello</custom-data> <!-- 自定义一个属性，在pom及子pom中使用${} 的形式使用 -->
        <lombok-version>1.18.10</lombok-version> <!-- 定义lombok的版本号 -->
    </properties>
</project>
```

### 3. 申明依赖

```xml
<project>
    <dependencyManagement>
        <dependencies>
            <!-- 定义好可能使用的包和版本 -->
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok-version}</version> <!-- 版本统一放在属性里面管理，方便看，此处引用 -->
            </dependency>
        
            <!-- .....其他包 -->
        </dependencies>
    </dependencyManagement>
</project>
```

### 4. 使用依赖

```xml
<project>
    <dependencies>
        <!-- 实际使用的包，dependencyManagement 定义过版本，实际使用的时候不需要写版本 -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
    
        <!-- .....其他包 -->
    </dependencies>
</project>
```

### 5. 排除依赖

```xml
<project>
    <properties>
        <custom-data>hello</custom-data> <!-- 自定义一个属性，在pom及子pom中使用${} 的形式使用 -->
        <lombok-version>1.18.10</lombok-version> <!-- 定义lombok的版本号 -->
        <spring.version>5.2.4.RELEASE</spring.version> 
    </properties>

    <dependencyManagement>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>${spring.version}</version>
            <exclusions>
                <exclusion> <!-- 排除日志包 commons-logging ,也可以选择在使用引用的时候排除 -->
                    <groupId>commons-logging</groupId>
                    <artifactId>commons-logging</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencyManagement>
</project>
```
***注意：*** 排除依赖存在一些未知的风险。比如 A-->B, B-->C， 当B的某个实现需要C， 而B的这实现会在A中运行的时候，排除了C就可能出错。

## MAVEN依赖特性

### 1. maven的依赖存在传递性

如下：
```text
A --> B , B-->C 则 A -- > B --> C

A 依赖了B包 ， B中依赖C包 ，则 A如果自动会导入C ( 这个原因也是为什会有 排除依赖的存在，有时候A只想依赖B，而不想要C的时候。)
```

### 2. 依赖顺序原则

依赖的顺序决定了最终使用的是哪个jar包，maven在解析依赖的时候的顺序是。**先按最短路径，再按申明顺序**

- **最短路径优先**
如 a--> b --> c1.1.0 , a-->d --> e -->c1.2.0  则最终a中用的 c1.1.0

- **申明顺序优先**
当路径相同的时候，不能判断使用哪个，这时候就是按照申明的顺序 ，如 a-->b-->c1.1.0  a-->d-->c1.2.0 此时，如果路径c是一样的，如果b的申明在d的前面，
在使用的是 c1.1.0, 反之则为 c1.2.0

## MAVEN继承特性（父子pom）

在pom文件中定义parent节点之后，子pom就可以继承父pom中的依赖和属性。

通常使用这个特性，在父pom中统一一些公共的东西，如jar版本，定义的一些属性等。主要就是抽离，统一管理。

```xml
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.2.2.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository , 这时候 spring-boot-starter-parent 中定义的属性和依赖都可以在当前pom中使用 -->
    </parent>

    <groupId>com.fun</groupId>
    <artifactId>learn</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>learn</name>
    <description>Demo project for Spring Boot</description>
</project>
```


## MAVEN聚合特性（module）
module可以看做是项目结构的描述，通过`<modules><module>...</module></modules>` 来定义，可以一起来打包的一个整体。

```xml
<project>
    <groupId>com.fun</groupId>
    <artifactId>learn</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>learn</name>
    <description>Demo project for Spring Boot</description>
    
    <modules>
        <module>learn-api</module>
        <module>learn-server</module>
    </modules>
</project>

<!-- 
上面配置的项目结构
learn
   |-learn-api
   |-learn-server
-->
```

## MAVEN继承与聚合的区别
继承和聚合没有绝对要求的对应关系，他们目的上是不同。

- **继承** 讲究的是提炼统一公共的部分，子项目都使用，统一管理公共部分。（使用时候，可以单独定义一个父pom给所有的项目使用，统一项目中的jar包）

- **聚合** 更像是定义项目的结构，哪些作为一个整理。

## MAVEN最佳实践

### 实践场景
假设有下面一个实例，一个系统(fun-mall)有 用户服务(user)、订单服务(order)、支付服务(pay)、商品服务(product)， 他们之间通过dubbo调用。那么我们的使用maven可以统一成如下结构

```text
xxx-api 提供dubbo调用的一些接口定义，**建议尽量少的依赖第三方的包。理论上他只是定义接口的和数据模型的。不然，当别人引用你的时候，可能出现第三方包的冲突，需要排除依赖**
xxx-server 启动jvm的进程

fun-mall
    |-- user
        |-- user-api
        |-- user-server
    |-- order
        |-- order-api
        |-- order-server
    |-- pay
        |-- pay-api
        |-- pay-server
    |-- product
        |-- product-api
        |-- product-server
```
针对上面的接口，我们创建项目的时候有两种比较合理的方式

### 实现方式1

1. 创建一个项目 fun-mall 一个git仓库地址，fun-mall下面包含四个module， 每个module下面有包含xxx-api,xxx-server 两个module， 所有模块的父pom都使用fun-mall（继承和聚合的区别） 

```text
fun-mall
    |-- user
        |-- user-api
            |-- pom.xml
        |-- user-server
            |-- pom.xml
        |-- pom.xml
    |-- order
        |-- order-api
            |-- pom.xml
        |-- order-server
            |-- pom.xml
        |-- pom.xml
    |-- pay
        |-- pay-api
            |-- pom.xml
        |-- pay-server
            |-- pom.xml
        |-- pom.xml
    |-- product
        |-- product-api
        |-- product-server
        |-- pom.xml
    |-- pom.xml
```
具体配置

**fun-mall的 pom.xml**

```xml
<project>
    <groupId>com.fun</groupId>
    <artifactId>fun-mall</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>fun-mall</name>
    <description>fun mall</description>
    <packaging>pom</packaging> <!-- 注意是pom -->
    
    <modules>
        <module>user</module>
        <module>order</module>
        <module>pay</module>
        <module>product</module>
    </modules>

    <properties>
        <!-- 一些通用的属性 -->
    </properties>
    
    <dependencyManagement>
        <dependency>
            <!-- 依赖的jar和版本申明 -->
        </dependency>
    </dependencyManagement>
    
    <!-- 其他配置 -->
</project>
```

**user 的pom.xml**

```xml
<project>
    <parent>
        <groupId>com.fun</groupId>
        <artifactId>fun-mall</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>

    <artifactId>user</artifactId>
    <description>user module</description>
    <packaging>pom</packaging> <!-- 注意是pom, 另外groupId和version继承父类 -->
    
    <modules>
        <module>user-api</module>
        <module>order-server</module>
    </modules>

    <dependencies>
        <dependency>
            <!-- 实际依赖的jar和版本 -->
        </dependency>
    </dependencies>
    
    <!-- 其他配置 -->
</project>
```

**user-api 的pom.xml**

```xml
<project>
    <parent>
        <groupId>com.fun</groupId>
        <artifactId>fun-mall</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>

    <artifactId>user-api</artifactId>
    <description>user server api define </description>
    <packaging>jar</packaging> <!-- 打包成jar提供出去给别的服务使用，另外groupId和version继承父类，也可自己指定新的 -->

    <dependencies>
        <dependency>
            <!-- 实际依赖的jar和版本 -->
        </dependency>
    </dependencies>
    
    <!-- 其他配置 -->
</project>
```

**user-server的pom.xml**

```xml
<project>
    <parent>
        <groupId>com.fun</groupId>
        <artifactId>fun-mall</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>

    <artifactId>user-server</artifactId>
    <description>user server impl</description>
    <packaging>jar</packaging> <!-- 打包成可运行的jar或者war，或者zip等格式 。另外groupId和version继承父类，也可自己指定新的-->

    <dependencies>
        <dependency>
            <!-- 实际依赖的jar和版本 -->
        </dependency>
    </dependencies>
    
    <!-- 添加打包可运行的jar或者war或者zip的配置 -->

    <!-- 其他配置 -->
</project>
```
order、pay、product的配置，同user模块类似即可。

### 实现方式2

2. 创建一个fun-mall 做个父项目，没有模块。 然后分别创建四个 项目 user、order、pay、product 继承这个fun-mall 拱为5个git地址，所有项目的parent都是 fun-mall（继承和聚合的区别）

```text
fun-mall
    |-- pom.xml

--------

|-- user
    |-- user-api
        |-- pom.xml
    |-- user-server
        |-- pom.xml
    |-- pom.xml

--------

|-- order
    |-- order-api
        |-- pom.xml
    |-- order-server
        |-- pom.xml
    |-- pom.xml

--------

|-- pay
    |-- pay-api
        |-- pom.xml
    |-- pay-server
        |-- pom.xml
    |-- pom.xml

--------

|-- product
    |-- product-api
    |-- product-server
    |-- pom.xml
```

这种方式的pom和上面在一个工程里面的方式是没有区别的，只是代码放在不同的仓库地址里面而已。

考虑到不同模块迭代速度不同，每个服务有自己的代码和分支进行开发，相比上面在整个一个git而言，更加灵活，不用对其他的服务产生分支。

其次，如果涉及到不同服务给不同团队开发，或者不同服务不需要看别人的实现的。只关心自己，则分开仓库很好的满足了

## MAVEN deploy时父pom的问题

我们在deploy jar的时候，经常遇到一些因为父pom没有推导致推包失败的情况。所有一般推包看分为两种情况来处理

### 子pom未使用父pom的变量

这种情况下

- 方式1：因为子pom没有使用父pom的变量，可能考虑单独deploy, 注释掉<parent>, 然后确保自己有artfactId和version ，直接deploy.

- 方式2：先推一下父pom，在推子模块。如果pom有很多子模块（fun-mall的第一种），可考虑只推父pom（`mvn clean deploy -N`），
不要推子模块（所有的模块都推，连实现server可能都推了，没必要），然后再推需要的jar(如，user-spi，)


### 子pom有使用父pom的变量
这种情况下, 因为使用父模块的变量，不能使用注释parent（不然不识别），所有只能先推一下父pom, 再推当前jar, 如上面的方式二

### 记录

- 跳过Assembly：`clean deploy -DskipAssembly=true`
- 只推父pom: `mvn clean package deploy -Dmaven.test.skip=true -Drepository:snapshots -N`
- 分析maven的依赖树: `mvn dependency:tree >text.txt`


