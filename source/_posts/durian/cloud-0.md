---
title: Spring Cloud 平台搭建(序)：聊一聊与做些准备
categories: [后端]
tags: [Spring Cloud 平台搭建]
date: 2023-03-21 14:32:15
updated: 2023-03-21 14:32:15
description:
---

# 开场白

学技术的我相信绝大部分都是理科生，和一样，写博客会很为难，不知道怎么开场，但救星来了，那就是ChatGPT，当然，我这里不是（需要填手机号，然后提示不提供服务，哎），是new bing生成的，让我们欣赏下AI吧

你好，欢迎来到我的博客。今天我想和大家聊一聊spring cloud，这是一个基于spring boot的微服务框架，它提供了一系列的组件和工具，让我们可以快速地开发和部署分布式系统。

什么是微服务呢？简单地说，就是把一个大型的单体应用拆分成多个小的、独立的、可复用的服务，每个服务负责一个特定的功能或业务领域，它们之间通过轻量级的通信协议进行交互。这样做有什么好处呢？主要有以下几点：

- 可扩展性：当某个服务需要扩容或缩容时，我们只需要对该服务进行操作，而不影响其他服务。
- 灵活性：当某个服务需要更新或替换时，我们只需要对该服务进行操作，而不影响其他服务。
- 容错性：当某个服务出现故障时，我们可以快速地恢复或切换到备用方案，而不影响其他服务。
- 解耦性：每个服务都有自己的数据存储和业务逻辑，它们之间通过定义好的接口进行交互，这样可以降低耦合度和依赖性。

当然，微服务也有一些挑战和问题，比如：

- 服务治理：如何管理众多的微服务？如何保证它们之间的协调和一致性？如何监控和追踪它们的状态和性能？
- 服务发现：如何让微服务之间找到彼此？如何处理动态变化的网络地址和端口？
- 服务配置：如何统一管理微服务的配置信息？如何实现配置信息的动态更新和刷新？
- 服务熔断：如何防止某个故障的微服务导致整个系统崩溃？如何实现故障隔离和降级策略？
- 服务网关：如何为外部客户端提供统一的访问入口？如何实现负载均衡、路由转发、认证授权、限流熔断等功能？

这就是spring cloud要解决的问题。spring cloud是一个生态系统，它包含了多个子项目，每个子项目都针对上述问题提供了一个解决方案。例如：

- Eureka：一个基于RESTful风格的注册中心，提供了微服务之间的发现与注册功能。
- Config：一个集中式配置管理工具，提供了从外部源（比如Git）获取配置信息并推送给各个微服务的功能。
- Hystrix：一个断路器模式实现工具，提供了故障检测、熔断保护、降级处理等功能。
- Zuul：一个基于过滤器模式实现的网关工具，提供了路由转发、认证授权、限流熔断等功能。
- Ribbon：一个客户端负载均衡工具，在调用其他微服 务时自动选择最优节点。
- Feign: 一个声明式RESTful客户端工具，在调用其他微服 务时自动封装请求参数并解析响应结果。

除此之外还有很多其他子项目，在这里就不一一介绍了。如果你想深入学习spring cloud，请参考官方文档

# 准备做什么

挺震撼的，现在的AI生成介绍类内容已经不比人类差了。上面那段话除了有点过时之外，并没有什么问题，而且我准备写的内容也不是一个个集成spring cloud组件的例子，所以过时的内容影响不大，也懒得改了

关于spring cloud平台搭建，主要考虑的是简单易用，能开箱即用，所以在组件的选择上会选用特定的组件来集成。如果你想全面地了解spring cloud，也许其他教程会更合适。当然，如果只是想了解基本概念，我推荐你看《微服务设计》这本书。

废话不多说了，让我们开始准备搭建整个平台吧。在学习之前，让我们先创建一个根项目

# parent 项目

首先创建一个parent项目，你可以用maven的命令行也可以用ide创建，但是最简单的是直接拷贝一个`pom.xml`文件，因为这是个管理依赖版本的父工程，不需要其他的文件，如果用ide创建可能还要删除一些文件

修改`pom.xml`为以下内容

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.jtj.cloud</groupId>
    <artifactId>parent</artifactId>
    <packaging>pom</packaging>
    <version>1.0.0</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.0.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>17</java.version>
        <spring-cloud.version>2022.0.1</spring-cloud.version>
        <spring-cloud-alibaba.version>2022.0.0.0-RC1</spring-cloud-alibaba.version>
        <spring-boot-admin.version>3.0.1</spring-boot-admin.version>
        <jjwt.version>0.11.5</jjwt.version>
        <!-- <maven.test.skip>true</maven.test.skip> -->
    </properties>

    <modules>
    </modules>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.jsonwebtoken</groupId>
                <artifactId>jjwt-api</artifactId>
                <version>${jjwt.version}</version>
            </dependency>
            <dependency>
                <groupId>io.jsonwebtoken</groupId>
                <artifactId>jjwt-impl</artifactId>
                <version>${jjwt.version}</version>
            </dependency>
            <dependency>
                <groupId>io.jsonwebtoken</groupId>
                <artifactId>jjwt-jackson</artifactId>
                <version>${jjwt.version}</version>
            </dependency>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>de.codecentric</groupId>
                <artifactId>spring-boot-admin-dependencies</artifactId>
                <version>${spring-boot-admin.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring-cloud-alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

按照规范，我的包名应该为`com.jiangtj`，毕竟jiangtj.com这个域名才是我的，这项目是在一个很早前的项目上改的懒得改路径

# 基础业务模块

除了父项目，我们还需要添加两个子模块，`base-reactive` `base-servlet`，他们分别是spring 5开始的两个web类型，好用的平台自然是要都兼容的（主要我喜欢`base-reactive`，但它还是不怎么完善）

如果idea，直接选择创建模块在选择spring initializr，再选择相应的web依赖就好

然后修改pom文件的父依赖

```xml
    <parent>
        <groupId>com.jtj.cloud</groupId>
        <artifactId>parent</artifactId>
        <version>1.0.0</version>
    </parent>
```

在parent的pom中也添加这两模块

```xml

    <modules>
        <!-- template -->
        <module>base-reactive</module>
        <module>base-servlet</module>
    </modules>
```

最终的项目结构是这样的，会在后续的文章里不断添加模块

![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230321175410.png)

# 尾

事实上这个项目我已经写了一部分了，并开源在GitHub上，期待你们的星星

https://github.com/jiangtj/spring-cloud-examples
