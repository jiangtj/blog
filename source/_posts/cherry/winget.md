---
title: WinGet Windows官方的包管理工具
categories: [工具]
date: 2021-07-01 20:54:09
updated: 2021-07-01 20:54:09
description: 当你重装电脑的时候，这或许能让你最快进入状态
---

WinGet 是官方推出的包管理工具，它目前支持以下命令

```cmd
winget  install   安装给定的程序包
winget  show      显示有关程序包的信息
winget  source    管理程序包的来源
winget  search    查找并显示程序包的基本信息
winget  hash      哈希安装程序的帮助程序
winget  validate  验证清单文件
winget  settings  打开设置
winget  features  显示实验性功能的状态
winget  export    导出已安装程序包的列表
winget  import    安装文件中的所有程序包
```

大部分命令都是很常见的，相对于Linux来说，没有更新，没有删除，差了些，但不管怎样有了，意味着以后总有完善的机会。目前 WinGet 最适合的场景就是重装完系统，快速安装软件

<!-- more -->

这需要用到的 export 与 import 命令

```cmd
winget export -o install.json
```

运行以上命令，将系统中支持包安装的软件生成json列表

然后运行，重装完成后运行 `winget import install.json` 快速安装软件，有些不支持的软件做好记录，手动安装。这也同样适用于在不同电脑上安装熟悉的工作或娱乐环境。

比如，我的列表如下

{% include_code lang:json install.json %}

任何地方，我要快速安装环境都只需要下下来这个json，import下就可以了，是不是很方便，那还不赶紧也弄一份自己的软件列表
