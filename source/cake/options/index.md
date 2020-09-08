---
title: 配置
include: fm-cake-zh
date: 2020-05-20
updated: 2020-05-20
i18n:
  中文: /cake/options/
  English: /en/cake/options/
---

# 修改主题配置

虽然主题通过npm管理，但仍可以很方便的修改配置，hexo支持通过`theme_config`配置来覆盖主题中的配置

例如，添加网站icon：

```yml
theme_config:
  favicons:
    - rel: icon
      type: image/png
      sizes: 64x64
      href: /images/favicon/xin-64.png
```

如果你的hexo版本大于5.0，你还以在`_config.<theme>.yml`中配置，这等效于`theme_config`

完整的配置，[前往主题仓库查看](https://github.com/jiangtj/hexo-theme-cake/blob/master/_config.yml)

# 注入布局

[hexo-extend-injector2](https://github.com/jiangtj/hexo-extend-injector2)插件的功能，Cake主题提供这些注入点（headBegin,headEnd(head),bodyBegin,bodyEnd,header,footer,postBodyEnd,menu,postMeta,sidebar,variable,style）,如何使用见插件仓库

# 替换布局文件

这部分是hexo的功能，在大部分主题中都支持

```js
const fs = require('fs');
hexo.extend.filter.register('before_generate', function (data) {
  hexo.theme.setView('需要替换的文件路径（相对于主题路径）', fs.readFileSync('你的自定义文件').toString());
});
```

你也可以使用[hexo-theme-plus](https://github.com/JiangTJ/hexo-theme-plus)简化这部分工作
