---
title: 小白VPN教程
date: 2019-2-25
updated: 2020-9-1
description: 这可能是最简单的VPN教程，但仍有一定的门槛。
categories: [工具]
tags: [vpn]
---

# 服务器

你需要购买一台境外的服务器，代理你的访问。你可以在很多地方购买，腾讯云、阿里云、vultr、Google Cloud、Digitalocean、AWS。

目前，腾讯云、阿里云推出了云轻服务器，1TB流量 24元/月，比vultr的 500GB 3.5$/月贵 1TB 5$/月便宜，你根据自己的需求选择。

[点击前往 腾讯云 轻量应用服务器 Lighthouse](https://cloud.tencent.com/act/cps/redirect?redirect=30206&cps_key=6a42afe857898b23e459adb601ec5d9d)

在选购时，选择国外地区

<!-- more -->

# 部署SS

1. 下载[Outline Manage](https://github.com/Jigsaw-Code/outline-server/releases)，选择合适你的系统（你日常使用的电脑，不是服务器），安装管理软件
2. 点击添加，选择你的服务器供应商（如果没有，选第四个）
   {% asset_img 1.png %}
3. 复制下图步骤1中的脚本，在服务器上运行
   {% asset_img 2.png %}
4. 耐心等待安装完成
5. 复制安装结束后的输出内容（管理凭证）至上图步骤2的输入框内

## 管理凭证

管理凭证是你管理服务器上的outline的唯一凭证，假如你不小心删除了服务器或者你希望在另一台机器上也管理你的outline，你可以在以下路径寻找到`opt/outline/access.txt`，老用户在`/root/shadowbox/access.txt`，我的更奇葩在`~/shadowbox/access.txt`...算元老级了吧

# 使用SS

1. 添加密钥，你可以为不同使用者分配不同的key
   {% asset_img 3.png %}
2. 点击上图中的分享，复制其中的SS密钥（access key）
   {% asset_img 4.png %}
3. 下载客户端，outline客户端不好用，推荐官方的
  - [安卓](https://github.com/shadowsocks/shadowsocks-android/releases)
  - [Windows](https://github.com/shadowsocks/shadowsocks-windows/releases)
  - IOS\MAC 由于我没有，所以不知道哪个软件好
4. 将复制的密钥导入

至此，你已经能科学上网啦~

你还可以看看[更多VPN相关介绍](/more/vpn)
