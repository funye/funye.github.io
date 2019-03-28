## Redis

### redis批量删除
```
redis-cli -a password keys "*" | xargs redis-cli -a password del
```