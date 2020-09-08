---
title: Hexo Theme Cake
include: fm-cake-zh
date: 2020-05-20
updated: 2020-05-20
i18n:
  中文: /cake/
  English: /en/cake/
---

# 一些事

![image](https://user-images.githubusercontent.com/15902347/81540257-f48c2900-93a3-11ea-8f7a-8f17636344ff.png)

Hexo Theme Cake是个lovely主题，基于7.1.0版本的NexT。就像蛋糕Cake，非常非常好吃，而且做起来也简单。

Cake取消了大量NexT上已有的功能，其中大部分能以插件形式，快速集成到该主题。如果你发现NexT有，而Cake没有的，你可以在[GitHub](https://github.com/JiangTJ/hexo-theme-cake)上提交issue，我会尽快支持这些功能。

# 缘由

为什么要单独独立出一个主题？这主要包含以下几点原因
1. 实践一些新特性，大部分我都会添加至NexT中，但由于NexT的用户量，需要考虑兼容性，支持会慢些
2. 更大的控制权，我可以做任何事，重构/去除一些有异议的功能，比如下面的例子
  - Exturl ~~加密对于前端来说没有意义，所以会去除~~ 据说对SEO有效，但我仍然去掉了
  - Note Tag 重构，调整其header的方式，去除了样式配置（保留一种好看的，原因是可以通过stylus自定义）

> 所以如果你喜欢我的样式，可以尝试使用，如果更喜欢更多内置功能，[NexT](https://github.com/next-theme/hexo-theme-next)可能更适合你

# 快速开始

```bash
yarn add hexo-theme-cake
```

修改 `theme` 为 `cake`, 如果你是一个 linux 用户, 可以执行下面的命令行. 其他用户需要手动修改.

```bash
sed -ri 's/^theme:.*/theme: cake/g' _config.yml && hexo check
```

**如果你第一次使用cake主题, 你可以执行 `hexo check` 来检测你的环境是否完整.**

`hexo s`运行，你就能本地预览啦
