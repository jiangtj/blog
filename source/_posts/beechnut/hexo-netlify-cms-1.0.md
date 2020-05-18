---
title: Hexo Netlify CMS 1.0
date: 2019-8-9
updated: 2019-8-9
categories: [前端]
tags: [Hexo]
---

Hexo Netlify CMS隔了好久终于迎来了一次大更新（不兼容），主要有以下的更新内容
1. 扩展fields，在原本的Netlify CMS中，fields的设置比较麻烦，这次独立出`global_fields`方便配置
2. 新增`auto_generator`用于管理`post`与`page`的生成，支持多个`post`配置
3. 默认配置优化，环境搭好（Netlify启用相应服务）后，不需要额外配置便能使用Netlify CMS
4. 调试优化，`--debug`一键修改Netlify CMS授权模式为`test-repo`，可直接调试

详细的文档见[GitHub的Readme](https://github.com/jiangtj/hexo-netlify-cms/blob/master/README-ZH.md)
