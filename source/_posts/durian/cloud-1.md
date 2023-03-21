---
title: Spring Cloud 平台搭建(一)：服务注册与配置中心Nacos
categories: [后端]
tags: [Spring Cloud 平台搭建]
date: 2023-03-21 21:35:15
updated: 2023-03-21 21:35:15
description:
---

# Nacos 是什么？

Nacos 是一个易用的动态服务发现、配置和服务管理平台，可以帮助你在云原生时代，轻松构建、交付、管理自己的微服务平台，快速复用和组合业务服务，快速交付商业创新的价值。

Nacos 是阿里巴巴开源的一个项目，它的名字来源于Na ming and Co nfiguration S ervice。nacos提供了以下几个核心功能：

Nacos 提供了以下主要功能：

- **动态服务发现**：Nacos 可以让你注册和发现各种类型的微服务，包括 HTTP、RPC 和 WebSocket 等，并提供负载均衡、流量控制和故障转移等能力。
- **动态配置管理**：Nacos 可以让你集中管理应用的配置信息，并支持配置变更推送、版本控制和灰度发布等功能。
- **动态 DNS 服务**：Nacos 可以让你基于权重路由请求到不同的后端集群，并支持域名解析、健康检查和故障隔离等功能。
- **服务及其元数据管理**：Nacos 可以让你存储和查询微服务及其元数据信息，并支持元数据驱动的开发模式。

# 为什么要使用 Nacos？

在微服务架构中，我们需要解决以下几个问题：

- 如何发现和调用其他微服务？
- 如何管理微服务之间的依赖关系？
- 如何动态调整微服务的配置？
- 如何保证微服务之间的高可用性和弹性？
- 如何实现微服务之间的分布式事务？

这些问题都需要一个强大而灵活的中间件来支撑。而 Nacos 正是这样一个中间件，它可以为我们提供一站式的解决方案。

# 快速上手吧

Nacos 官方提供了许多的部署方式，他们在 `nacos-group` 组织里，比如 `nacos-docker` 提供在 docker 运行 Nacos，提供了很多个 docker compose 编排脚本，还有 `nacos-k8s` 提供了些 k8s 下的脚本

不过，开发环境下，我们只要能快速运行起来就好，运行以下命令

```shell
docker run --name nacos-quick -e MODE=standalone -p 8848:8848 -p 9848:9848 -d nacos/nacos-server:v2.2.0
```

修改版本号到最新版本，这样服务就运行在了`8848`端口上(`9848`是节点间通讯的端口，用于集群)，打开 localhost:8848/nacos，输入默认的用户名密码nacos，就可以看到管理界面了

图todo

接下来，在[两个基础业务模块](https://jiangtj.com/articles/durian/cloud-0/#%E5%9F%BA%E7%A1%80%E4%B8%9A%E5%8A%A1%E6%A8%A1%E5%9D%97)中添加服务注册需要的依赖

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

在Applications中添加注解启用

```java
@SpringBootApplication
@EnableDiscoveryClient
public class BaseServletApplication {
    public static void main(String[] args) {
        SpringApplication.run(BaseServletApplication.class, args);
    }
}
```

除此之外，你还需要更改配置文件，配置 Nacos 配置中心地址以及以 Nacos 协议导入配置

```properties
spring.cloud.nacos.config.server-addr=127.0.0.1:8848
spring.config.import=nacos:auth.properties
# 如果你希望支持动态刷新的话，添加?refresh=true
# spring.config.import=nacos:auth.properties?refresh=true
```

在 Nacos 管理平台上添加 `auth.properties` 这是后面鉴权时会用到的，这里暂时只是介绍怎么用 Nacos 配置中心

图todo

如果你需要引入多个配置文件，只需要填写多个import，用逗号隔开即可

```properties
spring.cloud.nacos.config.server-addr=127.0.0.1:8848
spring.config.import=nacos:auth.properties,nacos:base-servlet.properties
```

运行两个服务后（修改为不同端口，我是17000与17001），我们可以观察到，他们在服务注册中心注册了

图todo

# 线上怎么部署？

线上部署与开发其实差不多，不过多指定一个数据库即可，下面是官方的mysql8单机的例子，已经很完善了，不需要修改，数据库挂载卷也都是配好的。另外 Nacos 是支持环境变量配置的，如果你是外部数据库，可以配置 `MYSQL_SERVICE_HOST` 等变量就好了

```yml
version: "3.8"
services:
  nacos:
    image: nacos/nacos-server:${NACOS_VERSION}
    container_name: nacos-standalone-mysql
    env_file:
      - ../env/nacos-standlone-mysql.env
    volumes:
      - ./standalone-logs/:/home/nacos/logs
    ports:
      - "8848:8848"
      - "9848:9848"
    depends_on:
      mysql:
        condition: service_healthy
    restart: always
  mysql:
    container_name: mysql
    build:
      context: .
      dockerfile: ./image/mysql/8/Dockerfile
    image: example/mysql:8.0.30
    env_file:
      - ../env/mysql.env
    volumes:
      - ./mysql:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: [ "CMD", "mysqladmin" ,"ping", "-h", "localhost" ]
      interval: 5s
      timeout: 10s
      retries: 10
```

我这边推荐的是单例部署，毕竟这只是服务注册与配置中心，没有太多的并发请求，如果单例无法满足，那么你们的体量应当上 k8s，而 spring cloud 也有针对 k8s 的依赖，可以使用 k8s 的服务注册发现与配置功能。k8s可能是更好的选择，但我不使用的原因是，对于开发人员来说 nacos 更熟悉与易上手，而能看到这篇教程的人，我相信你也思考如何搭建微服务平台，那么在你面前有两条路，要么一步到位 k8s，要就是逐步进化，因为在早期，nacos 已经足够满足了，而即便到了后，也只需替换部分依赖与修改部分公用组件而已
