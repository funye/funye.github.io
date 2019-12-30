# 服务器维护{docsify-ignore-all}

## git使用

### git回滚到指定commit

```
git log  ## 查看commit 日志

git reset --hard commit_id 回滚到指定commit_id

git push origin HEAD --force 推送到远程分支
```

如果修改的是master 还需要修改 protected brandches 权限