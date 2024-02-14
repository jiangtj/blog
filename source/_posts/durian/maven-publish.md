---
title: 在 Maven Central 发布你的jar包
categories: [后端]
tags: [Maven]
date: 2024-02-14 22:09:10
updated: 2024-02-14 22:09:10
description:
---

> 在2024年2月1日，sonatype 终于放弃了原本的maven-central的注册方式，将提交issue注册改成了通过dns验证域名即可，这对于我们这些可能只想存个工具类的人来说，就方便太多了。

# 注册命名空间

首先，在[maven central](https://central.sonatype.com/)注册一个账号，推荐使用GitHub直接登录，这样的好处是你可以直接得到一个验证通过的Namespace

![image](https://github.com/jiangtj/blog/assets/15902347/d26c0f80-0146-42e6-bcb5-7e69c8637a93)

点击 Add Namespace 按钮可以添加一个Namespace

![image](https://github.com/jiangtj/blog/assets/15902347/994f3744-8b28-4321-be7f-ff162a760166)

然后在你的域名解析商那上添加一个TXT记录，比如上面的例子，主机记录为`testmvn`，记录值为`提供的token`，这样就可以得到一个和GitHub一样的Namespace了。

<!-- more -->

# 配置GPG

为了对发布的 jar 包进行签名，你需要生成 GPG 密钥对：
- 安装并配置 GnuPG：`gpg --version` 检查是否已安装，未安装则需下载安装 https//www.gnupg.org/download/
- 生成密钥对：`gpg --gen-key`，根据提示操作。
- 将公钥上传至公钥服务器：`gpg --keyserver keyserver.ubuntu.com --send-keys <your-key-id>`。

# 创建一个待发布的项目

在你原本的项目中添加以下插件

```xml
<plugin>
    <groupId>org.sonatype.central</groupId>
    <artifactId>central-publishing-maven-plugin</artifactId>
    <version>0.3.0</version>
    <extensions>true</extensions>
    <configuration>
        <publishingServerId>central</publishingServerId>
        <tokenAuth>true</tokenAuth>
    </configuration>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-source-plugin</artifactId>
    <version>2.2.1</version>
    <executions>
        <execution>
            <id>attach-sources</id>
            <goals>
                <goal>jar-no-fork</goal>
            </goals>
        </execution>
    </executions>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>2.9.1</version>
    <executions>
        <execution>
            <id>attach-javadocs</id>
            <goals>
                <goal>jar</goal>
            </goals>
        </execution>
    </executions>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-gpg-plugin</artifactId>
    <version>1.5</version>
    <executions>
        <execution>
            <id>sign-artifacts</id>
            <phase>verify</phase>
            <goals>
                <goal>sign</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

source 与 javadoc 都是 maven central 的要求，gpg 是用来对发布包进行签名的。`central-publishing-maven-plugin` 是新的发布插件

# 发布项目

运行以下命令

```shell
mvn clean deploy
```

当你完成时，你可以在maven central 看到你的部署记录了

![image](https://github.com/jiangtj/blog/assets/15902347/3aa38c48-7a3c-41ad-87e1-44e80ef51544)

你可以点击发布，那么其他项目就可以在maven central 中找到你的项目了，并下载下来，你也可以在`central-publishing-maven-plugin`插件中修改`autoPublish`配置为true，这样在提交后自动发布，这很适合用于CI中
