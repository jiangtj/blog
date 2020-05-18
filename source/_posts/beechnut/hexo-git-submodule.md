---
title: 使用Git Submodule管理Hexo主题
categories: [前端]
tags: [Hexo, Git]
date: 2019-08-07 23:23:25
updated: 2019-08-07 23:23:25
description: “小白”都能玩耍的的方式，将一切井井有条
i18n:
  中文: /articles/beechnut/hexo-git-submodule/
  English: /en/articles/beechnut/hexo-git-submodule/
---

不多说废话，介绍一种简单又近乎完美的主题管理方式。文章中使用[Cake](https://github.com/jiangtj/hexo-theme-cake)主题介绍，如果你使用NexT替换对应的链接。

需要提前储备的知识，如果不懂请至百度
- 基本的Git操作（Git Init/Add/Commit/Pust/Fetch/Pull）
- 基本的Node/NPM操作（npm install）或者Yarn（类似于NPM）
- 基本的Hexo命令（hexo init/cl/s/g）

<!-- more -->

# 初始化项目

首先我们创建一个新的hexo项目，命令行运行以下命令
```bash
# Create a new hexo project
hexo init <dir>
cd <dir>
```

将该项目使用Git管理
```bash
git init
# do something by yourself, if you want to push it to GitHub.
```

添加Cake主题作为该项目的Git子模块
```bash
git submodule add https://github.com/JiangTJ/hexo-theme-cake themes/cake
```

修改Hexo中的配置文件`theme`为`cake`

一个基本的项目通过上面的步骤可以创建，如果你看到这篇文章前已经有自己的博客项目，定位到未完成的步骤起，跟着走完。

# 更新主题版本

如果你使用的主题仍在被维护，那么你能从远程获取更新。这部操作很简单，像下面这样：
```bash
git submodule update --remote
```

它会从远程拉取最新master上的代码至你的子模块（也就是你的主题）中

> 如果你想修改拉取的分支通过`git config -f .gitmodules submodule.themes/cake.branch stable`，一般情况下，master分支足够好，不需要修改

# 使用npm脚本替换

git submodule的命令不好记，另一种方式是使用npm脚本替换。编辑`package.json`文件，添加以下内容：
```json
{
  "name": "mrtt-hexo-blog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "update-theme": "git submodule update --remote"
  },
  "hexo": {
    "version": "3.9.0"
  },
  "dependencies": {
    //...
  }
}
```

之后每次更新都只需要运行`npm run update-theme`

# 自定义主题

这个问题经常被提到，想要从官方的远程仓库获取更新，但又希望能修改主题的文件，添加自己的代码，也就是传说中的魔改，怎么处理呢

一种方式是fork，然后将自己fork的主题作为子模块，但每次更新需要先将官方的更新同步至你fork的主题（有点麻烦）

另一种是这里介绍的：替换。我不对主题文件做修改，但我能在外面创文件。思路是将外面与主题的文件路径一致替换掉对应的主题的文件

## 替换

首先，安装一个hexo插件[hexo-theme-plus](https://github.com/jiangtj/hexo-theme-plus)
```bash
npm i --save @jiangtj/hexo-theme-plus
```

默认情况下，已经配置好了替换路径，如果你需要修改，在hexo中修改以下配置
```yml
theme_plus:
  custom_path: custom/theme # disabled: set 'false'
```

在`custom/theme`创建对应的主题文件，比如`${theme_dir}/layout/_partials/footer.swig`，将它复制到`${hexo_dir}/custom/theme/_partials/footer.swig`，然后稍微做些修改，比如我在作者信息那里加了个颜表情Ծ‸ Ծ
```html
  <span class="author" itemprop="copyrightHolder">{{ theme.footer.copyright || author }} Ծ‸ Ծ</span>
```

`hexo s`运行预览，我们可以看到最底下，作者的后面已经加上了Ծ‸ Ծ

> Replace存在一点缺陷，首先只支持`layout`下的文件，其次需要主题支持（使用partial，不能用模版的特定的语法比如include），Cake除了`layout`根目录下外，其余都支持替换，但NexT需要你替换`include` `macro`等语法

## 注入

除了替换，还可以在注入点注入任何你希望的代码，详细见我上篇文章[Hexo NexT 高阶教程之 Injects](/articles/beechnut/hexo-next-injects/)

# 另一台电脑上编辑

使用Git仓库同步的情况下，如果你需要在另一台电脑上工作，你唯一需要做的事是在`git clone`命令上加上`--recursive`

```bash
git clone --recursive https://github.com/your-name/your-blog
```

如果是GUI工具，那么什么都不用改变，它们默认都是加`--recursive`的

如果你忘记加`--recursive`了，多执行下以下命令，当然你也可以将它加入到你的npm scripts里，方便记住它

```bash
git submodule init
git submodule update
```

# 总结

1. 不要修改任何主题文件，我相信替换与注入配合，你已经能修改任何的主题代码了，这能保证你的主题仓库可以直接设置为官方的仓库，且更新无冲突
2. 需要记住的命令很少，就两个`git submodule update --remote`和`git clone --recursive repo`
