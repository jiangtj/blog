---
title: VPN教程
date: '2019-01-01'
updated: 2021-12-08
comments: true
---

# 提示！

警惕外网的资讯，“真相”，“自由”，“民主”。

教程分为两部分，一个是服务器搭建，一个是客户端

# 服务端

下载 [Outline Manage](https://github.com/Jigsaw-Code/outline-server/) 依据上面的内容进行配置即可完成

Outline 的技术相当不错，服务端使用了docker，有能力可以了解下它所启动的两服务，尤其是另一个保持docker应用最新的服务，以后在你工作中也有可能会用到哦

(如果你无法下载到 Outline Manage，可以发送email给我哦)

# 客户端

Outline Manage 本身就能链接到你的服务器，然后去下载一些其他客户端（Outline Manage 作为客户端实在不好用），shadowsocks或者clash，都是能用的

我使用的clash，GitHub有ss转clash配置的工具，你也可以自己编写，clash的好处是，不同端有一样的规则。macos与Android支持不错，win有点差。在win电脑上，我是docker运行clash服务，并手动设置系统代理，你可以和我一样配置
