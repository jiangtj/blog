---
title: 简单、高效的管理hexo站点主题
date: 2018-10-15
updated: 2018-10-15
categories: [前端]
tags: [Hexo,CI]
---
如果您和我一样，喜欢更新至最新的主题，那么您也应该遇到和我一样的烦恼。每次更新新的主题时，总是要重新配置，而且随着自定义的内容增多，更新就成了负担。   

因此，引入了Fork与Submodules来实现以下目标
1. 自动合并自定义内容与配置
2. 校验更新操作是否正常工作

> 如果您不了解如何使用hexo搭建博客，您可以参考这篇博客：<https://www.dnocm.com/articles/almond/gitlab-pages-for-hexo/>

<!-- more -->

# GitHub Fork
Fork，一般用在贡献开源项目时（这里由于需要对主题配置做修改）。  
1. 找到您喜欢的主题的开源项目，并点击fork，派生该项目至您自己的远程仓库
{% img /images/md/almond/github-fork.png github-fork %}
2. 创建新的分支例如custom，并在新分支上调整您的配置

完成上述步骤后，以后每次合并新的功能仅仅是将主题的改动合并到自己的远程仓库，然后合并到分支上即可。避免了每次做同样的修改操作

# Git Submodules
通过fork，我们得到了想要的主题，但如何使用呢？通常的做法是下载主题到hexo博客项目中，测试并部署。然后，Git合并并不能保证永远完美的工作，如果出现问题，就需要修改主题项目，重新下载放入hexo工程，在运行测试。这过程是复杂的    
事实上，Git已经针对这种依赖另一个独立的Git仓库情况作了调整，来解决复杂项目管理问题，而这种方式是Submodules子模块    
> Git 通过子模块来解决这个问题。 子模块允许你将一个 Git 仓库作为另一个 Git 仓库的子目录。 它能让你将另一个仓库克隆到自己的项目中，同时还保持提交的独立。  ---ProGit(中文版)    


1. 添加您的子模块
```bash
git submodule add <remote-url> <local-path>
```
2. 进去您的字模块，切换到自定义分支，其他操作，就像普通的Git项目一样  


如果您使用vs code，那么在侧边栏Git里，可以很方便的可视化管理子模块
{% img /images/md/almond/sub-vs.png 300 sub-vs %}

这样之后，您的更新操作，也变得足够简单，基本自定义的配置错了，也可以直接对子模块做修改并提交

# GitLab CI
在gitlab ci中需要针对子模块做额外的配置，将`GIT_SUBMODULE_STRATEGY`变量改为`normal`或者`recursive`
```yml
variables:
  GIT_SUBMODULE_STRATEGY: recursive
```

# npm依赖更新
除了主题外还有hexo相关脚本需要更新。事实上，我们很难知道哪些脚本发布了新版本，这和npm更新机制有很大关系，如果在版本号前添加了`^`那么npm会下载兼容的最新版本包（除非存在`package.lock`或者`yarn.loc`），比如`^1.0.0`，如果存在`1.0.1`版本，那么你下载下来的是后者。。。    

关于依赖的管理，通过GitHub市场中的[依赖管理工具](https://github.com/marketplace/category/dependency-management)会是个不错的办法，比如我所使用的[dependabot](https://github.com/marketplace/dependabot)，它会帮助我检测最新的依赖，并更新它（提交PR），我做的事就只剩Merge了。    

这里就存在另一个问题，怎么测试PR是否正常运行。一个方式是本地部署PR分支测试，但大部分情况下都不会出问题，这就比较耗时了。这里我使用[Netlify](https://www.netlify.com/)PR预览功能，协助我测试（我最近已经将托管服务迁移到它上了，如果使用GitLab做托管，那么你可能需要做双向镜像，以便GitLab与GitHub之间的代码库保持一致）。   

# 参考
1. [GitHub - 对项目做出贡献](https://git-scm.com/book/zh/v2/GitHub-%E5%AF%B9%E9%A1%B9%E7%9B%AE%E5%81%9A%E5%87%BA%E8%B4%A1%E7%8C%AE)
2. [Git 工具 - 子模块](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97)
3. [Using Git submodules with GitLab CI](https://docs.gitlab.com/ee/ci/git_submodules.html#using-git-submodules-in-your-ci-jobs)

