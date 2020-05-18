---
title: 利用Jmeter进行压力测试
date: 2018-5-15
updated: 2018-5-15
categories: [工具]
tags: [Jmeter,压力测试]
---

压力测试（Stress Test），也称为强度测试、负载测试。压力测试是模拟实际应用的软硬件环境及用户使用过程的系统负荷，长时间或超大负荷地运行测试软件，来测试被测系统的性能、可靠性、稳定性等。目前互联网的环境下，压力测试是必不可少的，其中Apache JMeter是目前主流的开源的压力测试工具。

Apache JMeter是Apache组织开发的基于Java的压力测试工具。用于对软件做压力测试，它最初被设计用于Web应用测试，但后来扩展到其他测试领域。 它可以用于测试静态和动态资源，例如静态文件、Java 小服务程序、CGI 脚本、Java 对象、数据库、FTP 服务器， 等等。JMeter 可以用于对服务器、网络或对象模拟巨大的负载，来自不同压力类别下测试它们的强度和分析整体性能。另外，JMeter能够对应用程序做功能/回归测试，通过创建带有断言的脚本来验证你的程序返回了你期望的结果。为了最大限度的灵活性，JMeter允许使用正则表达式创建断言。

<!-- more -->

# 开始

## 下载
Jmeter可以在官网<https://jmeter.apache.org/download_jmeter.cgi>直接下载编译过的文件    
```bash
wget http://mirrors.shu.edu.cn/apache/jmeter/binaries/apache-jmeter-4.0.zip -O jmeter.zip
```
## 配置
下载好后解压，并修改配置文件，使其启动时默认使用中文语言     
${jmeter-dir}/bin/jmeter.properties 37行左右      
```properties
#Preferred GUI language. Comment out to use the JVM default locale's language.
language=zh_CN
```

## 运行
Windows下双击jmeter.bat启动，Linux或者其他用相应的脚本启动

# 测试计划

jmeter可以自定义测试计划，比较常用的有线程组（用户组）、线程（用户）、控制器、定时器和监听器等

## 线程组
一般都需要定义一组用户，用于模拟多用户并发请求    
![](https://jiangtj.github.io/assets/img/others/jmeter/u1.png)    
如图，定义了500用户，依次在30s内递增    
![](https://jiangtj.github.io/assets/img/others/jmeter/u2.png)   

## 线程
线程组内定义工作内容，或者一些通用的环境等    
例如添加公共的默认请求信息    
![](https://jiangtj.github.io/assets/img/others/jmeter/h1.png)   
添加一个循环逻辑    
![](https://jiangtj.github.io/assets/img/others/jmeter/l.png)   
添加一个Http请求    
![](https://jiangtj.github.io/assets/img/others/jmeter/q1.png)   

## 监听器
监听器用于获取执行情况，生成或者计算相应的数据    
例如添加响应时间的报表     
![](https://jiangtj.github.io/assets/img/others/jmeter/r1.png)  


# 测试结果
编写了一个jmeter脚本对我服务器上的两个web服务进行了压力测试，一个为webmvc，一个为webflux。由于机器的性能实在有限，出现了很多连接超时，但也有惊喜    

我模拟在30s内启动500个用户请求服务，每个用户请求30次中间间隔随机1-2s

## WebMVC

webmvc 在并发请求上去后，貌似服务崩了，以至于后面的请求都未完成，我在半个小时后再次访问web服务，仍然无响应。而从结果来看，数据库服务也被挤下去。   

![](https://jiangtj.github.io/assets/img/others/jmeter/mvc1.png)   
![](https://jiangtj.github.io/assets/img/others/jmeter/mvc2.png)   
![](https://jiangtj.github.io/assets/img/others/jmeter/mvc3.png)   

## WebFlux

webflux 在并发方面带给我一些惊喜，500的并发对于1核1G1M的机器来说，实在的太勉强了（还跑着数据库），测试过程中也出现了较多的连接超时，但是，服务一直保持可用。也查看过CPU，在连接超时的时间，CPU已经被占满。应该是无法处理导致直接不接收相应的请求。这也导致测试完成后，服务一直保持正常，访问返回了正确结果。

![](https://jiangtj.github.io/assets/img/others/jmeter/flux1.png)   
![](https://jiangtj.github.io/assets/img/others/jmeter/flux2.png)   

# 插件

## MQTT

jmeter还有许多插件，扩展它所支持的环境，例如MQTT插件<https://github.com/emqtt/mqtt-jmeter>，可用来测试MQTT服务，MQTT服务作为物联网的重要组测部分，能进行压力测试可以做到更好的评估。


