---
title: Flutter 环境搭建注意事项
categories: [前端]
tags: [Flutter, Android, Dart]
date: 2020-08-28 16:21:58
updated: 2020-08-28 16:21:58
description: Flutter 是谷歌推出的，用于构建跨平台原生应用
---

国内无法访问谷歌的服务，所以参考这篇 [Using Flutter in China](https://flutter.dev/community/china) 官方的文档，进行配置

Flutter的中文社区为： https://flutter.cn

# SDK下载

使用 https://storage.flutter-io.cn/ 代替 https://storage.googleapis.com/ ,下载对应的SDK，例如

- Original URL: https://storage.googleapis.com/flutter_infra/releases/stable/windows/flutter_windows_v1.0.0-stable.zip

- Mirrored URL: https://storage.flutter-io.cn/flutter_infra/releases/stable/windows/flutter_windows_v1.0.0-stable.zip

或者使用迅雷下载，迅雷P2P加速可以绕过([迅雷11内测版下载](http://down.sandai.net/thunder11/XunLeiSetup11.0.2.52Preview.exe))

# Android Studio

Jetbrains 的[下载工具](https://www.jetbrains.com/toolbox-app/)已经支持下载 Android Studio, 可以通过它下载

Android SDK 现在似乎不被屏蔽了。。。

# 使用镜像

Flutter 依赖于 Dart 的依赖环境，在国内需要通过镜像访问。所以在在运行Fltter命令之前，需要设置两个环境变量：`PUB_HOSTORD_URL`和`FALTER_STORKER_BASE_URL`。

MacOS/Linux 用户

```bash
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```

Windows 用户

在 `电脑 -> 属性 -> 高级系统设置 -> 高级 -> 环境变量` 中修改

# 下载 Gradle

Gradle 没被墙，但是下载很慢，如果不手动下载，可能长时间卡在这一步

当你创建一个新项目时，会生成一些文件，其中有个`${project}/android/gradle/wrapper/gradle-wrapper.properties`

```properties
#Fri Jun 23 08:50:38 CEST 2017
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-5.6.2-all.zip
```

这个文件描述了 Gradle 下载的位置，以及它的分发地址(我这需要下载bin归档，不知道是我环境问题还是什么，即<https://services.gradle.org/distributions/gradle-5.6.2-bin.zip>)

存放的位置很奇怪，是`${GRADLE_USER_HOME}/wrapper/dists/gradle-S{version}-all/${sha}/`，比较简单的方法是先运行下，再去找这个目录，把已经下好的 gradle 归档文件直接丢进去，不需要减压或重命名

暂时就这些，如果还有以后补充
