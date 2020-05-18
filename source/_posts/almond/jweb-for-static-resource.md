---
title: JWeb 简单的方式部署静态资源
date: 2018-05-31
updated: 2018-05-31
categories: [后端]
tags: [Java,Web,Shell]
---

JWeb 是一个基于Spring Boot的简单服务。提供Shell脚本，以简单的方式部署以及运行静态资源

# 缘
某天晚上睡不着，充电。突然脑抽了一下，node能做到命令行快速的运行静态资源，例如[docsify-cli](https://docsify.js.org/#/zh-cn/quickstart)，能通过`docsify serve your-static-dir`直接部署静态资源，于是我想的是，相似的功能，java也能实现的把    

直接部署静态资源，在开发过程中是很有必要的，例如测试跨域问题，您必须另外起个服务。如果是下载web服务器，并将资源拖拽过去的方式，就有点麻烦咯

<!-- more -->

# Java服务
java随着spring boot的出现，开发变得越来越简单，而spring boot正好提供了命令行的方式运行web服务。通过翻阅相关的文档，也发现spring boot中配置文件可以设置本地路径，例如`file:/mnt/c/111/`设置为c盘111文件夹（win10 bash）。所以java服务是基于spring boot的简单的服务      

## 创建项目
您可以在[Spring官网](https://start.spring.io/)上下载基本的骨架，当然也可以通过idea等工具下载。一般来说添加以下依赖就够了，但如果您还有其他需求，例如和spring cloud配合，请引入相关的依赖     
```maven
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
```

## 添加路由
由于spring boot默认需要`index.html`才能访问静态资源首页，这是我们不希望的，添加一个路径，将`/`跳转至index.html。如下修改`JwebApplication.class`     
```java
@Controller
@SpringBootApplication
public class JwebApplication {

    public static void main(String[] args) {
        SpringApplication.run(JwebApplication.class, args);
    }

    @RequestMapping("/")
    public String index(){
        return "index.html";
    }

}
```

至此，已经完成了java服务的创建，您可以使用命令行`java -jar xxx.jar --spring.resources.static-locations=file:your-static-dir`来部署您的静态资源了，但，这命令行是不是太长了...

# Shell脚本
shell脚本的目的是为了简化命令行而编写的，提供类似docsify-cli一样的命令     

目前的脚本如下：
```shell
#!/bin/sh

# export PATH=$PATH:your_dir
# Example: export PATH=$PATH:/mnt/c/Users/MrTT/IdeaProjects/jweb/scripts

# 需要openJDK
if ! hash java 2>/dev/null; then
  echo "I require java but it's not installed. Please install openJDK.";
  exit 1;
fi

# 获取脚本路径
script_path=`dirname $0`

# 修复环境
if [ ! -e ${script_path}"/jweb.jar" ]; then
  echo "Downloading jar ...";
  wget -O jweb.jar "https://gitlab.com/jiangtj/jweb/-/jobs/artifacts/release/raw/target/jweb.jar?job=build-release"
  mv jweb.jar ${script_path}
fi

# java_command
java_command="java -jar "${script_path}"/jweb.jar"

while getopts "c:p:w:" opt; do
  case ${opt} in
    c)
      config_dir=`readlink -f $OPTARG`
      java_command=${java_command}" --spring.config.additional-location=file:"${config_dir}
      ;;
    p)
      java_command=${java_command}" --server.port="$OPTARG
      ;;
    w)
      static_dir=`readlink -f $OPTARG`
      java_command=${java_command}" --spring.resources.static-locations=file:"${static_dir}
      ;;
    \?)
      echo "Please read docs !"
      ;;
  esac
done

# 运行
echo ${java_command}
${java_command}
```

实现几个功能点：    
1. 判断是否存在java环境
2. 自动下载基本的java服务（如果不存在的话）
3. 获取参数，拼接java命令，并执行

如果，将该shell脚本加载在path路径中，那么可以在任意位置通过命令行`jweb.sh -w your-static-dir`来部署静态资源    

# 项目

目前项目处在初步的设计阶段，后续会添加更多的参数，以及对java服务更多定制，以满足更多的情况    

[JWeb·GitLab](https://gitlab.com/JiangTJ/jweb)     
[JWeb·GitHub镜像](https://github.com/JiangTJ/jweb)     
[JWeb·Docs](https://jiangtj.gitlab.io/jweb)    


