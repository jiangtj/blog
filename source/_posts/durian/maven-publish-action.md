---
title: 通过 GitHub Action 发布你的 jar 包
categories: [后端]
tags: [Maven]
date: 2024-02-16 15:59:15
updated: 2024-02-16 15:59:15
description:
---

继上篇内容[《在 Maven Central 发布你的jar包》](https://jiangtj.com/articles/durian/maven-publish/)，本篇将介绍如何通过 GitHub Action 自动发布你的 jar 包。

# 创建 GitHub Action

添加以下 action 到你的 .github/workflows 目录下

```yaml
name: Publish to Maven Central
on:
  push: 
    tags: 
      - "v*.*.*"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Set up Apache Maven Central
        uses: actions/setup-java@v4
        with: # running setup-java again overwrites the settings.xml
          java-version: '17'
          distribution: 'temurin'
          cache: maven
          server-id: central # Value of the distributionManagement/repository/id field of the pom.xml
          server-username: MAVEN_USERNAME # env variable for username in deploy
          server-password: MAVEN_CENTRAL_TOKEN # env variable for token in deploy
          gpg-private-key: ${{ secrets.MAVEN_GPG_PRIVATE_KEY }} # Value of the GPG private key to import
          gpg-passphrase: MAVEN_GPG_PASSPHRASE # env variable for GPG private key passphrase
      - name: Publish to Apache Maven Central
        run: mvn deploy
        env:
          MAVEN_USERNAME: ${{ secrets.MAVEN_USERNAME }}
          MAVEN_CENTRAL_TOKEN: ${{ secrets.MAVEN_CENTRAL_TOKEN }}
          MAVEN_GPG_PASSPHRASE: ${{ secrets.MAVEN_GPG_PASSPHRASE }}
```

# 修改 pom 文件

Maven GPG Plugin 可能会报以下错误 `Inappropriate ioctl for device` 或者 `gpg: signing failed: No such file or directory`，所以需要在 `configuration` 中添加以下内容:

```xml
<configuration>
  <!-- Prevent gpg from using pinentry programs -->
  <gpgArguments>
    <arg>--pinentry-mode</arg>
    <arg>loopback</arg>
  </gpgArguments>
</configuration>
```

# 添加 GitHub Action 密钥

在 GitHub 仓库的 Settings -> Secrets 中添加以下内容：

1. MAVEN_GPG_PRIVATE_KEY: 通过命令行获取`gpg --armor --export-secret-keys YOUR_ID`
2. MAVEN_GPG_PASSPHRASE: 当前GPG私钥的密码
3. MAVEN_USERNAME: maven central 用户名
4. MAVEN_CENTRAL_TOKEN: maven central 的 token

然后发布新的release版本，GitHub Action 会自动发布你的 jar 包到 Maven Central。
