---
title: Git工作流
date: 2018-05-02
updated: 2018-05-02
categories: [团队]
tags: [Git]
---

选择Git工作流，和如何配合工作流工作，这是软件行业经常碰到的问题。不同的Leader会有不同方案，有好有坏。当然能应用进实际开发中的流程，只要实际操作人员足够的仔细便不会出现问题，例如最常用的[Vincent Driessen提出的Git工作流](http://nvie.com/posts/a-successful-git-branching-model/)。     

接下来，将介绍这个Git工作流，以及它所衍生出来的其它不错的工作流（GitHub Flow与GitLab Flow）    

![](https://nvie.com/img/git-model@2x.png)   

<!-- more -->

# Git Flow By Vincent Driessen

如上图，它包含了全部的流程内容，一个由两个主分支develop和master以及三个支持分支hot-fix、feature、release组成的工作流。我们每次功能开发以develop分支为主，从它这里拉出feature分支，当完成时合并回develop，如下图     
![](https://nvie.com/img/fb@2x.png)   

当开发完成，将develop发布到一release分支上进行测试以及bug修复。测试通过后将release分支的代码合并到master，作为一版本发布    
![](https://nvie.com/img/main-branches@2x.png)

线上问题，是常见的情况，无论是谁都不可能保证自己的代码不出问题。这时需要从master的tags（一般每次版本发布都需打上tags）中拉出修复分支hot-fix，修复并测试该问题。当完成后，须将此次更新同时合并到master和develop    
![](https://nvie.com/img/hotfix-branches@2x.png)

Vincent Driessen作为首个Git成功模型的提出者，值得敬佩。后来的许多分支管理流程或多或少都有参照他的设计。    

# 简化：GitHub Flow
GitHub Flow也是个‘非常常用’的分支管理流程，一般它只在开源项目中使用。它是个十分轻量的分支管理流程，去掉了诸如hot-fix、release、develop分支，仅仅保留了master与feature，当然这里的feature也可当作hot-fix分支     
![](https://jiangtj.github.io/assets/img/others/github-flow.png)   

如图，当我们需要进行开发或者修复bug时，我们首先从master拉出一个feature/hot-fix分支，当完成开发，接下来是测试与讨论，并持续改进，当完善后，将该部分代码合并入master。至此，一个功能或者一个Bug修复开发完成了。相对Git Flow，减少了许多分支，可以让开发者更专注于功能的开发，同时也减少了不同分支间切换出错的概率。当然，也导致了分支间的定义不够，如遇到需要版本的情况，该怎么定义版本分支，遇到企业内部的测试环境，又该怎么区分呢？     

# 演进：GitLab Flow
GitLab Flow是基于GitHub Flow提出的，它的目的是为了解决上述企业中可能遇到的问题，同时保持足够的简化。GitLab Flow在实施过程中，十分重视上游优先的原则。一般情况下，只允许将上游的分支的代码部署到下游。

## Production branch
GitLab Flow总共提出了三种场景下分别使用不同的分支模型，最简单的是产品分支模型。它与GitHub Flow唯一的不同，仅多了一个production分支，当我们觉得master上的代码足够成熟，将代码合并到production上。在这个模型中master属于production的上游分支，所有的更改只在master上修改。当完善后拉到production上。     
![](https://docs.gitlab.com/ee/workflow/production_branch.png)

## Environment branches
之前，就提问过，遇到测试环境怎么办？这时候我们需要引入环境分支，例如pre-production分支进行测试。它的模型结构与Production branch基本一致，不详说     
![](https://docs.gitlab.com/ee/workflow/environment_branches.png)

## Release branches
Release branches是GitLab提出的第三种分支模型，它适用于您需要将产品发布到外部的情况。它与Environment branches模型不同，它使用版本的分支代替了production分支。当然，一个项目中可能存在多个版本分支，这取决于您维护的版本数。     
![](https://docs.gitlab.com/ee/workflow/release_branches.png)    
就我而言，比较喜欢Release branches，因为比较喜欢[语义化版本](https://semver.org/lang/zh-CN/)   

## 技巧
- Q:如果同时有多个更新在master上，其中一个较为紧急，怎么优先发布（或者存在一个Bug修复，如何合并到维护的release分支）？
- A:可以使用git cherry-picked拉取某次提交到指定分支

# 参考文献
[Git Flow By Vincent Driessen](https://nvie.com/posts/a-successful-git-branching-model/)    
[GitHub Flow](https://guides.github.com/introduction/flow/)    
[GitLab Flow](https://docs.gitlab.com/ee/workflow/gitlab_flow.html)    

