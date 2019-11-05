
总结关于mysql的索引，查询优化，SQL技巧等

# 1 mysql索引

## 1.1 索引类型
- B-Tree索引
- Hash索引  （自定义hash索引  CRC32 ）
- R-Tree索引（空间索引）使用不多，
- 全文索引

### 1.1.1 B-Tree索引

没有特殊说明的时候，通常说的索引都是B-Tree类型的，他是根据数据值进行tree结构创建的索引。

#### B-Tree索引特征
- **`全值匹配`**，全值匹配指的是和索引中的所有列进行匹配。例如可以查询 `last_name='Michael' and first_name='Bay' and birthday='2019-11-05 03:37:43'` 的数据
- **`匹配最左前缀`**，索引可用于最左一列的查询。例如查询 `last_name='Steven'` 的数据
- **`匹配列前缀`**，匹配某一列的值的开头部分。例如查询 `last_name` 取值为a-j开头的数据
- **`匹配范围值`**， 索引可用于列值范围查询。例如查询 `last_name` 的取值在 aaa-bbb之前的值
- **`精确匹配某一列并范围匹配另外一列`**
- **`只访问索引的查询`**


#### B-Tree索引限制
- **`如果不是按照索引的最左列开始查找，则无法使用索引。`** 例如上面例子中索引不能用于查找 col_B=xx的信息。因为col_B不是最左列
- **`不能跳过索引中的列。`**例如 查询 col_A=a, col_C=c的数据的时候，col_C不能使用索引，只能索引到col_A
- **`如果查询中有某个列的范围查询，则其右边所有的列都无法使用索引优化查询。`**

#### B-Tree索引示例

```sql
-- 用户表
CREATE TABLE `t_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `last_name` varchar(32) DEFAULT NULL,
  `first_name` varchar(32) DEFAULT NULL,
  `birthday` datetime DEFAULT NULL,
  `email` varchar(32) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `t_idx_ln_fn_bth` (`last_name`,`first_name`,`birthday`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8"

-- 一下几种情况的结果
-- 索引使用到 last_name、first_name、birthday
explain select * from t_user where last_name='Michael' and first_name='Bay' and birthday='2019-11-05 03:37:43';

-- 没有使用到索引
explain select * from t_user where first_name='Bay' and birthday='2019-11-05 03:37:43';

-- 索引只使用到 last_name 列
explain select * from t_user where last_name='Michael' and birthday='2019-11-05 03:37:43';

-- 索引使用到列 last_name、first_name
explain select * from t_user where last_name='Michael' and first_name='Bay' ;

-- 索引到列 last_name
explain select * from t_user where last_name='Michael' and first_name like 'B%' and birthday='2019-11-05 03:37:43';

```

<em style='color:red;'>注意：根据索引的限制，我们可以在SQL优化的时候，从这个方向考虑，索引列的顺序，代码中使用查询语句时候，SQL语句的列的顺序都可以是优化的点</em>

### 1.1.2 Hash索引

#### Hash索引定义
hash索引是基于哈希表实现的，只有**精确匹配索引所有列的查询**才有效。对于每一行数据，存储引擎都会对数所有的索引列计算一个hash code,hash索引是将所有的hash code 和执向数据的指针存储在hash表中来实现的。对应hash冲突的处理，就是对冲突的数据以链表形式存储。

*注意：MySQL中显示支持hash索引的只有 Memory引擎。*

#### Hash索引限制
从hash索引的结构可以知道，由于索引使用存储hashcode ,所以体积小，结构紧凑。查询速度非常快。它的使用限制也非常明显：

1. 哈希索引只包含哈希值和行指针，而不是存储字段值，所有必须要使用索引读取行
2. 哈希索引数据并不是按照索引值顺序存储（hash值存储），所以不能排序
3. 不能支持部分配置索引，因为索引存储的是全值计算出来的hash 
4. 同上面的原因，所以只能支持等值比较查询，包括 =, in() <=> 
5. 访问哈希索引的数据非常快，除非有很多哈希冲突，他哈希冲突时候，会去遍历链表
6. 哈希冲突多的情况下，会增加索引维护的成本（要在链表中遍历进行增删操作）

#### 自定义哈希索引

如果搜索引擎不支持索引，可以在创建一个hash值，然后利用b-tree索引这很hash值，在查询的where子句中指明这个hash值的列，效果就如同hash索引了。还可以通过选择更好的hash算法，可更加容易避免hash冲突,优化索引。

*示例：*
```sql
-- t_url 一个存储url的表，url地址可能很长，直接b-tree索引，索引空间大(b-tree索引的是值)
CREATE TABLE `t_url` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `url` varchar(255) DEFAULT NULL,
  `url_crc` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `t_idx_url_crc` (`url_crc`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8"

```

针对上面的示例，每次写入数据的时候，根据url的值  使用CRC32函数生成 url_crc的值，查询的时候，使用CRC32(url)的值作为where条件，使他能够给被索引，**同时需要添加 url作为条件，这样非常必要，因为hash值  CRC32函数的结果可能冲突，如果只按照这个值，可能查出多条，所以需要加上url的值，确定数据的准确性**	

查询表现为：

```sql
-- 没有使用索引
explain select * from t_url where url='https://www.baidu.com';

-- 使用索引列 url_crc
explain select * from t_url where url_crc=CRC32("https://www.baidu.com") and url='https://www.baidu.com';
```  

<em style='color:red;'>注意：自定义索引，是平时的作为SQL优化的一个重要手段，hash值的创建可以使用触发器控制，也可以在应用中通过程序写入。</em>

### 1.1.3 R-Tree索引（空间索引）
这类索引使用所有维度来索引数据，mysql支持较弱


### 1.1.4 全文索引
它查找的是文本中的关键字，有点类似搜索引擎


## 1.2 索引的优点

- 1.索引大大减少了服务器需要扫描的数据量 
- 2.索引可以帮助服务器避免排序和临时表 
- 3.索引可以将 随机I/O 变为 顺序I/O


## 1.3 高性能的索引策略




# 2 查询优化


# 3 常见复杂查询

记录常见的一些复杂查询的实现方式（仅使用数据库）

## 3.1 分组查询取 最大、最小、前N、后N	条记录




