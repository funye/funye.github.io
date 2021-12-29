---
title: 基础：java中的发布订阅使用
date: 2021-12-28
categories:
 - Java基础
tags:
 - 发布订阅
 - event

---

java代码实现的时候，经常会用到发布订阅模式（生产者消费者模式），也会用到观察者模式。下面简单总结下几种常见的实现。

<!-- more -->

## 发布订阅常见实现

- Java的观察者模式
- guava的EventBus和 AsyncEventBus
- Disruptor的RingBuffer
- SpringEvent
- java Flow Api