---
title: Dart之环境搭建
date: 2017-10-8
updated: 2017-10-8
categories: [前端]
tags: [Dart]
---


Dart 是一种易学习、易扩展、跨平台的编程语言。   

- 易学习：语法感觉很熟悉，语义是干净和一致的。是Java与Javascript的结合体。
- 易扩展：仅谷歌就有超过200万行的生产Dart代码。应用程序可以达到数十万行代码。
- 跨平台：Dart可以在每一个现代浏览器、命令行、服务器和移动设备上快速运行。

Google 在大型项目中部署使用 Dart。例如，下一代的AdWords (谷歌最重要的赚钱应用)运行在Dart上。   

<!-- more -->

### 下载

windows可下载安装程序，也可以使用Chocolatey来安装  
下载地址：<https://www.dartlang.org/install>    
*需翻墙*  

### 工具

推荐下载WebStorm   
下载地址：<https://www.jetbrains.com/webstorm/>  

### 第一个Angular应用

官方推荐使用AngularDart，当然也有其他用户维护的vue，有兴趣可以尝试下。   

1. 在WebStorm的欢迎界面，选择创建新的工程。或者点击菜单的File > New > Project… 。  
2. 在左侧的菜单中选择Dart。  
3. 如果Dart SDK path 和 Dartium path fields没有值，选择安装路径。  
4. 修改Location中的值，已设置位置路径与应用的名称  
5. Generate sample content 打上勾  
6. 选择AngularDart Web App template  
7. 创建  

![](https://webdev.dartlang.org/guides/images/create-ng2-project.png)

### 运行

- 右键 pubspec.yaml 选择 Pub: Get Dependencies 更新依赖.   
- 右键 web/index.html 文件，然后选择 Run ‘index.html’  

![](https://webdev.dartlang.org/guides/images/run-app-in-ws.png)  

看到下面画面时就好ok咯   

![](https://webdev.dartlang.org/guides/images/run-app.png)  