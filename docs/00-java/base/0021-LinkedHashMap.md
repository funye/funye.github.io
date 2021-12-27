---
title: 集合类：LinkedHashMap
date: 2020-12-08
categories:
 - Java基础
tags:
 - Map
---


## LinkedHashMap 结构
**LinkedHashMap的结构可以简单的看做是：HashMap 的基本结构 + 访问链**

**结构原理**

LinkedHashMap实现上大体同HashMap一致，但是其节点上加上 before， after两个指针，当设置 **accessOrder=true** 时，通过这个指针构成一个访问链，最近访问的数据放在队尾。可以用这个特点实现类似 LRU 的缓存算法

<!-- more-->

```java
// LinkedHashMap的节点结构
static class Entry<K,V> extends HashMap.Node<K,V> {
    Entry<K,V> before, after; // 前向和后向指针
    Entry(int hash, K key, V value, Node<K,V> next) {
        super(hash, key, value, next);
    }
}
```

```java
// LinkedHashMap的节点被访问后执行的操作
void afterNodeAccess(Node<K,V> e) { // move node to last
    LinkedHashMap.Entry<K,V> last;
    if (accessOrder && (last = tail) != e) {
        LinkedHashMap.Entry<K,V> p =
            (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
        p.after = null;
        if (b == null)
            head = a;
        else
            b.after = a;
        if (a != null)
            a.before = b;
        else
            last = b;
        if (last == null)
            head = p;
        else {
            p.before = last;
            last.after = p;
        }
        tail = p;
        ++modCount;
    }
}
```



## LinkedHashMap实现 LRU 原理



LinkedHashMap的put方法是继承自HashMap的 ，我们看看HashMap的put方法源码

```java
final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    //...省略

    afterNodeInsertion(evict);// 这个方法会在插入数据后执行
    return null;
}

// LinkedHashMap实现了这方法
void afterNodeInsertion(boolean evict) { // possibly remove eldest
    LinkedHashMap.Entry<K,V> first;
    if (evict && (first = head) != null && removeEldestEntry(first)) {
        K key = first.key;
        removeNode(hash(key), key, null, false, true);
    }
}

// LinkedHashMap实现了这个方法，默认不删除数据，通过重写此方法，可以利用LinkedHashMap 做到删除首节点的动作，例如做一下缓存size判断，大于给定值，就删除（返回true）
protected boolean removeEldestEntry(Map.Entry<K,V> eldest) {
    return false;
}
```






---

参考资料：

- [LinkedHashMap实现LRU缓存](https://www.jianshu.com/p/d76a78086c3a)

