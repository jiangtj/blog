---
title: Options
include: fm-cake-en
date: 2020-05-20
updated: 2020-05-20
i18n:
  中文: /cake/options/
  English: /en/cake/options/
---

# Modify theme configuration

Although themes are managed by NPM, they can be easily configured, and hexo supports overridden configurations in themes through the key `theme_config`

For example, to add a website icon:

```yml
theme_config:
  favicons:
    - rel: icon
      type: image/png
      sizes: 64x64
      href: /images/favicon/xin-64.png
```

If your hexo version is greater than 4.2, you can also configure it in `config.<theme>.yml`, which is equivalent to `theme_config`

You can also use this [hexo-config-plus](https://github.com/jiangtj-lab/hexo-config-plus) plugin to modify the configuration

For the complete configuration,[go to the theme repository to view it](https://github.com/jiangtj/hexo-theme-cake/blob/master/_config.yml)

# Inject content

This is the function of [hexo-extend-injector2](https://github.com/jiangtj/hexo-extend-injector2) plugin. Cake theme provides these injection points (headBegin, headEnd (head), bodyBegin, bodyEnd, header, footer, postBodyEnd, menu, postMeta, sidebar, variable, style), how to use see plugin warehouse

# Replace layout

This part is the function of hexo, which is supported in most themes (you need to replace include with partial, and Cake can be replaced except for the root of layout).

```js
Const fs = require('fs');
Hexo.extend.filter.register('before_generate', function (data) {
  hexo.theme.setView('File path to be replaced', fs.readFileSync('your custom file').toString());
});
```

You can also simplify this part of the work with [hexo-theme-plus](https://github.com/JiangTJ/hexo-theme-plus)
