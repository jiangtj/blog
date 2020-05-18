---
title: 插件
include: fm-cake-zh
i18n:
  中文: /cake/plugins/
  English: /en/cake/plugins/
---

Cake通过插件集成附加的功能，而本身不包含附加功能的任何文件。所以轻量且强大。除此之外，你还可以前往[Awesome NexT](https://github.com/theme-next/awesome-next)，使用NexT主题中的插件

# List

下面是我所编写的插件，其中大部分是NexT原本集成的功能，被我独立出去的（＃￣～￣＃）

- [hexo-cake-canvas-ribbon](https://github.com/jiangtj-lab/hexo-cake-canvas-ribbon): Ribbon背景
- [hexo-cake-math](https://github.com/jiangtj-lab/hexo-cake-math): Math支持
- [hexo-cake-moon-menu](https://github.com/jiangtj-lab/hexo-cake-moon-menu): 新的右下角按钮(阅读进度与返回顶部按钮)
- [hexo-cake-local-search](https://github.com/jiangtj-lab/hexo-cake-local-search): 本地搜索功能
- [hexo-cake-google-analytics](https://github.com/jiangtj-lab/hexo-cake-google-analytics): Google 分析

另外的一些插件，可能对你使用hexo有帮助
- [hexo-netlify-cms](https://github.com/jiangtj/hexo-netlify-cms)：简化Netlify CMS（一个在线的内容编辑器）的使用
- [hexo-theme-plus](https://github.com/jiangtj/hexo-theme-plus)：旨在外部替换主题内部的布局文件

还有些例子，如果你希望自己编写插件，可以参考
- [hexo-cake-live2d](https://github.com/jiangtj-lab/hexo-cake-live2d): Live2d支持(与上游区别：仅Cake生成的Html文件非全部)，如果上游没问题的话请使用上游的插件，我修改的原因是，它会在`hexo-netlify-cms`生成的文件内添加js，导致其页面显示异常
- [hexo-next-article-anchor](https://github.com/jiangtj-lab/hexo-next-article-anchor): 页面标题锚点
- [hexo-next-wapper-tag-cloud](https://github.com/jiangtj-lab/hexo-next-wapper-tag-cloud)：封装hexo-tag-cloud插件

# Use

```bash
# use npm
npm i <plugin-name>(example:hexo-cake-canvas-ribbon) --save
# or use yarn
yarn add <plugin-name>(example:hexo-cake-canvas-ribbon)
```

Cake插件非常容易安装，就像普通的hexo的插件一样，唯一的区别在于在NexT或者Cake主题（[或者其它集成injector2的主题](https://github.com/jiangtj/hexo-extend-injector2)）下有效

如果其它的主题的用户希望使用，请查看[hexo-extend-injector2](https://github.com/jiangtj/hexo-extend-injector2)
