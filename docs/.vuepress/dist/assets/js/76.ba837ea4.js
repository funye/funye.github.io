(window.webpackJsonp=window.webpackJsonp||[]).push([[76],{707:function(t,e,r){"use strict";r.r(e);var a=r(4),o=Object(a.a)({},(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[r("h2",{attrs:{id:"spring-aop-aop原理分析"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#spring-aop-aop原理分析"}},[t._v("#")]),t._v(" Spring AOP - AOP原理分析")]),t._v(" "),r("ul",[r("li",[t._v("Advice 方法级别切面\n"),r("ul",[r("li",[t._v("MethodBeforeAdvice  方法前")]),t._v(" "),r("li",[t._v("AfterReturningAdvice  方法后")]),t._v(" "),r("li",[t._v("MethodInterceptor 环绕")]),t._v(" "),r("li",[t._v("ThrowsAdvice 异常")])])]),t._v(" "),r("li",[t._v("ProxyFactoryBean 生成代理类 并关联上对应的 被代理类和切面advice")]),t._v(" "),r("li",[t._v("AbstractAutoProxyCreator 自定生成代理类 不用显示配置ProxyFactoryBean了")]),t._v(" "),r("li",[t._v("PointAdvisor 切面点 可以根据想要的规则，指定方法是否要被拦截\n"),r("ul",[r("li",[t._v("DefaultPointcutAdvisor  默认")]),t._v(" "),r("li",[t._v("RegexpMethodPointcutAdvisor  通过正则表达式来匹配拦截的方法")]),t._v(" "),r("li",[t._v("NameMatchMethodPointcutAdvisor 直接指定那些方法是需要拦截")])])])]),t._v(" "),r("p",[t._v("态代理是Spring实现AOP的默认方式，分为两种："),r("strong",[t._v("JDK动态代理")]),t._v("和"),r("strong",[t._v("CGLIB动态代理")]),t._v("。JDK动态代理面向接口，通过反射生成目标代理接口的匿名实现类；CGLIB动态代理则通过继承，使用字节码增强技术（或者"),r("code",[t._v("objenesis")]),t._v("类库）为目标代理类生成代理子类。Spring默认对接口实现使用JDK动态代理，对具体类使用CGLIB，同时也支持配置全局使用CGLIB来生成代理对象。")]),t._v(" "),r("p",[t._v("我们在切面配置中会使用到"),r("code",[t._v("@Aspect")]),t._v("注解，这里用到了"),r("strong",[t._v("Aspectj")]),t._v("的切面表达式。Aspectj是java语言实现的一个AOP框架，使用静态代理模式，拥有完善的AOP功能，与Spring AOP互为补充。Spring采用了Aspectj强大的切面表达式定义方式，但是默认情况下仍然使用动态代理方式，并未使用Aspectj的编译器和织入器，当然也支持配置使用Aspectj静态代理替代动态代理方式。Aspectj功能更强大，比方说它支持对字段、POJO类进行增强，与之相对，Spring只支持对Bean方法级别进行增强。")]),t._v(" "),r("p",[t._v("Spring对方法的增强有五种方式：")]),t._v(" "),r("ul",[r("li",[t._v("前置增强（"),r("code",[t._v("org.springframework.aop.MethodBeforeAdvice")]),t._v("）：在目标方法执行之前进行增强；")]),t._v(" "),r("li",[t._v("后置增强（"),r("code",[t._v("org.springframework.aop.AfterReturningAdvice")]),t._v("）：在目标方法执行之后进行增强；")]),t._v(" "),r("li",[t._v("环绕增强（"),r("code",[t._v("org.aopalliance.intercept.MethodInterceptor")]),t._v("）：在目标方法执行前后都执行增强；")]),t._v(" "),r("li",[t._v("异常抛出增强（"),r("code",[t._v("org.springframework.aop.ThrowsAdvice")]),t._v("）：在目标方法抛出异常后执行增强；")]),t._v(" "),r("li",[t._v("引介增强（"),r("code",[t._v("org.springframework.aop.IntroductionInterceptor")]),t._v("）：为目标类添加新的方法和属性。")])]),t._v(" "),r("h2",{attrs:{id:"spring-aop-使用时候常见问题"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#spring-aop-使用时候常见问题"}},[t._v("#")]),t._v(" Spring AOP 使用时候常见问题")]),t._v(" "),r("h3",{attrs:{id:"_1-同方法每部调用"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_1-同方法每部调用"}},[t._v("#")]),t._v(" 1 同方法每部调用")]),t._v(" "),r("h3",{attrs:{id:"_2-循环依赖问题"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_2-循环依赖问题"}},[t._v("#")]),t._v(" 2 循环依赖问题")]),t._v(" "),r("h3",{attrs:{id:"_3-非public方法"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_3-非public方法"}},[t._v("#")]),t._v(" 3 非public方法")]),t._v(" "),r("h3",{attrs:{id:"_4-final关键字问题"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_4-final关键字问题"}},[t._v("#")]),t._v(" 4 final关键字问题")]),t._v(" "),r("hr"),t._v(" "),r("p",[t._v("参考链接：")]),t._v(" "),r("ul",[r("li",[t._v("https://blog.csdn.net/zhangliangzi/article/details/52334964")]),t._v(" "),r("li",[t._v("https://blog.csdn.net/weixin_34102807/article/details/85826055?utm_medium=distribute.pc_relevant_download.none-task-blog-2~default~BlogCommendFromBaidu~default-1.nonecase&depth_1-utm_source=distribute.pc_relevant_download.none-task-blog-2~default~BlogCommendFromBaidu~default-1.nonecas")]),t._v(" "),r("li",[t._v("https://www.cnblogs.com/ityouknow/p/5329550.html")]),t._v(" "),r("li",[t._v("https://blog.csdn.net/u013905744/article/details/91364736")]),t._v(" "),r("li",[r("a",{attrs:{href:"https://www.jianshu.com/p/3bc6c6713b08",target:"_blank",rel:"noopener noreferrer"}},[t._v("Spring AOP中循环依赖解决"),r("OutboundLink")],1)])])])}),[],!1,null,null,null);e.default=o.exports}}]);