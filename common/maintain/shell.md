## shell脚本启动和停止Java服务
```shell
#!/bin/sh
## java env
export JAVA_HOME=/usr/local/jdk/jdk1.8.0_101
export JRE_HOME=$JAVA_HOME/jre
 
API_NAME=api
JAR_NAME=$API_NAME\.jar
#PID  代表是PID文件
PID=$API_NAME\.pid
 
#使用说明，用来提示输入参数
usage() {
    echo "Usage: sh 执行脚本.sh [start|stop|restart|status]"
    exit 1
}
 
#检查程序是否在运行
is_exist(){
  pid=`ps -ef|grep $JAR_NAME|grep -v grep|awk '{print $2}' `
  #如果不存在返回1，存在返回0     
  if [ -z "${pid}" ]; then
   return 1
  else
    return 0
  fi
}
 
#启动方法
start(){
  is_exist
  if [ $? -eq "0" ]; then 
    echo ">>> ${JAR_NAME} is already running PID=${pid} <<<" 
  else 
    nohup $JRE_HOME/bin/java -Xms256m -Xmx512m -jar $JAR_NAME >/dev/null 2>&1 &
    echo $! > $PID
    echo ">>> start $JAR_NAME successed PID=$! <<<" 
   fi
  }
 
#停止方法
stop(){
  #is_exist
  pidf=$(cat $PID)
  #echo "$pidf"  
  echo ">>> api PID = $pidf begin kill $pidf <<<"
  kill $pidf
  rm -rf $PID
  sleep 2
  is_exist
  if [ $? -eq "0" ]; then 
    echo ">>> api 2 PID = $pid begin kill -9 $pid  <<<"
    kill -9  $pid
    sleep 2
    echo ">>> $JAR_NAME process stopped <<<"  
  else
    echo ">>> ${JAR_NAME} is not running <<<"
  fi  
}
 
#输出运行状态
status(){
  is_exist
  if [ $? -eq "0" ]; then
    echo ">>> ${JAR_NAME} is running PID is ${pid} <<<"
  else
    echo ">>> ${JAR_NAME} is not running <<<"
  fi
}
 
#重启
restart(){
  stop
  start
}
 
#根据输入参数，选择执行对应方法，不输入则执行使用说明
case "$1" in
  "start")
    start
    ;;
  "stop")
    stop
    ;;
  "status")
    status
    ;;
  "restart")
    restart
    ;;
  *)
    usage
    ;;
esac
exit 0
```

## spawn 实现人机交互

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

## linux让程序在后台运行

- **& 命令** 
功能：加在一个命令的最后，可以把这个命令放在后台执行

- **nohup命令** 
功能：不挂断的运行命令

**示例**
```
nohup test.sh &
```
