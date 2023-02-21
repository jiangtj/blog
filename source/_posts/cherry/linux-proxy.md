---
title: linux 代理
categories: [运维]
tags: []
date: 2023-02-21 16:32:26
updated: 2023-02-21 16:32:26
description:
---

# env

```bash
export http_proxy=http://192.168.1.20:7890
export https_proxy=http://192.168.1.20:7890
```

# profile

在 `~/.profile` 持久化当前用户的代理，全局在 `/etc/profile`

```bash
export http_proxy=http://192.168.1.20:7890
export https_proxy=http://192.168.1.20:7890
```

# wget

修改 `~/.wgetrc` 创建 `wget` 代理
```bash
#You can set the default proxies for Wget to use for http, https, and ftp.
# They will override the value in the environment.
https_proxy = http://192.168.1.20:7890
http_proxy = http://192.168.1.20:7890
ftp_proxy = http://192.168.1.20:7890

# If you do not want to use proxy at all, set this to off.
use_proxy = on
```
