# redis的常见使用场景与用法

## 使用lua脚本完成事务

语法

`eval "script" KEYS_NUM key(1)...key(KEYS_NUM) args...`

示例

```
eval "return redis.call('set',KEYS[1],ARGV[1])" 1 foo bar

脚本：return redis.call('set',KEYS[1],ARGV[1])
KEYS_NUM=1
key=foo
args=bar
```
  

 