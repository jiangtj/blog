---
title: 部署 Spring Boot 应用为 systemd 服务
categories: [后端]
tags: [Java]
date: 2021-01-20 14:21:46
updated: 2021-01-20 14:21:46
---

很久之前，我写过一个[脚本](https://dnocm.com/articles/almond/spring-boot-autorun-with-gitlab/)用于重启Spring Boot应用，但最近在看Spring Boot文档，发现之前写的的确不够优雅

Spring Boot 文档中，有一大章专门写[关于如何在系统中部署](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment.html#deployment)，其中，个人认为最佳的方案是作为一个systemd服务运行，由Liunx服务直接调度

<!-- more -->

# 编译一个可执行的Jar

首先，我们需于改变我们的Jar，能在Linux系统中直接运行

在Maven中，添加executable配置为true

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <executable>true</executable>
    </configuration>
</plugin>
```

或者，如果你使用的是Gradle，添加`launchScript()`

```gradle
bootJar {
    launchScript()
}
```

*注意：可执行的Jar由于嵌入了脚本，所以无法通过`jar -xf`命令解压*

# 创建systemd服务

在`/etc/systemd/system`文件下，创建`myapp.service`(假设你的服务名叫做myapp，请依据实际情况修改)

```service
[Unit]
Description=myapp
After=syslog.target

[Service]
# User=myapp
ExecStart=/var/myapp/myapp.jar
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

# 上传Jar

我们需要上传并将生成的可执行Jar，放在与`myapp.service`中`ExecStart`相同的位置

# 运行systemd服务

当我们完成上面步骤，就可以直接通过`systemctl`来运行或控制Spring Boot应用

```bash
# 启用开机运行
systemctl enable myapp.service
# 禁用开机运行
systemctl disable myapp.service
# 运行
systemctl start myapp.service
# 停止
systemctl stop myapp.service
# 重新运行
systemctl restart myapp.service
# 查看服务状态
systemctl status myapp.service
```

这是不是比用`pgrep` `pgrep` `java -jar`之类的简单方便多了
