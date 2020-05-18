---
title: Aria2 一个轻量级的命令行下载工具
date: 2018-6-5
updated: 2018-6-5
categories: [工具]
---

aria2 是一个轻量级的、多源、跨平台的命令行下载实用工具。它支持HTTP/HTTPS、FTP、SFTP、BitTorrent和Metalink。       
我们可以在GitHub上下载最新的[稳定版](https://github.com/aria2/aria2/releases)     

<!-- more -->

# 特点
- Multi-Connection Download. aria2 can download a file from multiple sources/protocols and tries to utilize your maximum download bandwidth. Really speeds up your download experience.
- 多线程连接下载，最大限度的利用您的宽带

- Lightweight. aria2 doesn’t require much memory and CPU time. When disk cache is off, the physical memory usage is typically 4MiB (normal HTTP/FTP downloads) to 9MiB (BitTorrent downloads). CPU usage in BitTorrent with download speed of 2.8MiB/sec is around 6%.
- 轻量级，不需要太多的内存与cpu资源

- Fully Featured BitTorrent Client. All features you want in BitTorrent client are available: DHT, PEX, Encryption, Magnet URI, Web-Seeding, Selective Downloads, Local Peer Discovery and UDP tracker.
- 支持所有的BitTorrent的客户端特性

- Metalink Enabled. aria2 supports The Metalink Download Description Format (aka Metalink v4), Metalink version 3 and Metalink/HTTP. Metalink offers the file verification, HTTP/FTP/SFTP/BitTorrent integration and the various configurations for language, location, OS, etc.
- 支持Metalink

- Remote Control. aria2 supports RPC interface to control the aria2 process. The supported interfaces are JSON-RPC (over HTTP and WebSocket) and XML-RPC.
- 支持远程控制下载

# 如何使用

*建议添加aria2所在目录到系统path中，方便在任意位置使用aria2c命令*     

1. 从网上下载文件:
```bash
$ aria2c http://example.org/mylinux.iso
```
2. 同时下载多个文件
```bash
$ aria2c http://a/f.iso ftp://b/f.iso
```
3. 使用两个连接下载
```bash
$ aria2c -x 2 http://a/f.iso
```
4. 使用BitTorrent下载
```bash
$ aria2c http://example.org/mylinux.torrent
```
5. 使用BitTorrent Magnet URI下载:
```bash
$ aria2c 'magnet:?xt=urn:btih:248D0A1CD08284299DE78D5C1ED359BB46717D8C'
```
6. 下载文本中的连接
```bash
$ aria2c -i uris.txt
```
7. 修改名称与路径
```bash
$ aria2c http://example.org/a.txt -o b.txt -d your-dir
```

# UI 框架
- [webui-aria2](https://github.com/ziahamza/webui-aria2): 一个网页端的aria2实现
- [persepolis](https://github.com/persepolisdm/persepolis): 一个python写的aria2的客户端

# 参考
- [aria2 docs](https://aria2.github.io/)
