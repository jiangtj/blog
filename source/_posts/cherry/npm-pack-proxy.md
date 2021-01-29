---
title: NPM 包代理
categories: []
tags: []
date: 2021-01-29 15:57:56
updated: 2021-01-29 15:57:56
description:
---

在国外，最简单的是安装，在国内，最难得就是安装，太难了

下面是一份我正在用的`.yarnrc`的配置

```
disable-self-update-check true
registry "https://registry.npm.taobao.org"
phantomjs_cdnurl "https://npm.taobao.org/dist/phantomjs/"
electron_mirror "https://npm.taobao.org/mirrors/electron/"
electron_builder_binaries_mirror "https://npm.taobao.org/mirrors/electron-builder-binaries/"
sass_binary_site "https://npm.taobao.org/mirrors/node-sass/"
profiler_binary_host_mirror "https://npm.taobao.org/mirrors/node-inspector/"
chromedriver_cdnurl "https://cdn.npm.taobao.org/dist/chromedriver"
operadriver_cdnurl "http://npm.taobao.org/mirrors/operadriver"
node_sqlite3_binary_host_mirror "http://npm.taobao.org/mirrors"
python_mirror "http://npm.taobao.org/mirrors/python"
```
