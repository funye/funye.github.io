## 常用shell脚本

```
#cashloan
mvn deploy:deploy-file -DgroupId=com.yyfq -DartifactId=yyfq-cashloan-facade -Dpackaging=jar -Dfile=/Users/huanye/yy/code/yyfq-cashloan-server/yyfq-cashloan-facade/target/yyfq-cashloan-facade-1.1.6-SNAPSHOT.jar -Dversion=1.1.6-SNAPSHOT -Durl=http://maven.youjie.com/content/repositories/snapshots/ -DrepositoryId=snapshots  -s /Users/huanye/develop/apache-maven-3.5.0/conf/settings-bj.xml
```

## spawn 实现人机交互

```
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