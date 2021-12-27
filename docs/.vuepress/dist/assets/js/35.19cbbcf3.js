(window.webpackJsonp=window.webpackJsonp||[]).push([[35],{641:function(t,s,a){t.exports=a.p+"assets/img/ds-reduce-1.5c28ce60.png"},740:function(t,s,a){"use strict";a.r(s);var r=a(4),_=Object(r.a)({},(function(){var t=this,s=t.$createElement,r=t._self._c||s;return r("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[r("h1",{attrs:{id:"高并发-熔断与降级"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#高并发-熔断与降级"}},[t._v("#")]),t._v(" 高并发：熔断与降级")]),t._v(" "),r("h2",{attrs:{id:"_1-为什么需要熔断与降级"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_1-为什么需要熔断与降级"}},[t._v("#")]),t._v(" 1.为什么需要熔断与降级")]),t._v(" "),r("p",[t._v("在分布式微服务环境下，服务之间经常是存在相互依赖的关系的")]),t._v(" "),r("p",[r("img",{attrs:{src:a(641),alt:""}})]),t._v(" "),r("h2",{attrs:{id:"_2-服务熔断"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_2-服务熔断"}},[t._v("#")]),t._v(" 2 服务熔断")]),t._v(" "),r("p",[r("strong",[t._v("降级一般而言指的是我们自身的系统出现了故障而降级。而熔断一般是指依赖的外部接口出现故障的情况断绝和外部接口的关系。")])]),t._v(" "),r("p",[t._v("例如你的A服务里面的一个功能依赖B服务，这时候B服务出问题了，返回的很慢。这种情况可能会因为这么一个功能而拖慢了A服务里面的所有功能，因此我们这时候就需要熔断！即当发现A要调用这B时就直接返回错误(或者返回其他默认值啊啥的)，就不去请求B了。我这还是举了两个服务的调用，有些那真的是一环扣一环，出问题不熔断，那真的是会雪崩。")]),t._v(" "),r("h2",{attrs:{id:"_3-服务降级"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_3-服务降级"}},[t._v("#")]),t._v(" 3 服务降级")]),t._v(" "),r("p",[t._v("降级也就是服务降级，当我们的服务器压力剧增为了"),r("strong",[t._v("保证核心功能的可用性")]),t._v(" ，而"),r("strong",[t._v("选择性的降低一些功能的可用性，或者直接关闭该功能")]),t._v("。这就是典型的"),r("strong",[t._v("丢车保帅")]),t._v("了。 就比如贴吧类型的网站，当服务器吃不消的时候，可以选择把发帖功能关闭，注册功能关闭，改密码，改头像这些都关了，为了确保登录和浏览帖子这种核心的功能。")]),t._v(" "),r("h2",{attrs:{id:"_4-熔断方案"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_4-熔断方案"}},[t._v("#")]),t._v(" 4 熔断方案")]),t._v(" "),r("h3",{attrs:{id:"_4-1-hystrix-方案"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-hystrix-方案"}},[t._v("#")]),t._v(" 4.1 Hystrix 方案")]),t._v(" "),r("h3",{attrs:{id:"_4-2-sentinel-方案"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_4-2-sentinel-方案"}},[t._v("#")]),t._v(" 4.2 Sentinel 方案")]),t._v(" "),r("h3",{attrs:{id:"_4-3-其他方案"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#_4-3-其他方案"}},[t._v("#")]),t._v(" 4.3 其他方案")])])}),[],!1,null,null,null);s.default=_.exports}}]);