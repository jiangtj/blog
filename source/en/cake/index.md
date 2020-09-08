---
title: Hexo Theme Cake
include: fm-cake-en
date: 2020-05-20
updated: 2020-05-20
i18n:
  中文: /cake/
  English: /en/cake/
---

# About

![image](https://user-images.githubusercontent.com/15902347/81540257-f48c2900-93a3-11ea-8f7a-8f17636344ff.png)

Hexo Theme Cake is a lovely theme based on the 7.1.0 version of NexT. Just like Cake, it's very delicious, and it's easy to do.

Cake has eliminated a lot of features already on NexT, most of which can be quickly integrated into the theme as plugins. If you find that NexT has it and Cake doesn't, you can submit the issue on [GitHub](https://github.com/JiangTJ/hexo-theme-cake) and I will support these features as soon as possible.

# Why

Why do I want to separate a topic separately? This mainly includes the following reasons
1. Practice some new features, most of which I will add to NexT, but due to the number of NexT users, need to consider compatibility, support will be slower
2. With greater control, I can do anything to refactor/remove some dissident features, such as the following example
  - Exturl ~~encryption is meaningless for the front end, so it will be removed~~ , it's said to be effective for SEO, but I still removed it.
  - Note Tag refactoring, adjusting its headers, removing style configuration (retaining a nice style, due to stylus customization)

> So if you like my style, try it out. If you prefer more built-in features, [NexT](https://github.com/next-theme/hexo-theme-next) might be better for you.

# Quick Start

```bash
yarn add hexo-theme-cake
```

Modify `theme` to `cake`, if you are am linux user, can exec this cmd. Others modify it manually.

```bash
sed -ri 's/^theme:.*/theme: cake/g' _config.yml && hexo check
```

**If you use cake theme for the first time, you can exec `hexo check` to check whether the environment is complete.**

`hexo s` runs, you can preview it locally
