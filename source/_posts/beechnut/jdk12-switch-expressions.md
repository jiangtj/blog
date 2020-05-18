---
title: JDK12 新特性 switch expressions （预览）
categories: [后端]
tags: [Java]
date: 2019-08-19 12:49:41
updated: 2019-08-19 12:49:41
description:
---

switch expressions 这个新特性蛮有意思的，在部分情况下能减少我们的代码量，尤其在工厂模式下，会很简单

<!-- more -->

例如，一个支付服务，我们通常的实现如下

```java
@Service
public interface PayService {
    Result pay();
}
@Service
public class AliService implements PayService {
    @Override
    public Result pay() {
        return Result.of("success", "Paying by Ali!");
    }
}
@Service
public class WechatService implements PayService {
    @Override
    public Result pay() {
        return Result.of("success", "Paying by Wechat!");
    }
}
```

抽象出支付对象，同时有多个实现，如果我们需要通过编号获取对应的支付服务实现，可以通过以下工厂获取

```java
public PayService get(String no) {
  switch (no) {
    case "wechat": return wechatService;
    case "ali": return aliService;
    default: return null;
  }
}
```

改编成switch expressions，语法上会更简单，将会像下面一样

```java
public PayService get(String no) {
  return switch (no) {
    case "wechat" -> wechatService;
    case "ali" -> aliService;
    default -> null;
  };
}
```

如果使用完整的代码块写的话，需要像下面那样编写

```java
public PayService get(String no) {
  return switch (no) {
    case "wechat" -> wechatService;
    case "ali" -> {
      break aliService;
    }
    default -> null;
  };
}
```

加括号和break后返回值，预览的特性不是很稳定，上面的写法是jdk12，在jdk13中JEP 354取代JEP 325，对这部分进行的修改，添加了yield关键字进行返回，同时要求你使用switch expressions时，必须穷尽所有情况返回预期值以及不能有跳出switch的操作（return、continue等等）

```java
public PayService get(String no) {
  return switch (no) {
    case "wechat" -> wechatService;
    case "ali" -> {
      yield aliService;
    }
    default:
      yield null;
  };
}
```

> 毕竟是预览特性，十分不稳定，就目前来看，添加关键字为了一点点的简写，有点得不偿失吧

[Example Source](https://github.com/jiangtj-lab/jdk12-switch-expressions)
