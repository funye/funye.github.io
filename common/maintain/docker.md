docker学习记录

java 环境的docker实践

添加文件映射

```
docker run -p 81:80 --name nginx01 \
-v D:/Users/80279309/Documents/fun/docker/app/nginx/conf/nginx.conf:/etc/nginx/nginx.conf --privileged=true \
-v D:/Users/80279309/Documents/fun/docker/app/nginx/conf/conf.d:/etc/nginx/conf.d --privileged=true \
-v D:/Users/80279309/Documents/fun/docker/app/nginx/logs:/var/logs/nginx --privileged=true \
-v D:/Users/80279309/Documents/fun/docker/app/nginx/html:/usr/share/nginx/html --privileged=true  \
-d nginx
```

---

参考资料：
- [手把手docker部署java应用（初级篇）](https://juejin.im/post/5d1d56776fb9a07ee742fba2)
- [Docker---从入门到实践](https://yeasy.gitbook.io/docker_practice/install/centos)

