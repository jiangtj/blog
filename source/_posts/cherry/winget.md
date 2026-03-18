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

大部分命令都是很常见的，相对于Linux来说，WinGet的安装方式是下载exe mis等文件，直接运行安装，在体验上有些怪怪的。而且，从我个人使用来看，目前 WinGet 最适合的场景就是重装完系统，快速安装软件

<!-- more -->

这需要用到的 export 与 import 命令

```cmd
winget export -o install.json
```

运行以上命令，将系统中支持包安装的软件生成json列表

然后运行，重装完成后运行 `winget import install.json` 快速安装软件，有些不支持的软件做好记录，手动安装。这也同样适用于在不同电脑上安装熟悉的工作或娱乐环境。

比如，我的列表如下

```json
{
  "$schema": "https://aka.ms/winget-packages.schema.2.0.json",
  "CreationDate": "2021-12-02T11:49:20.258-00:00",
  "Sources": [
    {
      "Packages": [
        {
          "PackageIdentifier": "Alibaba.aDrive"
        },
        {
          "PackageIdentifier": "360.360zip"
        },
        {
          "PackageIdentifier": "Jigsaw.OutlineManager"
        },
        {
          "PackageIdentifier": "MarkText.MarkText"
        },
        {
          "PackageIdentifier": "Canonical.Ubuntu"
        },
        {
          "PackageIdentifier": "Docker.DockerDesktop"
        },
        {
          "PackageIdentifier": "Tencent.Foxmail"
        },
        {
          "PackageIdentifier": "GitHub.GitHubDesktop"
        },
        {
          "PackageIdentifier": "Git.Git"
        },
        {
          "PackageIdentifier": "Kingsoft.WPSOffice-CN"
        },
        {
          "PackageIdentifier": "Microsoft.Edge"
        },
        {
          "PackageIdentifier": "Microsoft.WindowsTerminal"
        },
        {
          "PackageIdentifier": "Microsoft.OneDrive"
        },
        {
          "PackageIdentifier": "Postman.Postman"
        },
        {
          "PackageIdentifier": "Tencent.QQBrowser"
        },
        {
          "PackageIdentifier": "Tencent.QQMusic"
        },
        {
          "PackageIdentifier": "Sogou.QQPinyin"
        },
        {
          "PackageIdentifier": "JetBrains.Toolbox"
        },
        {
          "PackageIdentifier": "Tencent.WeChat"
        },
        {
          "PackageIdentifier": "beekeeper-studio.beekeeper-studio"
        },
        {
          "PackageIdentifier": "Tencent.QQ"
        },
        {
          "PackageIdentifier": "EpicGames.EpicGamesLauncher"
        },
        {
          "PackageIdentifier": "Microsoft.VC++2012Redist-x86"
        },
        {
          "PackageIdentifier": "OpenJS.NodeJS.LTS"
        },
        {
          "PackageIdentifier": "Yarn.Yarn"
        },
        {
          "PackageIdentifier": "Logitech.GHUB"
        },
        {
          "PackageIdentifier": "Telegram.TelegramDesktop"
        },
        {
          "PackageIdentifier": "Microsoft.dotnetRuntime.5-x64"
        },
        {
          "PackageIdentifier": "Microsoft.VisualStudioCode"
        },
        {
          "PackageIdentifier": "Oracle.JDK.17"
        },
        {
          "PackageIdentifier": "GitHub.cli"
        },
        {
          "PackageIdentifier": "Microsoft.VC++2015-2019Redist-x86"
        },
        {
          "PackageIdentifier": "Microsoft.VC++2015-2019Redist-x64"
        }
      ],
      "SourceDetails": {
        "Argument": "https://winget.azureedge.net/cache",
        "Identifier": "Microsoft.Winget.Source_8wekyb3d8bbwe",
        "Name": "winget",
        "Type": "Microsoft.PreIndexed.Package"
      }
    }
  ],
  "WinGetVersion": "1.2.3131-preview"
}
```

任何地方，我要快速安装环境都只需要下下来这个json，import下就可以了，是不是很方便，那还不赶紧也弄一份自己的软件列表
