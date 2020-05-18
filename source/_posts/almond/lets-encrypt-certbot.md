---
title: Certbot 为你的HTTP服务加一层SSL协议
date: 2018-04-27
updated: 2018-04-27
categories: [运维]
---

谷歌Chrome安全产品经理艾米丽·谢克特（Emily Schechter）发表博文，证实当该公司在7月发布Chrome 68浏览器时，该浏览器将把所有未采用HTTPS（安全套接字层超文本传输协议）加密的网站都标记为“不安全”网站。    

Chrome作为浏览器界的巨头，做出如此的决定，将极大的推进HTTPS的进程，我们自然也应该跟进，一同建立更安全的网络环境。但一般证书都是较为昂贵的，因此互联网安全研究小组Internet Security Research Group(ISRG)以及Linux基金会等，提供了公益的项目，用于加速HTTPS的发展    

<!-- more -->

# 概念

## HTTPS
HTTPS（全称：Hyper Text Transfer Protocol over Secure Socket Layer），是以安全为目标的HTTP通道，简单讲是HTTP的安全版。即HTTP下加入SSL层，HTTPS的安全基础是SSL，因此加密的详细内容就需要SSL。 它是一个URI scheme（抽象标识符体系），句法类同http:体系。用于安全的HTTP数据传输。https:URL表明它使用了HTTP，但HTTPS存在不同于HTTP的默认端口及一个加密/身份验证层（在HTTP与TCP之间）。

## Let’s Encrypt
Let’s Encrypt是一个公益的，免费的，自动化的和开源的证书颁发机构(CA)。是由互联网安全研究小组(ISRG)提供的服务。

## Certbot
Certbot是一个简单易用的工具，它能为您的Web服务器获取和部署SSL/TLS证书。Certbot是EFF和其他公司为Let’s Encrypt提供的客户端。在之前，它被称为“官方的Let’s Encrypt客户端”或“Let’s Encrypt 的Python客户端”。Certbot同样支持其他的支持ACME协议的证书颁发机构。

# 配置

## 安装
可以在官网<https://certbot.eff.org/>上获取其安装文档，由于我服务端是Ubuntu16.04，同时以安装Nginx，所以选择了与此相应的安装文档。
```bash
$ sudo apt-get update
$ sudo apt-get install software-properties-common
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt-get update
$ sudo apt-get install python-certbot-nginx 
```
Ubuntu上一般通过apt-get包管理工具安装。

## 开始
Certbot 有支持多环境的Nginx插件
```bash
$ sudo certbot --nginx
```
接下来是一些列问答式的配置，安装要求，或者自己的需求填写好    
之后，我们可以发现网站已经可以通过https访问了

## Nginx代理
Certbot 的Nginx配置在`/etc/nginx/sites-enabled/default`中，我们可以找到配置的网站
```
server {
    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    server_name x.j-time.cn; # managed by Certbot

                
    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to displaying a 404.
        try_files $uri $uri/ =404;
    }

    location /bill-server/ {
         proxy_pass  http://localhost:8689/;
    }

    ## ...

}
```
在这之中，我可以实现我们自己的代理，例如简单的转发到本地一个服务上
```bash
$ sudo service nginx restart
```
重新Nginx服务

## 重新获取证书

证书都是有有效期的，我们需要在有效期内重新获取更新证书，Let’s Encrypt的证书有效期为3个月。所以我们需要通过Certbot工具自动的更新证书
```bash
$ sudo certbot renew --dry-run
```

# 校验

打开配置好的地址<https://x.j-time.cn/>，能正常的通过https访问了，同时谷歌、火狐等浏览器，也将此站点标记为了安全站点

# 更多细节

[Certbot Documentation](https://certbot.eff.org/docs/index.html)

