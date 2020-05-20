---
title: VPN教程 - Shadowsocks
date: '2019-01-01'
updated: 2020-05-20
comments: true
---


# Wikipedia

Shadowsocks可以指：一种基于Socks5代理方式的加密传输协议，也可以指实现这个协议的各种传输包。目前包使用Python、C、C++、C#、Go语言等编程语言开发，大部分主要实现（iOS平台的除外）采用Apache许可证、GPL、MIT许可证等多种自由软件许可协议开放源代码。Shadowsocks分为服务器端和客户端，在使用之前，需要先将服务器端部署到服务器上面，然后通过客户端连接并创建本地代理。

目前Shadowsocks有多个实现支持，以自由软件形式发布的主要有原始Shadowsocks（以Python语言编写）、Shadowsocks-libev（分支项目openwrt-Shadowsocks）、Shadowsocks-rust、Shadowsocks-go/go-Shadowsocks2、libQtShadowsocks、Shadowsocks-qt5（仅作为客户端）、Shadowsocks-android（仅作为客户端）、Shadowsocks-windows（仅作为客户端）、ShadowsocksX-NG（仅作为客户端）、Outline、V2Ray、Brook等等，还有为数甚多的免费软件及专有软件（多数是iOS上运行的，如shadowrocket、Surge等）。

<!-- more -->

# 服务端

## Outline Manage
最简单的方式是通过Outline Manage配置，可在[Outline的GitHub](https://github.com/Jigsaw-Code/outline-server/)上下载，选择`Set up Outline anywhere`，在linux上运行步骤一的脚本
```bash
bash -c "$(wget -qO- https://raw.githubusercontent.com/Jigsaw-Code/outline-server/master/src/server_manager/install_scripts/install_server.sh)"
```
将您linux上安装输出信息放入步骤二的输入框内，接下来添加key，复制key中的密钥`ss://xxxxxx?outline=1`至您的客户端即可
其他方式见下面

## shadowsocks-libev
本文使用Ubuntu16.04，其他版本可查看官方文档<https://github.com/shadowsocks/shadowsocks-libev>
### 安装
执行以下命令，从PPA源安装shadowsocks-libev，shadowsocks-libev是纯C实现的Shadowsocks服务端，相对于Python，有更好的性能
```bash
sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:max-c-lv/shadowsocks-libev -y
sudo apt-get update
sudo apt install shadowsocks-libev
```

### 运行
shadowsocks-libev需要修改配置文件
```bash
# Edit the configuration file
sudo vim /etc/shadowsocks-libev/config.json
# Edit the default configuration for debian
sudo vim /etc/default/shadowsocks-libev
```
参考配置
```json
{
    "server":"my_server_ip",
    "server_port":8388,
    "local_port":1080,
    "password":"barfoo!",
    "timeout":600,
    "method":"chacha20-ietf-poly1305"
}
```
通过命令行运行
```bash
# Start the service
sudo /etc/init.d/shadowsocks-libev start    # for sysvinit, or
sudo systemctl start shadowsocks-libev      # for systemd
```

## Python
您可以安装Python的shadowsocks，centos或者其他看这里<https://github.com/shadowsocksr-backup/shadowsocksr>
### 安装
```bash
sudo apt-get install python-pip
sudo pip install shadowsocks
```
### 运行
基于Python的shadowsocks运行
```bash
# Example
sudo ssserver -k password --user nobody -d start
# See help
sudo ssserver --help
```

## 其他
建议开启`fastopen`,修改`/etc/sysctl.conf`文件中的`net.ipv4.tcp_fastopen = 3`
其他高级配置，可在翻墙后访问<https://shadowsocks.org/en/config/advanced.html>

# 客户端
由于商店无法进入，可以在GitHub上下载，客户端推荐shadowsocks，因为outline目前只能全局代理
- shadowsocks-windows: <https://github.com/shadowsocks/shadowsocks-windows>
- shadowsocks-android: <https://github.com/shadowsocks/shadowsocks-android>

Or
- outline: <https://github.com/Jigsaw-Code/outline-client/>

# 其他VPN

## L2TP
执行脚本一键安装运行：<https://github.com/hwdsl2/setup-ipsec-vpn>，shadowsocks也有类似的[脚本](https://freed.ga/github/shadowsocksR.sh)([相关教程](https://www.qcgzxw.cn/1640.html))，但下载下来是乱码，反正我不放心。。。
L2TP相对于shadowsocks来说，系统支持较好（可能部分系统如MIUI10，连接后会自动断开，我是被这个原因逼到shadowsocks的），无需安装第三方客户端，但也因此只有全局代理

> 这篇文章长期更新，推荐的是我正在使用的VPN，其他VPN中是以前使用过的
