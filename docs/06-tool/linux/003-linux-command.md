---
title: Linux常用命令笔记
date: 2020-12-15
categories:
 - 工具&部署
tags:
 - linux
 - 日常工具
---

## linux让程序在后台运行

- **& 命令** 
功能：加在一个命令的最后，可以把这个命令放在后台执行

- **nohup命令** 
功能：不挂断的运行命令

**示例**
```
nohup docsify serve . > nohup.out 2>&1 &
```


## homebrew 

```
替换brew.git:
cd "$(brew --repo)"
git remote set-url origin https://mirrors.ustc.edu.cn/brew.git

替换homebrew-core.git:
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git 
重置brew.git:
cd "$(brew --repo)"
git remote set-url origin https://github.com/Homebrew/brew.git

重置homebrew-core.git:
cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
git remote set-url origin https://github.com/Homebrew/homebrew-core.git
--------------------- 
作者：启程Boy 
来源：CSDN 
原文：https://blog.csdn.net/Boyqicheng/article/details/80809983 
版权声明：本文为博主原创文章，转载请附上博文链接！
```



## 常用指令

- 查看磁盘情况：`df -h`和`du -sh`使用的比较多，一个统计整体磁盘情况，一个看单独目录点用情况

