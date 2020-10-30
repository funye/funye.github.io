# ElasticSearch基础实践

`发布于`：`{docsify-updated}`

---

## ES的文档概念介绍

 - 文档介绍
 - 文档元数据
  
## ES的基本操作
 - 安装和启动
 ```
bin/elasticsearch -E node.name=node0 -E cluster.name=fun-cluster -E path.data=node0_data -d
bin/elasticsearch -E node.name=node1 -E cluster.name=fun-cluster -E path.data=node1_data -d
bin/elasticsearch -E node.name=node2 -E cluster.name=fun-cluster -E path.data=node2_data -d
 ```
 - 文档新建、修改、删除
 - 文档查询


## 分片内部原理

## 集群内的原理

## 倒排索引


## 关于聚合时候的问题
https://blog.csdn.net/shuxingcq/article/details/84878164

---

参考资料：
- [Elasticsearch: 权威指南](https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html)




