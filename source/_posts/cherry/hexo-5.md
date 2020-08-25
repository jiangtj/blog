---
title: Hexo 5.0.0 正式发布
categories: [转载]
date: 2020-08-25 09:43:40
updated: 2020-08-25 09:43:40
description: 文章转载自<a href="https://blog.skk.moe/post/hexo-5/">Sukka</a>，Sukka为hexo 5.0带来了许多特性🎉
banner: https://jiangtj-lab.github.io/pic-repo/img-apricot/20200825094705.png
copyright:
  author: Sukka
  cc: BY-NC-SA
  url: https://blog.skk.moe/post/hexo-5/
---

Node.js 上最快的静态站点生成器 Hexo 发布了 5.0.0 版本。作为 Hexo 核心团队成员，让我为大家介绍一下 Hexo 5.0.0 中的新特性，以及如何从 Hexo 4.x 版本升级到 Hexo 5.0.0。

<!-- more -->

# 新特性

## 通过 npm 安装主题

过去，安装 Hexo 主题需要 `git clone` 或者下载、解压 zip；更新主题时还需要迁移 `_config.yml` 。Hexo 5.0.0 支持通过 npm 安装主题。现在安装一个主题只需要三步：

- 使用 `npm install hexo-theme-[主题的名称]` 即可安装主题；
- 在站点的 `_config.yml` 中指定主题的名称：
  ```yml
  theme: "[主题的名称]"
  ```
- 在站点根目录下新建一个文件 `_config.[主题的名称].yml`，在该文件中填入主题的配置即可。

对于主题的开发者、插件开发者，以及进阶的 Hexo 用户来说，这是你们想要了解的技术细节：

- 为了保证向后兼容性，Hexo 依然支持从 `themes/[主题的名称]` 目录加载主题。其中，`themes/[主题的名称]` 的优先级高于 `node_modules/hexo-theme-[主题的名称]`。也就是说，只有当 Hexo 发现 `themes/[主题的名称]` 目录不存在时，才会从 `node_modules/hexo-theme-[主题的名称]` 目录中加载主题。
- Hexo 5.0.0 新增了通过站点根目录下 `_config.[主题的名称].yml` 文件配置主题的功能。这是除主题目录下的 `_config.yml` 文件、以及站点配置文件的 `theme_config` 字段外第三种配置主题的方式。
- 为保证向后兼容性，Hexo 会按照如下优先级 deep merge 三份主题配置：`站点配置文件的 theme_config 字段 > 站点根目录下的 _config.[主题的名称].yml > 主题目录下的 _config.yml`。因此，我们建议主题开发者尽量限制配置文件层级为 1 级，避免在 deep merge 时更深层级的配置项会被合并而不是被覆盖。

## PrismJS 代码高亮支持

Hexo 5.0.0 新增了 PrismJS 代码高亮支持。

相比 highlight.js 可以在 Node.js 环境执行（即：可在 Hexo 生成页面时进行代码高亮）不同，PrismJS 是一个轻量级的代码高亮库，绝大部分插件都依赖浏览器中执行。Hexo 为了尽可能兼容 PrismJS 的功能和插件，提供了「生成时渲染」和「浏览器渲染」两种模式：前者只需在主题之中引入 PrismJS 的 CSS 即可，但是无法使用大部分 PrismJS 的插件；后者需要在主题中同时引入 PrismJS 的 CSS 和 `prism.js`，但是可以兼容 PrismJS 大部分插件。

