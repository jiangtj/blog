---
title: 发布 npm 包到 GitHub Packages
categories: [前端]
tags: [Packages]
date: 2020-04-22 09:37:54
updated: 2020-04-22 09:37:54
description:
---

GitHub Packages在半年前尝试过，那时候存在些问题

1. ~~不能使用yarn安装（这个已经修复了）~~
2. 必须认证授权才能使用，即便你的包是开源的，很不方便

![](https://jiangtj-lab.github.io/pic-repo/img-apricot/20200422094211.png)

但不管怎样，GitHub Packages始终是个不错的备选方案

<!-- more -->

# 授权

与其它包管理不同，在GitHub Packages上，无论上传还是下载安装都需要授权

首先需要在`Developer settings/Personal access tokens`中创建一个token，选择你需要的权限

![](https://jiangtj-lab.github.io/pic-repo/img-apricot/20200422095056.png)

然后将token添加至`~/.npmrc`(win用户路径`C://用户/你当前登录用户`)

```
//npm.pkg.github.com/:_authToken=TOKEN
```

或者使用`npm login`命令进行授权

```
$ npm login --registry=https://npm.pkg.github.com
> Username: USERNAME
> Password: TOKEN
> Email: PUBLIC-EMAIL-ADDRESS
```

# 发布一个包

需要先完成授权，GitHub Packages的发布与npm上基本一致，除了包名称有规定和发布地址修改外

在GitHub Packages中，你的包名称必须与项目名称对应，例如`user/test`项目，对应的包名称为`@user/test`

其次需要指定发布地址，选择以下两种途径中的一种

- 编辑项目中的`.npmrc`(与`package.json`同路径下)，添加GitHub Packages的地址
  ```
  registry=https://npm.pkg.github.com/OWNER
  //或者@OWNER:registry=https://npm.pkg.github.com
  ```

- 在`package.json`中添加`publishConfig`
  ```json
  "publishConfig": {
    "registry":"https://npm.pkg.github.com/"
  }
  ```

在完成上述步骤后，就是简单的`npm publish`，即可完成发布

# 安装使用

首先，仍然需要先进行授权（这个真不合理，别人要用放在GitHub Packages，必须要先申请帐号，再token等做一堆事...如果不是这个，真的推荐使用GitHub Packages来管理开源组织的包）

然后添加一个本地的`.npmrc`，与发布中的一样

```
registry=https://npm.pkg.github.com/OWNER
//或者@OWNER:registry=https://npm.pkg.github.com
```

完成上述步骤后，就可以使用了`npm install`
