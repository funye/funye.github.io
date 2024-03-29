---
title: 五大常用算法：回溯算法
date: 2021-05-12
categories:
 - 算法设计
tags:
 - 算法
 - 回溯算法
---

## 1 概念

回溯算法实际上一个类似穷举的搜索尝试过程，主要是在搜索尝试过程中寻找问题的解，当发现已不满足求解条件时，就“回溯”返回，尝试别的路径。

回溯法是一种选优搜索法，按选优条件向前搜索，以达到目标。但当探索到某一步时，发现原先选择并不优或达不到目标，就退回一步重新选择，这种走不通就退回再走的技术为回溯法，而满足回溯条件的某个状态的点称为“回溯点”。**回溯算法也可以看作DFS算法**。



## 2基本思想

在包含问题的所有解的解空间树中，按照**深度优先搜索的策略**，从根结点出发深度探索解空间树。当探索到某一结点时，要先判断该结点是否包含问题的解，如果包含，就从该结点出发继续探索下去，如果该结点不包含问题的解，则逐层向其祖先结点回溯。

- 若用回溯法求问题的所有解时，要回溯到根，且根结点的所有可行的子树都要已被搜索遍才结束。

- 而若使用回溯法求任一个解时，只要搜索到问题的一个解就可以结束。



**解决一个回溯问题，实际上就是一个决策树（解空间树）的遍历过程**，需要考虑一下三个问题：

- 路径：也就是已经做出的选择。

- 选择列表：也就是你当前可以做的选择。

- 结束条件：也就是到达决策树底层，无法再做选择的条件。

  

## 3 基本步骤

（1）针对所给问题，确定问题的解空间：

​      首先应明确定义问题的解空间，问题的解空间应至少包含问题的一个（最优）解。

  （2）确定结点的扩展搜索规则

  （3）以深度优先方式搜索解空间（决策树），并在搜索过程中用剪枝函数避免无效搜索。



## 4 算法框架

```java
  // 回溯算法框架
  result = []
  def backtrack(路径, 选择列表):
      if 满足结束条件:
          result.add(路径)
          return
      
      for 选择 in 选择列表:
          做选择
          backtrack(路径, 选择列表)
          撤销选择
```

  

## 5 典型示例

示例1：[全排列问题](https://leetcode-cn.com/problems/permutations/)

示例2：[N皇后问题](https://leetcode-cn.com/problems/n-queens/)

示例3：[划分为k个相等的子集](https://leetcode-cn.com/problems/partition-to-k-equal-sum-subsets/)





---

参考文章：

- [labuladong的算法小抄——回溯算法详解](https://labuladong.gitee.io/algo/4/28/88/)

- [五大常用算法之四：回溯法](https://www.cnblogs.com/steven_oyj/archive/2010/05/22/1741376.html)

