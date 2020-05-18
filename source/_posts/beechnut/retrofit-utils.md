---
title: 一个简单的retrofit工具类
categories: [后端]
tags: [Java,Retrofit]
date: 2019-09-06 11:51:17
updated: 2019-09-06 11:51:17
---

# 使用

```java
// 同步返回Optional<T>
var repos = RetrofitUtils.execute(service.listRepos("octocat")).orElse(new ArrayList<>());
// 异步
RetrofitUtils.execute(service.listRepos("octocat"), repos -> {
  //业务逻辑
});
```

<!-- more -->

# Gist

<script src="https://gist.github.com/jiangtj/9ced3e62e8b5668a7e5a40b23a6f121d.js"></script>

- 如果无法查看，可到知乎查看：https://zhuanlan.zhihu.com/p/81420563
- 需要安装lombok依赖，或者修改日志方法（log）
