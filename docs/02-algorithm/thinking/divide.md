---
title: 五大常用算法：分治法
date: 2021-05-12
categories:
 - 算法设计
tags:
 - 算法
 - 分治法
---

# 分治法 

分治法的设计思想是：将一个难以直接解决的大问题，分割成一些规模较小的相同问题，以便各个击破，分而治之。

分治策略是：对于一个规模为n的问题，若该问题可以容易地解决（比如说规模n较小）则直接解决，否则将其分解为k个规模较小的子问题，这些子问题互相独立且与原问题形式相同，递归地解这些子问题，然后将各子问题的解合并得到原问题的解。这种算法设计策略叫做分治法。

利用分支算法解决的问题，通常伴随着递归。


## 分治法适用的情况

> 分治法所能解决的问题一般具有以下几个特征：
> 1. 该问题的规模缩小到一定的程度就可以容易地解决
> 2. 该问题可以分解为若干个规模较小的相同问题，即该问题具有最优子结构性质。
> 3. 利用该问题分解出的子问题的解可以合并为该问题的解；
> 4. 该问题所分解出的各个子问题是相互独立的，即子问题之间不包含公共的子子问题。
> 第一条特征是绝大多数问题都可以满足的，因为问题的计算复杂性一般是随着问题规模的增加而增加；
> **第二条特征是应用分治法的前提**它也是大多数问题可以满足的，此特征反映了递归思想的应用；、
> **第三条特征是关键，能否利用分治法完全取决于问题是否具有第三条特征，如果具备了第一条和第二条特征，而不具备第三条特征，则可以考虑用贪心法或动态规划法。**
> **第四条特征涉及到分治法的效率**，如果各子问题是不独立的则分治法要做许多不必要的工作，重复地解公共的子问题，此时虽然可用分治法，但一般用动态规划法较好。


## 分治法基本步骤

分治法在每一层递归上都有三个步骤：

- step1 分解：将原问题分解为若干个规模较小，相互独立，与原问题形式相同的子问题；

- step2 解决：若子问题规模较小而容易被解决则直接解，否则递归地解各个子问题

- step3 合并：将各个子问题的解合并为原问题的解。

## 分治法的复杂性分析

> 一个分治法将规模为n的问题分成k个规模为n／m的子问题去解。设分解阀值n0=1，且adhoc解规模为1的问题耗费1个单位时间。再设将原问题分解为k个子问题以及用merge将k个子问题的解合并为原问题的解需用f(n)个单位时间。用T(n)表示该分治法解规模为|P|=n的问题所需的计算时间，则有：
> T（n）= k T(n/m)+f(n)
>   通过迭代法求得方程的解：
>   递归方程及其解只给出n等于m的方幂时T(n)的值，但是如果认为T(n)足够平滑，那么由n等于m的方幂时T(n)的值可以估计T(n)的增长速度。通常假定T(n)是单调上升的，从而当                  mi≤n<mi+1时，T(mi)≤T(n)<T(mi+1)。 


## 可使用分治法求解的一些经典问题

1. 二分搜索
2. 大整数乘法
3. Strassen矩阵乘法
4. 棋盘覆盖
5. 合并排序
6. 快速排序
7. 线性时间选择
8. 最接近点对问题
9. 循环赛日程表
10. 汉诺塔

## 依据分治法设计程序时的思维过程

> 实际上就是类似于数学归纳法，找到解决本问题的求解方程公式，然后根据方程公式设计递归程序。
> 1. 一定是先找到最小问题规模时的求解方法
> 2. 然后考虑随着问题规模增大时的求解方法
> 3. 找到求解的递归函数式后（各种规模或因子），设计递归程序即可。

---

参考： 
- [五大常用算法系列](https://www.cnblogs.com/steven_oyj/archive/2010/05/22/1741370.html)
- [《编程之法：面试和算法心得》](https://wizardforcel.gitbooks.io/the-art-of-programming-by-july/content/index.html)








