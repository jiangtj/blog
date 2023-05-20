---
title: GitHub Action 构建原生 Spring Boot 应用
categories: [后端]
tags: [Spring Native, GitHub Action]
date: 2023-05-20 14:18:29
updated: 2023-05-20 14:18:29
description:
---

原生构建是非常消耗系统资源的，你可以看到编译过程中，cpu与内存都接近100%，所以能用免费的CI，那必须是要用的

# 创建一个 Action

```yml
name: Docker Push

on:
  push:
    branches:
      - "**"
    tags:
      - "v*.*.*"

jobs:
  docker_push:
    runs-on: ubuntu-latest
    permissions:
      packages: write
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven
```

上面就是简单的action，监听分支与tags，然后checkout代码仓库并设置java环境，我们需要将构建产物发布，所以设置packages的权限为write

# 登录到 Github 容器注册中心

```yml
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
```

在 steps 中添加上面的代码，就可以登录到 GitHub Container Registry，当然也可以改用docker hub，或者可以登录多个

```yml
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
```

registry 默认是 docker hub，但是，需要配置 DOCKERHUB_USERNAME 和 DOCKERHUB_TOKEN，我是觉得麻烦直接用了GitHub的

# metadata-action 生成 tag

```yml
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ghcr.io/name/app
```

这是将 CI 中的 refs 转换我们需要的 tags，比如 `v1.0.5`，就需要转换为 `latest` `1` `1.0` `1.0.5`，而且，由于 docker tag 的特殊性，它需要拼接镜像的名称，`name/app:latest` 等，所以，我们需要这个action帮我们简化生成过程

默认情况下的转换是这样的

| Event               | Ref                           | Docker Tags                |
|---------------------|-------------------------------|----------------------------|
| `pull_request`      | `refs/pull/2/merge`           | `pr-2`                     |
| `push`              | `refs/heads/master`           | `master`                   |
| `push`              | `refs/heads/releases/v1`      | `releases-v1`              |
| `push tag`          | `refs/tags/v1.2.3`            | `v1.2.3`, `latest`         |
| `push tag`          | `refs/tags/v2.0.8-beta.67`    | `v2.0.8-beta.67`, `latest` |
| `workflow_dispatch` | `refs/heads/master`           | `master`                   |

当然我们也可以自己设置

```yml
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: |
            name/app
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
```

# 通过 Maven 构建 Spring Native

我们需要在 pom 中添加原生的插件

```xml
<plugin>
  <groupId>org.graalvm.buildtools</groupId>
  <artifactId>native-maven-plugin</artifactId>
</plugin>
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <configuration>
    <image>
      <name>${docker.image.name}</name>
      <tags>${docker.image.tags}</tags>
      <env>
        <BP_OCI_SOURCE>${project.scm.url}</BP_OCI_SOURCE>
      </env>
    </image>
  </configuration>
</plugin>
```

需要配置 BP_OCI_SOURCE 为你的 GitHub 项目地址，为了让包与项目关联，这涉及到费用，只要你的项目开源，那么可以无限免费用，我是设置了一个 `project.scm.url` 这个是maven里的关于项目信息的配置

```xml
  <scm>
    <url>https://github.com/yourname/project</url>
  </scm>
```

在 aciton 中添加以下步骤

```yml
      - name: Build image
        run: |
          mvn -Pnative \
          -Ddocker.image.name=ghcr.io/name/app \
          -Ddocker.image.tags=${{ join( fromJSON(steps.meta.outputs.json).tags, ',' ) }} \
          spring-boot:build-image
```

这样就可以构建出我们需要的镜像了，同时也打上了对应的 tags

# 推送 images

```yml
      - name: Push
        run: |
          docker push -a ghcr.io/name/app
```

`-a` 表示推送所有 tags

# 完整例子

你可以前往的开源项目 https://github.com/jiangtj/api-core 查看

```yml
name: Docker Push

on:
  push:
    branches:
      - master
    tags:
      - "v*.*.*"

jobs:
  docker_push:
    runs-on: ubuntu-latest

    permissions:
      packages: write

    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v4
        with:
          # list of Docker images to use as base name for tags
          images: |
            ghcr.io/jiangtj/api-core
          # generate Docker tags based on the following events/attributes
          tags: |
            type=schedule
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}},enable=${{ !startsWith(github.ref, 'refs/tags/v0.') }}
            type=semver,pattern={{major}},enable=${{ !startsWith(github.ref, 'refs/tags/v0.') }}
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build image
        run: |
          mvn -Pnative \
          -Ddocker.image.name=ghcr.io/jiangtj/api-core \
          -Ddocker.image.tags=${{ join( fromJSON(steps.meta.outputs.json).tags, ',' ) }} \
          spring-boot:build-image
      - name: Push
        run: |
          docker push -a ghcr.io/jiangtj/api-core
```
