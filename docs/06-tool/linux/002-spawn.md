---
title: 实现简单人机交互-spawn
date: 2020-12-15
categories:
 - 工具&部署
tags:
 - spawn
 - 日常工具
---

## spawn 实现人机交互

spawn命令实现人机交互

expect为预期的命令行提示

例如ssh登录时候，提示 `yes/no` 输入`yes`
提示输入密码`Enter passphrase for key` 输入密码。

对应的示例脚本如下

```shell
#!/usr/bin/expect -f

set user [lindex $argv 0]
set host [lindex $argv 1]
set port [lindex $argv 2]
set password [lindex $argv 3]
set keyFile [lindex $argv 4]

spawn ssh $user@$host -p $port -i $keyFile

expect {
    "yes/no" { send "yes\r";
               exp_continue }
    "Enter passphrase for key" { send "$password\r" }
}
```