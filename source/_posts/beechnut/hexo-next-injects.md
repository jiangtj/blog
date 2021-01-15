---
title: Hexo NexT 高阶教程之 Injects
categories: [前端]
tags: [Hexo, NexT]
date: 2019-07-11 09:54:31
updated: 2019-07-11 09:54:31
description: 一个全新的自定义主题方式，分享你的Code。
i18n:
  中文: /articles/beechnut/hexo-next-injects/
  English: /en/articles/beechnut/hexo-next-injects/
---

# 前世因

这要追溯到3月份，Mimi的[PR:Adding Submodule](https://github.com/theme-next/hexo-theme-next/pull/663)，我们讨论了如何管理第三方依赖。LEAFERx提出了使用NPM管理会更好，他进行了实践PR:Extract leancloud-counter to plugins [#677](https://github.com/theme-next/hexo-theme-next/pull/677) [#707](https://github.com/theme-next/hexo-theme-next/pull/707)。在我看来LEAFERx的方案并不好，因为复杂。所以要做到插件化，有两个必须达到的要求：

1. 灵活与可扩展性，在插件中，我们就要能修改大部分内容。
2. 操作简单，我们通过极少的代码集成我们想要的功能。

除此外，ivan-nginx还关心文档的问题，但如果能完全独立，存放在插件库中也不是什么大问题。在此期间，我也进行过尝试[PR:Refactoring comments](https://github.com/theme-next/hexo-theme-next/pull/711)，毕竟现在的评论系统真的"烂"，一堆`if else`。这次的重构是挺好的尝试，但我不敢轻易合，因为影响大（几乎所有人），而后来发现了另一个方案，是Hexo的一个插件[hexo-inject](https://github.com/hexojs/hexo-inject)，通过注入代码的方式实现定制内容，由于hexo本身与主题分离，它仅能提供4个注入点，可扩展性远远不够。但如果能在NexT中实现，就完全不同了，于是我提了[PR:Add new filter type theme_inject](https://github.com/theme-next/hexo-theme-next/pull/868)

<!-- more -->

# 使用 Injects

Okay，缘由讲到这，接下来来体验下如何使用`theme_inject`。当然，如果你是小白，完全可以使用配置文件中的`custom_file_path`来添加自定义内容。如果想更加定义化，那么跟着我一步步走下去。Injects具体的定义见[NexT文档](https://theme-next.org/docs/advanced-settings#Injects)。这里接下来是个例子，一步步集成[gitter](https://sidecar.gitter.im/)。

## 注入布局

首先，我们在hexo或者theme的`scripts`创建一个js文件（名字随意），添加以下内容。只要是这里面的脚本，hexo运行时会执行它。

```js
hexo.extend.filter.register('theme_inject', function(injects) {
  //名字路径等都可以随意修改，为了方便下文都以这里的定义为主
  injects.head.file('gitter', 'views/gitter.swig', {}, {cache: true});
});
```

第二步，我们创建`views/gitter.swig`文件，添加以下内容。
```html
<script>
  ((window.gitter = {}).chat = {}).options = {
    room: 'your-room-name'
  }});
</script>
<script src="https://sidecar.gitter.im/dist/sidecar.v1.js" async defer></script>
```

`hexo s`运行，你可以看到右下角已经集成了gitter。

## 注入样式

接下来，我们调整下样式。在脚本中，多加样式的注入。

```js
hexo.extend.filter.register('theme_inject', function(injects) {
  injects.head.file('gitter', 'views/gitter.swig', {}, {cache: true});
  injects.style.push('views/gitter.styl');
});
```

创建`views/gitter.styl`文件

```css
.gitter-open-chat-button {
  background-color: slateblue;
  margin-bottom: .8rem;
  margin-right: 1rem;
  padding: .4rem .8rem;
  border-radius: .6rem;
  box-shadow: 0 0 .4rem #111;
  opacity: .9;
}

.gitter-open-chat-button:focus,.gitter-open-chat-button:hover {
  background-color: slateblue;
  box-shadow: 0px 0px 0.8rem #111;
}

.gitter-open-chat-button.is-collapsed {
  transform: translateY(150%);
}

.sidebar-toggle {
  margin-bottom: 18px;
}
```

再次运行，按钮的样式变咯，你觉得相对于原来是好看还是...？

# 制作NPM插件

开源的精神在于分享，当你将你的主题自定义之后，你可能会写一篇文章《如何实现在NexT中XXXX》。然后，Visitor看到后，跟着你一点点的改。虽然没什么问题。但毕竟“懒”才是原动力，如果我们能将这一切放入到一个NPM插件中，那么他们使用的时候，就只需要`yarn add xxxx`就行了。这将多方便呀！！！

接下来要实现是一个集合滑动到底部/头部和阅读进度的插件，最终效果见[hexo-cake-moon-menu](https://github.com/jiangtj-lab/hexo-cake-moon-menu)，以及右下角的那个按钮

为了能上传至NPM仓库，你首先需要在它上面创建一个账户:<https://www.npmjs.com/>，另外为了方便，我是用的是yarn作为命令行工具

## 初始化一个NPM包

新建一个文件夹，并在里面运行`yarn init`，会问你一系列的问题(如下面)，完成后会初始化一个package.json

```cmd
PS C:\Users\MrTT\Desktop\hexo-moon-menu> yarn init
yarn init v1.16.0
question name (hexo-moon-menu): @jiangtj/hexo-moon-menu
question version (1.0.0):
question description: Hallo
question entry point (index.js):
question repository url: https://github.com/jiangtj/hexo-theme-cake.git
question author: Mr.J
question license (MIT): LGPL-3.0
question private: false
success Saved package.json
Done in 99.85s.
```

- name建议添加`@scope`也就是`@你的用户名`，毕竟到时候有一样名字的包，无法上传
- name必须以`hexo-`或者`@scope/hexo-`开头

## 创建例子工程预览插件

你需要将你的插件上传上出（这步原本是最后一步，但由于hexo会检测package.json来执行插件，所以必须先有插件），在当前项目中运行`yarn publish --access public`

添加一个`.gitignore`，如果默认情况下，npm也会依据它忽略不必要的文件
```
node_modules/
*.log
example/
```

运行以下命令，来创建例子项目
```bash
# 在example创建hexo项目
hexo init example
# 进入到example目录下
cd example
# 添加next主题
git clone https://github.com/theme-next/hexo-theme-next themes/next
# 切换主题配置
hexo config theme next
# 切换Gemini scheme, 这次的插件由于和展开侧边栏的冲突，所以Muse中暂时不支持，如果你感兴趣可以自行在Muse中实现
hexo config theme_config.scheme Gemini
# 运行预览
hexo s
```

关联插件
```bash
# 添加依赖
yarn add "@jiangtj/hexo-moon-menu"
# 为插件创建引用，来调试
cd ..
yarn link
cd example
yarn link "@jiangtj/hexo-moon-menu"
# 运行预览，由于什么都没做所以没什么变话
hexo s
```

## 布局与样式

接下来将我的项目中[hexo-cake-moon-menu](https://github.com/jiangtj-lab/hexo-cake-moon-menu)以下部分复制到你的插件项目
- default.yaml 默认配置
- moon-menu.swig 菜单的布局
- moon-menu.styl 菜单的样式

在上面的Injects使用中，你能体会到重点在于js脚本，样式等都是通过它进行组织的，所以样式我就忽略了，如果你想研究可以查看那些

## 脚本

package.json 中的 main 定义了脚本的入口文件，默认是`index.js`，所以我们创建它，并添加以下内容

```js
// 需要引入的依赖
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('theme_inject', function(injects) {

  // 需要禁用原本的按钮
  hexo.theme.config.back2top.enable = false;

  // 读取默认配置文件
  // __dirname至该文件的绝对目录，需要注意这里的位置如果不使用path获取绝对路径，文件读出会异常（建议你尝试，体验npm的坑）
  let defaultConfig = yaml.load(fs.readFileSync(path.join(__dirname, 'default.yaml')));
  // 合并默认配置与hexo里的moon_menu配置
  let moonMenu = Object.assign(defaultConfig, hexo.config.moon_menu);

  // 重新组织菜单，排序等
  let moonMenuArr = Object.keys(moonMenu)
    .map(key => moonMenu[key])
    .map(item => {
      item.order = item.order || 0;
      if (item.enable === undefined) {
        item.enable = true;
      }
      return item;
    })
    .filter(item => item.enable)
    .sort((a, b) => a.order - b.order);

  // 添加布局
  injects.bodyEnd.file('moon-menu', path.join(__dirname, 'moon-menu.swig'), {menus: moonMenuArr}, {cache: true, only: true});
  // 添加样式
  injects.style.push(path.join(__dirname, 'moon-menu.styl'));

});
```

忘了，你需要添加`js-yaml`依赖用于解析yaml
```bash
cd ..
yarn add js-yaml
cd example
hexo s
```

再次运行预览，你就可以看到按钮添加到你的例子工程中拉

## 上传与分享

完成后记得别忘记上传`yarn publish --access public`，然后赶紧在自己的博客中试下把`yarn add @jiangtj/hexo-moon-menu`

如果你希望更多看到与使用你的插件，欢迎提交PR至 [Awesome-NexT](https://github.com/theme-next/awesome-next)

## 其它

我们在插件中也可以载入其他hexo的插件，在添加hexo插件（`yarn add plugin-name`）之后。通过以下代码加载脚本

```js
const tagcloud = hexo.resolvePlugin('plugin-name')
hexo.loadPlugin(tagcloud).then(() => {
  hexo.log.debug('Plugin loaded: plugin-name');
}).catch(err => {
  hexo.log.error({err}, 'Plugin load failed: plugin-name');
});
hexo.extend.filter.register('theme_inject', injects => {
  //...
});
```

> 注意：`hexo.loadPlugin`需要放在过滤器等的外边，确保其在第一时间执行，上面的代码来自一个例子：[hexo-next-wapper-tag-cloud](https://github.com/jiangtj-lab/hexo-next-wapper-tag-cloud)

# 后世果

虽然这个theme_inject已经合并了，但还有许多需要改进
- 有必要使NexT更结构化，以提供更多的注入点
- 评论系统的重构PR关闭了，多方面原因，我计划基于theme_inject重新重构它（Done）
