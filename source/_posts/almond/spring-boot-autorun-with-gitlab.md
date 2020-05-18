---
title: Spring Boot 自动重启脚本
date: 2018-4-20
updated: 2018-4-20
categories: [后端]
tags: [Java,Shell,CI]
---
一个脚本，自动从GitLab上下载jar，同时重启服务。为后续的CI自动部署做准备
```sh
#!/bin/sh
#defined
echo "通过GitLab-CI下载jar"
wget -O bill-server.jar "https://gitlab.com/dream-room/bill-server/-/jobs/artifacts/$1/raw/target/bill-server.jar?job=release-build"
echo "查询已存在进程"
pgrep -af bill-server
echo "结束已存在进程"
pkill -f bill-server
echo "开始运行$1"
nohup java -jar bill-server.jar &
echo "更新结束"
```
运行
```bash
sh bill-start.sh release-0.0.3
```
