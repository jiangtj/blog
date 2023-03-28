---
title: GraalVM 构建 Spring Native 应用
categories: [后端]
tags: [Spring Native, GraalVM]
date: 2023-03-28 09:33:31
updated: 2023-03-28 09:33:31
description: Win 平台下构建 Spring Native 应用
---

# 准备工作

- GraalVM 配置
  - 下载 GraalVM
  - 设置 JAVA_HOME
  - 设置 Path 将 GraalVM 放在最前面
  - *运行 `gu install native-image` (不需要，在编译过程中会自动下载)
- Win 编辑工具
  - 下载 Visual Studio Build Tools 和 Windows SDK

原生编译不容易的，准备工作弄好，好几个G的空间没了

<!-- more -->

# 创建例子项目

新建一个 Spring Boot 项目，包含一些常规的依赖

![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230328092112.png)

不需要 `GraalVM Native Support`，这是构建镜像用的

添加一个`/`首页接口

```java
@SpringBootApplication
public class NativeExampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(NativeExampleApplication.class, args);
    }

    @Configuration
    public static class HomeIndex {
        @Bean
        public RouterFunction<ServerResponse> homeRoutes() {
            return route()
                .GET("/", serverRequest ->
                    ServerResponse.ok().bodyValue("Hello, native example!"))
                .build();
        }
    }

}
```

运行项目，我们可以看到需要`1.99s`，访问`localhost:8080`返回`Hello, native example!`

![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230328092527.png)

# 原生构建

搜索并打开`x64 Native Tools Command Prompt for VS 2022`

![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230328095632.png)

在你的项目位置，运行`.\mvnw.cmd -Pnative native:compile`，耐心等待编译完成

```
Produced artifacts:
 I:\Users\MrTT\Desktop\native-example\target\native-example.build_artifacts.txt (txt)
 I:\Users\MrTT\Desktop\native-example\target\native-example.exe (executable)
========================================================================================================================
Finished generating 'native-example' in 2m 7s.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  02:27 min
[INFO] Finished at: 2023-03-28T09:28:42+08:00
[INFO] ------------------------------------------------------------------------
```

花费`2m27s`还行，`native-example.exe`有66mb，有点大，但毕竟不需要jre，也还行吧

# 运行测试

在`target`下运行`.\native-example.exe`

![](https://raw.githubusercontent.com/jiangtj/picgo-repo/master/img-a20230328093129.png)

`0.19s`启动，快了很多
