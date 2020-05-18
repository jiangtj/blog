---
title: Hexo Netlify CMS
date: 2019-1-9
updated: 2019-1-9
categories: [前端]
tags: [Hexo]
---

# 缘由
有时候不想打开电脑修改文章，所以需要一个管理页面代替电脑操作（简单的能修改），一般而言，存在两种方案实现它
- 调用GitHub（或者其他Repo）的Api，获取与修改文件
- 通过Git命令获取修改以及推送文件

但无论那种都存在安全问题，如果在本地操作，那么完全没必要管理站点，不是本地的话且使用静态托管的话（如GitHub Page），如何确保是自己修改呢？这就需要一个安全服务，但本身只是偶尔修改使用，撘一个安全服务似乎不划算，所以这件事就一直搁置着  

前段时间，我将静态服务迁移到了Netlify，发现它居然提供了CMS用于管理静态资源，我体验了Gatsby的例子，能上传媒体文件，能添加与修改文章，相对的安全性（Netlify会获取你的Git仓库很多权限，但我不认为它会做恶意破坏的行为）...满足了我的要求。 

<!-- more -->

在将它应用到Hexo的时候，很不方便，官方例子很老旧，而且没有相关插件，所以简单的写了一个...

下面是0.1.1的Hexo Netlify CMS插件的使用文档

# Hexo Netlify CMS
  
这是一个Netlify CMS的Hexo插件，你可以使用它，简单的开启Netlify CMS服务.   

[Live Demo](https://github.com/JiangTJ/hexo-netlify-cms-example)

## 如何使用
### Step1: 添加依赖
```bash
yarn add hexo-netlify-cms
// or npm
npm i hexo-netlify-cms --save
```
### Step2: 在Hexo中添加配置
```yaml
netlify_cms:
  backend:
    name: git-gateway
    branch: master
```
### Step3: 在Netlify中开启服务

开启netlify git-gateway服务
![](https://raw.githubusercontent.com/JiangTJ/hexo-netlify-cms/master/imgs/git-gateway.png)  

添加netlify-identity-widget.js, 代码如下   
`<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>`  
![](https://raw.githubusercontent.com/JiangTJ/hexo-netlify-cms/master/imgs/snippet.png)

**注意： 建议将身份认证设为仅邀请模式**

Okay, 现在Netlify CMS已经好了, 你可以访问`your-site/admin`查看


## 其他配置
自定义pages自动生成配置
```yml
netlify_cms:
  # pages auto generate
  pages: 
    enabled: true
    # over page collection config
    # if fields not set, would use posts fields config
    config:
      label: "Page"
      delete: false
      editor:
        preview: true
      # fields: 
```

自定义配置文件，覆盖[默认的](https://raw.githubusercontent.com/JiangTJ/hexo-netlify-cms/master/admin/config.yml)
```yml
netlify_cms:
  config_file: netlify.yaml
```

开启/关闭覆盖时间格式配置(默认true)
```yml
netlify_cms:
  over_format: true
```

添加脚本, 用于自定义组件和预览样式   
例如：    
添加`example/source/js/cms/youtube.js`至你的博客下   
```yml
# 需要跳过配置
skip_render:
  - js/**
netlify_cms:
  scripts:
    - js/cms/youtube.js
```

另外，其他的`netlify_cms`配置变量可以在[Netlify CMS](https://www.netlifycms.org/docs/configuration-options/)中找到  

## 调试
```
yarn link
cd example
yarn link hexo-netlify-cms
hexo s
```

# 关于脚本
事实上只是简单的在admin的页面下引入，可以通过Netlift CMS的全局变量`CMS`添加你想实现的自定义组件等。但这块需要花很多时间维护，毕竟预览的原理和hexo生成文件并不一样...    

后续可能会添加对Image Tag的支持(其它应该不考虑实现，因为用不到)....

# 项目
- [Hexo Netlify CMS](https://github.com/JiangTJ/hexo-netlify-cms)
