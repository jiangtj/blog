---
title: Theme Show Case
categories: [前端]
tags: [Theme]
banner: /articles/beechnut/theme-show-case/g1.png
date: 2019-05-17 15:13:09
updated: 2019-05-17 15:13:09
menu:
  Cake 主题文档: /cake/ || fas fa-cheese
---

展示些样式，逐步修改中~

<!-- more -->

# Title 1 `code`

## Title 2 `code`

### Title 3 `code`

#### Title 4 `code`

##### Title 5 `code`

###### Title 6 `code`

正文内容1

正文内容2


# Same title
标题一样的情况

# Same title
标题一样的情况

## Same title
标题一样的情况

# List

## Ordered List
1. 第一步修改布局
  1. 布局A要下移
    1. YaYaYaYaYaYaYaYaYaYa
    2. Who care?
  2. 布局B去掉
2. 调整css样式！！

## Unordered List
- 第一步修改布局
  - 布局A要下移
    - YaYaYaYaYaYaYaYaYaYa
    - Who care?
  - 布局B去掉
- 调整css样式！！

## Checked List
- [ ] check this point!
- [x] do you like it?

# Code

```js
hexo.extend.filter.register('theme_inject', function(injects) {
  injects.head.file('custom', 'source/_data/head.swig', {}, {cache: true});
  injects.sidebar.raw('custom', 'Put some in sidebar!');
});
```

## codeblock
{% codeblock 描述 lang:objc http://localhost:4000/articles/beechnut/theme-show-case/ haha.ocjc? %}
[rectangle setX: 10 y: 10 width: 20 height: 20];
{% endcodeblock %}

## include_code
{% include_code title lang:js hexo-newd.js %}

## jsfiddle
{% jsfiddle jiangtj/n1tg3hq2 %}

## gist
{% gist JiangTJ/2f2a8d5089193e5fa60ea45adedfcdec %}


# Table

| 水果        | 价格    |  数量  |
| :--------   | -----:  | :----: |
| 香蕉        | $1      |   5    |
| 苹果        | $1      |   6    |
| 草莓        | $1      |   7    |

## Long Table

|水果|价格|数量|水果|价格|数量|水果|价格|数量|水果|价格|数量|水果|价格|数量|水果|价格|数量|
|---|---:|:--:|---|---:|:--:|---|---:|:--:|---|---:|:--:|---|---:|:--:|---|---:|:--:|
|香蕉|$1|5    |香蕉|$1|5    |香蕉|$1|5    |香蕉|$1|5    |香蕉|$1|5    |香蕉|$1|5    |
|苹果|$1|6    |苹果|$1|6    |苹果|$1|6    |苹果|$1|6    |苹果|$1|6    |苹果|$1|6    |
|草莓|$1|7    |草莓|$1|7    |草莓|$1|7    |草莓|$1|7    |草莓|$1|7    |草莓|$1|7    |

# blockquote
{% blockquote %}
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque hendrerit lacus ut purus iaculis feugiat. Sed nec tempor elit, quis aliquam neque. Curabitur sed diam eget dolor fermentum semper at eu lorem.
{% endblockquote %}

# Images
Inline pic ok? {% asset_img gua.png 100 %}

![](/articles/beechnut/theme-show-case/gua.png)

或者居中显示，你可以使用center或者box样式：
```md
{% asset_img center gua.png 呱呱呱 %}
{% asset_img box gua.png 呱呱呱 %}
```

{% asset_img center gua.png 呱呱呱 %}

{% asset_img box gua.png 呱呱呱 %}

# Link

Autolink: https://jiangtj.com/

[dnocm 站点](https://www.dnocm.com/)

# Button

```md
{% btn #, Text & Icon (buggy), fas fa-home %}
```

{% btn #, Text & Icon (buggy), fas fa-home %}

# Note

{% note icon:disable %}
content
{% endnote %}

{% note default default title %}
content
{% endnote %}

{% note primary default title %}
**Welcome** to [Hexo!](https://hexo.io)
{% endnote %}

{% note info default title %}
**Welcome** to [Hexo!](https://hexo.io)
{% endnote %}

{% note success default title %}
**Welcome** to [Hexo!](https://hexo.io)
{% endnote %}

{% note warning default title %}
**Welcome** to [Hexo!](https://hexo.io)
{% endnote %}

{% note danger default title %}
**Welcome** to [Hexo!](https://hexo.io)
{% endnote %}

