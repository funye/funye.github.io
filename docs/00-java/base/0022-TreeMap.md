---
title: 集合类：TreeMap
date: 2020-12-08
categories:
 - Java基础
tags:
 - Map
---

## TreeMap

TreeMap是红黑树的java实现

特点

- 有序Map
- 可以自定义排序规则，构造方法传入Comparator 或者 key 实现Comparable接口
- 具备红黑树的特性



利用TreeSet(TreeMap) 实现 LFU 算法， 原理： 有序map, 按照访问时间和访问次数（time, accessCount）进行排序后，删除第一个

```java
static class LFUCache {

    // 插入排序 小到大
    class Node implements Comparable<Node>{
        int key;
        int value;
        int accessCount;
        int time;

        public Node(int key, int value, int accessCount, int time) {
            this.key = key;
            this.value = value;
            this.accessCount = accessCount;
            this.time = time;
        }

        @Override
        public int compareTo(Node o) {
            return this.accessCount == o.accessCount ? this.time - o.time : this.accessCount-o.accessCount;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o instanceof Node) {
                Node node = (Node) o;
                return key == node.key && accessCount == node.accessCount && time == node.time;
            }
            return false;
        }

        @Override
        public int hashCode() {
            return accessCount * 1000000007 + time;
        }
    }

    private Map<Integer, Node> cache;
    private int capacity;
    private TreeSet<Node> cnt;
    private int time;

    public LFUCache(int capacity) {
        this.cache = new HashMap<>();
        this.capacity = capacity;
        this.cnt = new TreeSet<>();
        this.time = 0;
    }

    public int get(int key) {
        if (capacity == 0) {
            return -1;
        }

        if (!cache.containsKey(key)) {
            return -1;
        }

        Node node = cache.get(key);
        cnt.remove(node);
        node.accessCount++;
        node.time = ++time;
        cnt.add(node);
        return node.value;
    }

    public void put(int key, int value) {
        if (capacity == 0) {
            return;
        }

        if (cache.containsKey(key)) {
            Node node = cache.get(key);
            cnt.remove(node);
            node.accessCount++;
            node.time = ++time;
            node.value = value;
            cnt.add(node);
        } else {
            Node node = new Node(key, value, 1, ++time);
            if (cache.size() == capacity) {
                Node rm = cnt.first();
                cache.remove(rm.key);
                cnt.remove(rm);
            }
            cache.put(key, node);
            cnt.add(node);

        }
    }

}

```








---



