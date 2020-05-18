---
title: Spring Boot使用GitLab CI自动部署
date: 2018-4-23
updated: 2018-4-23
categories: [后端]
tags: [Java,Shell,CI]
---
# 定义场景
spring boot应用在手动部署过程中主要分为两步，打包编译与上传部署（也可能存在测试环境，但由于该项目目前只有我开发，并未写测试用例）。同样的在gitlab-ci文件中也定义相应的两步骤
```yml
stages:
  - build
  - deploy
```
<!-- more -->

# 编译
使用GitLab公共CI服务为Spring Boot打包编译。image定义所使用的docker镜像，stage指定场景，script打包脚本（跳过测试阶段），artifacts定义需要归档的文件，only指定仅release分支打包（支持正则表达式）
```yml
release-build:
  image: maven:3.5.2-jdk-8
  stage: build
  script: "mvn package -B -Dmaven.test.skip=true"
  artifacts:
    paths:
      - target/bill-server.jar
  only:
    - /^release-.*$/
```

# 部署
配置文件的结构与编译的基本一直，这里使用ubuntu镜像，如果您使用的yam请替换相应的命令。如果您使用自己的CI Runner(shell)，建议密钥存放在自己的服务器上，手动配置实现对部署服务器的ssh访问
```yml
release-deploy:
  image: ubuntu
  stage: deploy
  script:

    - 'which ssh-agent || ( apt-get update -y && apt-get install openssh-client git -y )'
    - eval $(ssh-agent -s)
    ##
    ## Add the SSH key stored in SSH_PRIVATE_KEY variable to the agent store
    ## We're using tr to fix line endings which makes ed25519 keys work
    ## without extra base64 encoding.
    ## https://gitlab.com/gitlab-examples/ssh-private-key/issues/1#note_48526556
    ##
    # Generate the private/public key pair using:
    #
    #     ssh-keygen -f deploy_key -N ""
    #
    # then set the $SSH_PRIVATE_KEY environment variable in the CI (Travis-CI,
    # GitLab-CI, ...) to the base64 encoded private key:
    #
    #     cat deploy_key | base64 -w0
    #
    # and add the public key `deploy_key.pub` into the target git repository (with
    # write permissions).
    - ssh-add <(echo "$SSH_PRIVATE_KEY" | base64 --decode)

    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh

    - ssh-keyscan 119.28.1.107 >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
    - scp target/bill-server.jar ubuntu@119.28.1.107:bill
    - ssh ubuntu@119.28.1.107 "cd bill; sh bill-start.sh"

  only:
    - /^release-.*$/
```
其中shell脚本，与我的[另一篇博客](https://www.dnocm.com/articles/almond/spring-boot-autorun-with-gitlab/)类似，稍做修改就行

# 参考文档
- [GitLab CI Document](https://docs.gitlab.com/ee/ci/)
- [bill-server example](https://gitlab.com/dream-room/bill-server/blob/master/.gitlab-ci.yml)