关于 Hexo 主题的开发者适配 Hexo 的两种代码高亮的技术细节，我们专门撰写了 [相关的文档页面](https://hexo.io/docs/syntax-highlight) 以供参考。

## 静态 HTML 片段插入

插件开发者经常需要在页面中插入 HTML 片段：播放器插件需要往页面中插入 `player.css` 和 `player.js`，lazyload 插件的作者需要往页面中插入 `lazyload.js`，Live2D 插件的作者需要往页面中插入对应的 CSS 和 JS，等等。Hexo 5.0.0 新增了一个插件 API 接口 Injector，用于往页面的 `<head>` 和 `<body>` 标签中注入静态 HTML 片段。这一功能支持：

- 在 `<head>` 之后、`</head>` 之前、`<body>` 之后 和 `</body>` 之前四个位置插入代码。
- 支持只在特定页面注入 HTML 片段 —— 插件开发者可以仅往文章页面插入 HTML 片段而不影响其他页面如首页和归档。
- 插件开发者请参考 Hexo 的 [Injector API 文档] 了解具体使用方法。

## 其他新特性

除上述三个重磅功能外，Hexo 还新增了其他功能，如：

- 标签插件 API 新增 `unregister` 方法
- `tagcloud` 辅助函数新增支持自定义 class 属性和 level
- `feed_tag` 辅助函数增加对 hexo-generator-feed 插件的兼容
- `youtube` 标签插件新增对 YouTube 播放列表的支持，以及可选使用 `www.youtube-nocookie.com` 域名
- `post_link` 标签插件在找不到对应文章时将会显示警告信息
- `post_permalink` 配置项新增支持 :second 属性
- 当文章的标签插件出现渲染错误时，报错信息将会显示出错文件的路径

# 修复的 Bug

- 修复了 数个相邻的标签插件 无法渲染的 Bug
- 修复了 文章中的代码块由于包含大括号（`{` 和 `}`）导致的渲染失败
- 修复了 包含 Source Map 的 Hexo 插件无法加载的 Bug
- 修复了 code 标签插件无法解析 `wrap` 选项的问题
- 当 `post_asset_folder` 功能启用时，`hexo new` 命令将不再生成错误的 `index` 目录

# 性能改进

一如既往，Hexo 5.0.0 也带来了一系列性能改进，以提升 Hexo 的渲染性能。

- 改进了标签插件的渲染性能
- 优化了 `meta[generator]` 标签注入的逻辑
- 优化为外部链接添加 `rel=noopenner` 和 `target="_blank"` 功能的性能
- 确保 `after_render:html` Filter 在每个页面只执行一次
- 优化了 Filter API 的执行速度
- 延迟加载代码高亮，减少 Hexo 启动用时
- 当执行 `hexo clean` 时不再加载无关的插件

# 从 Hexo 4.x 升级到 Hexo 5.x

Hexo 5.0.0 引入了少数不向后兼容的功能，因此当你升级到 Hexo 5.0.0 时，需要遵循以下步骤进行迁移：

## 升级 Node.js

Hexo 5.0.0 不再支持 Node.js 8 及更低版本。为了使用 Hexo 5.0.0，请确保 Node.js 版本不低于 10.13.0。

## 文章 Front-Matter 不再支持 keywords 字段

过去这一字段被主要用于 `open_graph` 辅助函数。升级到 Hexo 5.0.0 后你无需去除现有文章的 Front-Matter 中的 `keywords` 字段，但这一字段将不会再起任何作用。

## 文章 Front-Matter 中 permalink 字段的行为

Hexo 5.0.0 修改了在文章的 Front Matter 中指定 `permalink` 字段的行为，与独立页面的 `permalink` 的行为一致。

## 全局变量中不再包含 Lodash

Hexo 5.0.0 去除了全局变量中的 Lodash，因此主题无法继续在模板中使用 Lodash。主题开发者应该遵循 [You-Dont-Need-Lodash-Underscore](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore) 进行迁移。

## 用 updated_option 配置代替 use_date_for_updated

Hexo 4.0.0 提供的 `use_date_for_updated` 配置项现已被 `updated_option` 替代。

`use_date_for_updated: true` 现在等价于 `updated_option: 'date'`。
`use_date_for_updated: false` 现在等价于 `updated_option: 'mtime'`。
