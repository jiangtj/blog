---
title: 在 Docker 中使用 Hexo
categories: []
tags: []
date: 2023-03-09 08:09:49
updated: 2023-03-09 08:09:49
description:
---

在项目的根目录创建一个 `compose-dev.yaml` 定义docker compose用于生成开发环境，由于博客不需要额外的数据库等，所以很简单

```yaml
services:
  blog:
    build:
      context: .
      target: dev-envs
```

- context 指定docker位置
- target 指定docker镜像构建目标

然后创建 `Dockerfile`

```Dockerfile
# syntax=docker/dockerfile:1.4

FROM node:lts AS buildhexo
RUN yarn global add hexo-cli

FROM buildhexo AS development
WORKDIR /app
COPY . .
RUN yarn install
CMD hexo s

FROM buildhexo as dev-envs
# 添加工具git docker vscode
# RUN <<EOF
# apt-get update
# apt-get install -y --no-install-recommends git
# EOF
# RUN <<EOF
# useradd -s /bin/bash -m vscode
# groupadd docker
# usermod -aG docker vscode
# EOF
# install Docker tools (cli, buildx, compose)
# COPY --from=gloursdocker/docker / /
CMD /bin/sh -c "while sleep 1000; do :; done"
```

上面`dev-envs`是被指定执行的，而`development`不会被执行，注释的内容是因为我遇到了网络问题，是从其他模板中复制过来的，理论上没问题，结尾的`CMD /bin/sh -c "while sleep 1000; do :; done"`用于保持容器运行

最后，在docker桌面版中，按提示，创建Dev Environments即可
