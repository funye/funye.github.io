(window.webpackJsonp=window.webpackJsonp||[]).push([[57],{681:function(t,s,a){"use strict";a.r(s);var n=a(4),r=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"mysql索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#mysql索引"}},[t._v("#")]),t._v(" MySQL索引")]),t._v(" "),a("p",[t._v("总结关于mysql的索引，查询优化，SQL技巧等")]),t._v(" "),a("h2",{attrs:{id:"_1-索引类型"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-索引类型"}},[t._v("#")]),t._v(" 1 索引类型")]),t._v(" "),a("ul",[a("li",[t._v("B-Tree索引")]),t._v(" "),a("li",[t._v("Hash索引  （自定义hash索引  CRC32 ）")]),t._v(" "),a("li",[t._v("R-Tree索引（空间索引）使用不多，")]),t._v(" "),a("li",[t._v("全文索引")])]),t._v(" "),a("h3",{attrs:{id:"_1-1-b-tree索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-b-tree索引"}},[t._v("#")]),t._v(" 1.1 B-Tree索引")]),t._v(" "),a("p",[t._v("没有特殊说明的时候，通常说的索引都是B-Tree类型的，他是根据数据值进行tree结构创建的索引。")]),t._v(" "),a("h4",{attrs:{id:"_1-1-1-b-tree索引特征"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-1-b-tree索引特征"}},[t._v("#")]),t._v(" 1.1.1 B-Tree索引特征")]),t._v(" "),a("ul",[a("li",[a("strong",[a("code",[t._v("全值匹配")])]),t._v("，全值匹配指的是和索引中的所有列进行匹配。例如可以查询 "),a("code",[t._v("last_name='Michael' and first_name='Bay' and birthday='2019-11-05 03:37:43'")]),t._v(" 的数据")]),t._v(" "),a("li",[a("strong",[a("code",[t._v("匹配最左前缀")])]),t._v("，索引可用于最左一列的查询。例如查询 "),a("code",[t._v("last_name='Steven'")]),t._v(" 的数据")]),t._v(" "),a("li",[a("strong",[a("code",[t._v("匹配列前缀")])]),t._v("，匹配某一列的值的开头部分。例如查询 "),a("code",[t._v("last_name")]),t._v(" 取值为a-j开头的数据")]),t._v(" "),a("li",[a("strong",[a("code",[t._v("匹配范围值")])]),t._v("， 索引可用于列值范围查询。例如查询 "),a("code",[t._v("last_name")]),t._v(" 的取值在 aaa-bbb之前的值")]),t._v(" "),a("li",[a("strong",[a("code",[t._v("精确匹配某一列并范围匹配另外一列")])])]),t._v(" "),a("li",[a("strong",[a("code",[t._v("只访问索引的查询")])])])]),t._v(" "),a("h4",{attrs:{id:"_1-1-2-b-tree索引限制"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-2-b-tree索引限制"}},[t._v("#")]),t._v(" 1.1.2 B-Tree索引限制")]),t._v(" "),a("ul",[a("li",[a("strong",[a("code",[t._v("如果不是按照索引的最左列开始查找，则无法使用索引。")])]),t._v(" 例如上面例子中索引不能用于查找 col_B=xx的信息。因为col_B不是最左列")]),t._v(" "),a("li",[t._v("**"),a("code",[t._v("不能跳过索引中的列。")]),t._v("**例如 查询 col_A=a, col_C=c的数据的时候，col_C不能使用索引，只能索引到col_A")]),t._v(" "),a("li",[a("strong",[a("code",[t._v("如果查询中有某个列的范围查询，则其右边所有的列都无法使用索引优化查询。")])])])]),t._v(" "),a("h4",{attrs:{id:"_1-1-3-b-tree索引示例"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-3-b-tree索引示例"}},[t._v("#")]),t._v(" 1.1.3 B-Tree索引示例")]),t._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 用户表")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("CREATE")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("TABLE")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("t_user"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("id"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("bigint")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("20")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("NOT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("AUTO_INCREMENT")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("last_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("varchar")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("32")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("first_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("varchar")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("32")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("birthday"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("datetime")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("email"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("varchar")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("32")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("create_time"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("datetime")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("update_time"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("datetime")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("PRIMARY")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("KEY")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("id"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("KEY")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("t_idx_ln_fn_bth"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("last_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("first_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("birthday"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("ENGINE")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("InnoDB")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("AUTO_INCREMENT")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("CHARSET")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v('utf8"\n\n'),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 一下几种情况的结果")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 索引使用到 last_name、first_name、birthday")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("explain")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_user "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("where")]),t._v(" last_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Michael'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("and")]),t._v(" first_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Bay'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("and")]),t._v(" birthday"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'2019-11-05 03:37:43'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 没有使用到索引")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("explain")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_user "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("where")]),t._v(" first_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Bay'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("and")]),t._v(" birthday"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'2019-11-05 03:37:43'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 索引只使用到 last_name 列")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("explain")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_user "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("where")]),t._v(" last_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Michael'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("and")]),t._v(" birthday"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'2019-11-05 03:37:43'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 索引使用到列 last_name、first_name")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("explain")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_user "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("where")]),t._v(" last_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Michael'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("and")]),t._v(" first_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Bay'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 索引到列 last_name")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("explain")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_user "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("where")]),t._v(" last_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'Michael'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("and")]),t._v(" first_name "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("like")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'B%'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("and")]),t._v(" birthday"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'2019-11-05 03:37:43'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n")])])]),a("p",[a("em",{staticStyle:{color:"red"}},[t._v("注意：根据索引的限制，我们可以在SQL优化的时候，从这个方向考虑，索引列的顺序，代码中使用查询语句时候，SQL语句的列的顺序都可以是优化的点")])]),t._v(" "),a("h3",{attrs:{id:"_1-2-hash索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-hash索引"}},[t._v("#")]),t._v(" 1.2 Hash索引")]),t._v(" "),a("h4",{attrs:{id:"_1-2-1-hash索引定义"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-1-hash索引定义"}},[t._v("#")]),t._v(" 1.2.1 Hash索引定义")]),t._v(" "),a("p",[t._v("hash索引是基于哈希表实现的，只有"),a("strong",[t._v("精确匹配索引所有列的查询")]),t._v("才有效。对于每一行数据，存储引擎都会对数所有的索引列计算一个hash code,hash索引是将所有的hash code 和执向数据的指针存储在hash表中来实现的。对应hash冲突的处理，就是对冲突的数据以链表形式存储。")]),t._v(" "),a("p",[a("em",[t._v("注意：MySQL中显示支持hash索引的只有 Memory引擎。")])]),t._v(" "),a("h4",{attrs:{id:"_1-2-2-hash索引限制"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-2-hash索引限制"}},[t._v("#")]),t._v(" 1.2.2 Hash索引限制")]),t._v(" "),a("p",[t._v("从hash索引的结构可以知道，由于索引使用存储hashcode ,所以体积小，结构紧凑。查询速度非常快。它的使用限制也非常明显：")]),t._v(" "),a("ol",[a("li",[t._v("哈希索引只包含哈希值和行指针，而不是存储字段值，所有必须要使用索引读取行")]),t._v(" "),a("li",[t._v("哈希索引数据并不是按照索引值顺序存储（hash值存储），所以不能排序")]),t._v(" "),a("li",[t._v("不能支持部分配置索引，因为索引存储的是全值计算出来的hash")]),t._v(" "),a("li",[t._v("同上面的原因，所以只能支持等值比较查询，包括 =, in() <=>")]),t._v(" "),a("li",[t._v("访问哈希索引的数据非常快，除非有很多哈希冲突，他哈希冲突时候，会去遍历链表")]),t._v(" "),a("li",[t._v("哈希冲突多的情况下，会增加索引维护的成本（要在链表中遍历进行增删操作）")])]),t._v(" "),a("h4",{attrs:{id:"_1-2-3-自定义哈希索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-3-自定义哈希索引"}},[t._v("#")]),t._v(" 1.2.3 自定义哈希索引")]),t._v(" "),a("p",[t._v("如果搜索引擎不支持索引，可以在创建一个hash值，然后利用b-tree索引这很hash值，在查询的where子句中指明这个hash值的列，效果就如同hash索引了。还可以通过选择更好的hash算法，可更加容易避免hash冲突,优化索引。")]),t._v(" "),a("p",[a("em",[t._v("示例：")])]),t._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- t_url 一个存储url的表，url地址可能很长，直接b-tree索引，索引空间大(b-tree索引的是值)")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("CREATE")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("TABLE")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("t_url"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("id"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("bigint")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("20")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("NOT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("AUTO_INCREMENT")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("url"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("varchar")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("255")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("url_crc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("bigint")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("20")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("PRIMARY")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("KEY")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("id"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("KEY")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("t_idx_url_crc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),t._v("url_crc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("`")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("ENGINE")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("InnoDB")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("AUTO_INCREMENT")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("DEFAULT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("CHARSET")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v('utf8"\n\n')])])]),a("p",[t._v("针对上面的示例，每次写入数据的时候，根据url的值  使用CRC32函数生成 url_crc的值，查询的时候，使用CRC32(url)的值作为where条件，使他能够给被索引，"),a("strong",[t._v("同时需要添加 url作为条件，这样非常必要，因为hash值  CRC32函数的结果可能冲突，如果只按照这个值，可能查出多条，所以需要加上url的值，确定数据的准确性")])]),t._v(" "),a("p",[t._v("查询表现为：")]),t._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 没有使用索引")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("explain")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_url "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("where")]),t._v(" url"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'https://www.baidu.com'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 使用索引列 url_crc")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("explain")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_url "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("where")]),t._v(" url_crc"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("CRC32"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"https://www.baidu.com"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("and")]),t._v(" url"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'https://www.baidu.com'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[a("em",{staticStyle:{color:"red"}},[t._v("注意：自定义索引，是平时的作为SQL优化的一个重要手段，hash值的创建可以使用触发器控制，也可以在应用中通过程序写入。")])]),t._v(" "),a("h3",{attrs:{id:"_1-3-r-tree索引-空间索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-r-tree索引-空间索引"}},[t._v("#")]),t._v(" 1.3 R-Tree索引（空间索引）")]),t._v(" "),a("p",[t._v("这类索引使用所有维度来索引数据，mysql支持较弱")]),t._v(" "),a("h3",{attrs:{id:"_1-4-全文索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-全文索引"}},[t._v("#")]),t._v(" 1.4 全文索引")]),t._v(" "),a("p",[t._v("它查找的是文本中的关键字，有点类似搜索引擎")]),t._v(" "),a("h2",{attrs:{id:"_2-索引的优点"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-索引的优点"}},[t._v("#")]),t._v(" 2 索引的优点")]),t._v(" "),a("ul",[a("li",[t._v("1.索引大大减少了服务器需要扫描的数据量")]),t._v(" "),a("li",[t._v("2.索引可以帮助服务器避免排序和临时表")]),t._v(" "),a("li",[t._v("3.索引可以将 随机I/O 变为 顺序I/O")])]),t._v(" "),a("h2",{attrs:{id:"_3-高性能的索引策略"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-高性能的索引策略"}},[t._v("#")]),t._v(" 3 高性能的索引策略")]),t._v(" "),a("h3",{attrs:{id:"_3-1-独立的列"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-1-独立的列"}},[t._v("#")]),t._v(" 3.1 独立的列")]),t._v(" "),a("ol",[a("li",[t._v("使用独立的列。独立列命中索引，不能是表达式，也不能是函数的参数")])]),t._v(" "),a("h3",{attrs:{id:"_3-2-前缀索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-2-前缀索引"}},[t._v("#")]),t._v(" 3.2 前缀索引")]),t._v(" "),a("p",[t._v("当被索引的列长度很长的时候，如 Text, BLOB, 或者长度很大的VARCHAR的时候，直接整列的索引会使得索引很大，性能差。此时有两种方式处理来优化。")]),t._v(" "),a("ol",[a("li",[t._v("使用前面说的 建立自定义的hashs索引")]),t._v(" "),a("li",[t._v("使用列的前缀部分作为索引，前缀的长度选择在于索引的选择性控制")])]),t._v(" "),a("p",[a("strong",[t._v("使用技巧")])]),t._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 计算完整列的选择性")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("distinct")]),t._v(" city_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_city\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 分别计算前缀取长度为 4、5、6、7的选择性")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("distinct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("LEFT")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("city_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("4")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("）"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" sel4"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" \n\t   "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("distinct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("LEFT")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("city_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("）"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" sel5"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n\t   "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("distinct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("LEFT")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("city_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("）"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" sel6"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n\t   "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("distinct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("LEFT")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("city_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("7")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("）"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" sel7\n\t   \t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" t_city\n")])])]),a("p",[t._v("通过上面的方法，找到前缀长度与整列选择性接近的值作为前缀索引长度。")]),t._v(" "),a("p",[t._v("通过设置索引长度来指明前缀索引的长度，如")]),t._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 指定city_name 上面建立长度为7的前缀索引")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("alter")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("table")]),t._v(" t_city "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("add")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("key")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("city_name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("7")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("p",[a("strong",[t._v("缺点")]),t._v("\n虽然前缀索引可以优化索引的大小，但是用前缀索引后，无法使用前缀索引做ORDER BY 和 GROUP BY ,也无法使用前缀索引做覆盖扫描。（从索引内容只有部分前缀，就可以理解了）")]),t._v(" "),a("h3",{attrs:{id:"_3-3-多列索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-3-多列索引"}},[t._v("#")]),t._v(" 3.3 多列索引")]),t._v(" "),a("p",[t._v("在多个列上面建立单独索引后，如果出现大量的索引合并，可以考虑建立多列索引，调整优化索引列的顺序来达到建立更高效的索引的目的。")]),t._v(" "),a("p",[t._v("索引列的顺序使用选择后得到结果集数量越小的排在越前面，或者使用上面的选择性判断方式，使用选择性高的列在前面，例如：")]),t._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 使用SUM匹配上的行数，匹配上的行数越少，索引检索越有价值")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("SUM")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("groupId"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("10137")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("SUM")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("userId"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1288826")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("SUM")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("anonymous"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" message\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- 根据选择性判断，选择行数在总基数比例越大  选择性越高")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("distinct")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("staff_id"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" staff_id_selected"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("distinct")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("customer_id"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" customer_id_selected"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("count")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" payment\n\n")])])]),a("h3",{attrs:{id:"_3-4-聚簇索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-4-聚簇索引"}},[t._v("#")]),t._v(" 3.4 聚簇索引")]),t._v(" "),a("p",[t._v("聚簇索引并不是一种单独的索引类型，而是一种数据存储的方式。")]),t._v(" "),a("h3",{attrs:{id:"_3-4-覆盖索引"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-4-覆盖索引"}},[t._v("#")]),t._v(" 3.4 覆盖索引")]),t._v(" "),a("p",[t._v("如果索引的叶子节点中已经包含了要查询的数据，那么就没有必要再"),a("code",[t._v("回表查询")]),t._v("，这种一个索引包含（或者说覆盖）所有需要查询的字段的值的索引，我们称之为覆盖索引。")]),t._v(" "),a("p",[t._v("以下这边文章有详细举例：https://www.cnblogs.com/myseries/p/11265849.html")]),t._v(" "),a("h2",{attrs:{id:"_4-查询优化"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-查询优化"}},[t._v("#")]),t._v(" 4 查询优化")]),t._v(" "),a("h3",{attrs:{id:"_4-1-优化数据访问"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-优化数据访问"}},[t._v("#")]),t._v(" 4.1 优化数据访问")]),t._v(" "),a("p",[a("strong",[t._v("查询结果需要的数据方面考虑")])]),t._v(" "),a("ol",[a("li",[t._v("对于不需要的数据，不要查询出来，会加大网络开销")]),t._v(" "),a("li",[t._v("多表关联的时候，不要返回全部列，应该返回需要的列")]),t._v(" "),a("li",[t._v("select * 这种，需要考虑是否真的需要全部列的信息")]),t._v(" "),a("li",[t._v("重复查询的数据，可以使用缓存，减少数据库查询")])]),t._v(" "),a("p",[a("strong",[t._v("查询扫描的行数考虑")])]),t._v(" "),a("ol",{attrs:{start:"5"}},[a("li",[t._v("观察响应时间，在慢日志中，找出扫描行数多的查询")]),t._v(" "),a("li",[t._v("通过explain分析（type字段的类型来分析）")]),t._v(" "),a("li",[t._v("合适的创建索引来优化")])]),t._v(" "),a("h3",{attrs:{id:"_4-2-重构查询的方式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-2-重构查询的方式"}},[t._v("#")]),t._v(" 4.2 重构查询的方式")]),t._v(" "),a("ol",[a("li",[t._v("做复杂化查询还是查分多个简单查询。不可以去拆分，但拆分的数据库连接的网络消耗应没有以前那么大。")]),t._v(" "),a("li",[t._v("分解关联查询，在应用程序中进行合并。可以有效利用应用层的缓存，利用中间查询的结果，避免重复查询和数据锁的竞争。")])]),t._v(" "),a("h3",{attrs:{id:"_4-3-查询执行的基础"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-3-查询执行的基础"}},[t._v("#")]),t._v(" 4.3 查询执行的基础")]),t._v(" "),a("h3",{attrs:{id:"_4-4-优化特定类型查询"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-4-优化特定类型查询"}},[t._v("#")]),t._v(" 4.4 优化特定类型查询")]),t._v(" "),a("h4",{attrs:{id:"_4-4-1-count-查询优化"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-4-1-count-查询优化"}},[t._v("#")]),t._v(" 4.4.1 COUNT()查询优化")]),t._v(" "),a("ol",[a("li",[a("code",[t._v("count(col)")]),t._v(" 统计当前类不为null的数据， "),a("code",[t._v("count(*)")]),t._v("直接统计行数")]),t._v(" "),a("li",[t._v("在同一个查询中统计同一个列的不同值的数量。使用SUM 或者COUNT(),例如"),a("code",[t._v("select SUM(id>3) as a , SUM(id<3) as b from t_user;")]),t._v(" , "),a("code",[t._v("select count(id>3 or null ) as a, count(id<3 or null) as b from t_user;")]),t._v(" "),a("em",[t._v("count在值是NULL是不统计数， （count('任意内容')都会统计出所有记录数，因为count只有在遇见null时不计数，即count(null)==0，因此前者单引号内不管输入什么值都会统计出所有记录数），至于加上or NULL ， 很像其他编程里的or运算符，第一个表达式是true就是不执行or后面的表达式，第一个表达式是false 执行or后面的表达式 当a中id<3, id>3 or NULL 的结果是NULL，Count才不会统计上这条记录数")])])]),t._v(" "),a("h2",{attrs:{id:"_5-常见复杂查询"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_5-常见复杂查询"}},[t._v("#")]),t._v(" 5 常见复杂查询")]),t._v(" "),a("p",[t._v("记录常见的一些复杂查询的实现方式（仅使用数据库）")]),t._v(" "),a("h3",{attrs:{id:"_5-1-分组查询取-最大、最小、前n、后n条记录"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_5-1-分组查询取-最大、最小、前n、后n条记录"}},[t._v("#")]),t._v(" 5.1 分组查询取 最大、最小、前N、后N\t条记录")])])}),[],!1,null,null,null);s.default=r.exports}}]);