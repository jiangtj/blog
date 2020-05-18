---
title: Git LFS使用--Netlify Large Media
date: 2019-3-3
updated: 2019-3-3
description: Netlify提供了大文件存储以及图像转换功能，是时候升级一波啦。
categories: [工具]
tags: [Git]
---

# 前言
Git LFS一直都想尝试，但，GitHub上

{% asset_img 1.png %}

1G的存储，1G的带宽是，这量实在是。。。在2月26日，Netlify宣布了流量限制100G，也宣布新的功能，图像转换功能为流量限制做铺垫，以及这个转换功能所附带的大文件存储。一半伤心一半心动。虽然转换功能也有限制，2500次每月（同一次相同转换会缓存，只消耗1次次数），所以对于大部分中小型网站来说都够用了，当然100G的带宽，也是一样。

作为转换功能基础的文件存储，则没提及，可能无限制吧。所以是时候升级啦。

<!-- more -->

# 为什么要使用LFS
原因涉及到Git的底层原理，很多介绍上只说了会使存储库变的很大，所以要用LFS，但事实上二进制文件就是很大的，用了LFS，最后还不是得下一堆二进制文件。根本原因不是这个，而是Git的底层文件系统。Git的所有文件都存放在`.git\objects`中，而修改是保存一个新的文件，而目录中以hash值引用，旧文件是不会被删除的，删除也是一样。所以整个`.git`文件夹会变得特别膨大。

Git LFS能将二进制存储在别处，在Git中存储的只是标记文件，占用空间十分小。所以，当文件被删除后，空间占用也就少了，不会想原先那样，只增不减。

# 如何使用
这里使用Netlify Large Media做存储库。

1. 安装netlify-cli，以及登录
```bash
npm install netlify-cli -g
netlify login
```
2. 安装Large Media插件
```bash
netlify plugins:install netlify-lm-plugin
netlify lm:install
```
3. 关联netlify实例，以及初始化Git LFS配置
```bash
netlify link
netlify lm:setup
```
4. 添加需要Git LFS管理的文件
```bash
git lfs track "source/images/**"
git lfs track "*.jpg"
```
5. 想正常一样操作Git即可
```bash
git commit -m "track"
git push origin master
```

注意：在初次安装Large Media插件时，可能需要关掉命令终端，重新启动来加载脚本

# 图像转换功能
这是另一大激动人心的功能，能帮我们自动转换图片大小。可以省下我们很多事。或者说我们可以不再准备多套分辨率了，想调用api一样获得

通过响应式懒加载库lazod.js实现了该功能，[过滤器](https://github.com/JiangTJ/hexo-theme-next/blob/neet/scripts/filters/lazyload.js)，但奇怪的地方是图片明明一样的，但在不同屏幕下，显示大小不同。所以我改为宽度100%作为默认方案。

# 参考
1. [Netlify Large Media Doc](https://www.netlify.com/docs/large-media/)
