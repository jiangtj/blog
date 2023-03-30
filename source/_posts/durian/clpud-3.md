---
title: Spring Cloud 平台搭建(三)：更换 Spring Cloud Tencent
categories: [后端]
tags: [Spring Cloud 平台搭建]
date: 2023-03-30
updated: 2023-03-30
---

Spring Cloud Tencent 与 Spring Cloud Alibaba 的差别如下

- [x] 配置中心 支持配置属性更新回调
- [ ] 配置中心 支持 import，但仍必须配置bootsrap.yaml
- [x] 控制台 内存占用小于nacos，对于我来说，开发电脑配置不太够，能好些
- [x] 集成类似于阿里Sentinel的功能
- [ ] 默认占用常用端口，比如8080、8090

各有优劣，不过我更倾向于腾讯，所以做了替换

<!-- more -->

# 搭建北极星服务

北极星是集服务注册与发现，配置中心，流量控制等为一体的微服务治理平台，相对于eureka和spring cloud config来说，更简单与好用

```shell
docker run -d --privileged=true \
  -p 15010:15010 \
  -p 8101:8101 \
  -p 8100:8100 \
  -p 18080:8080 \
  -p 18090:8090 \
  -p 18091:8091 \
  -p 18093:8093 \
  -p 18761:8761 \
  -p 19090:9090 polarismesh/polaris-server-standalone:latest
```

由于 `8080` `8090` `9090`，这些太常用了，而这个服务又需要长期在本地运行，所以都加了个`1`，注意 `8101` `8100` 是不能改的

# 修改 POM 依赖

将原本的

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

替换为

```xml
<dependency>
    <groupId>com.tencent.cloud</groupId>
    <artifactId>spring-cloud-starter-tencent-polaris-discovery</artifactId>
</dependency>
<dependency>
    <groupId>com.tencent.cloud</groupId>
    <artifactId>spring-cloud-starter-tencent-polaris-config</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>

<!-- 或者可以引入全部 -->
<!-- <dependency>
    <groupId>com.tencent.cloud</groupId>
    <artifactId>spring-cloud-starter-tencent-all</artifactId>
</dependency> -->
```

# 添加 bootstrap 配置

虽然 Spring Boot 2.4 之后引入的新的配置方案，不在需要配置`bootstrap.yml`，但腾讯似乎是为了兼容，所以还是需要添加`bootstrap.yml`，所以你需要为每个服务添加下面的文件

```yml
spring:
  application:
    name: applicationName
  cloud:
    polaris:
      address: grpc://localhost:18091
      namespace: default
      config:
        address: grpc://localhost:18093
        auto-refresh: true
  config:
    import:
      - optional:polaris:dev:auth.properties
```

好了，然后全部运行，去`localhost:18080`上看看你的服务注册情况吧，由于 Spring Cloud 提供的通用的接口，所以改起来不麻烦
