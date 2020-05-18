---
title: 探究：优惠券的设计
categories: [架构]
tags: [优惠券,设计]
date: 2019-11-05 14:15:10
updated: 2019-11-05 14:15:10
description: 优惠券一直都是系统中较为复杂的部分，往往设计多个模块（支付、活动、用户等等），将从架构设计角度展开，设计一种合理的架构
---

最近几天，和朋友讨论了许多优惠券相关的问题，他以产品的角度，探究优惠券的意义场景等。他阐释，优惠券的本质是价格歧视，通过对不同消费者提供不同的收费标准，以此来增加营收。

当然，从我的角度出发（程序猿），我并不关心优惠券的目的，而更感兴趣于架构的设计，毕竟这块很有挑战性。比如满减或者折扣等涉及支付系统，用户领取使用又涉及用户系统等等（这里假设在微服务架构下）通常优惠券会影响多个系统，除此外，优惠规则与限制条件又十分复杂。但越难才越有意思。

我初步将优惠券系统分为以下四个部分：

- 优惠券主体，简单说定义名称或者一些说明之类
- 优惠策略，定义处理优惠的方式
- 限制规则，在这部分中定义什么条件下可使用或者“过期”
- 发放策略，定义何时如何发放，一般情况下与用户和活动系统相关

为了实现一个我理想中的优惠券系统

- 支持多张券同时使用
- 支持各种限制，甚至自定义限制
- 尽可能的降低各个系统与优惠券系统的耦合性

<!-- more -->

![](https://jiangtj-lab.github.io/pic-repo/img-apricot/20191106145354.png)

*发放策略与其他系统紧密相关，暂时未设计数据结构*

# 优惠券主体

这部分是优惠券的一些共同的信息，一般在查询展示时用到。所以前期比较简单，但后期如果需要对优惠券美化时，就需要扩展这部分来支持

建议创建后不允许修改优惠券，为后续订单追溯优惠提供可能

# 优惠策略

优惠的策略与主体间是1对1的关系（一张优惠券一种优惠方式），理论上这部分可以和主体存放在一张表内

优惠策略的关键在于handler处理器，所有的优惠策略处理器都需要继承优惠处理器相关的接口，例如java版如下（其他语言应该也能有类似的功能把）

```java
public interface DiscountHandler {
    String name();
    default BigDecimal handle(BigDecimal price, String args) {
        return price;
    }
    default int order() {
        return 0;
    }
}
```

比如满减与折扣策略的实现可以如下

```java
public class SubtractDiscountHandler implements DiscountHandler {
    @Override
    public String name() {
        return "立减";
    }
    @Override
    public BigDecimal handle(BigDecimal price, String args) {
        return price.subtract(new BigDecimal(args));
    }
}
public class MultiplyDiscountHandler implements DiscountHandler {
    @Override
    public String name() {
        return "折扣";
    }
    @Override
    public BigDecimal handle(BigDecimal price, String args) {
        return price.multiply(new BigDecimal(args));
    }
    @Override
    public int order() {
        return 1;
    }
}
```

其中，name用于记录处理器的名称，spring可以获取所有DiscountHandler的实例，我们处理后，作为选择列表供用户选择，使用哪个处理器

args在不同处理器时，具有不同的含义，在SubtractDiscountHandler下，填1，表示立减1元，MultiplyDiscountHandler下填0.9，表示打9折

当用户选择优惠券(多张)后，获取选择的优惠券的处理器并依据order排序，依次处理价格(一般情况我们会把折扣放在后面处理，减少总的优惠额)

# 限制规则

限制规则与优惠策略处理的方式是一样的，不同点在于优惠券主体与限制规则是1对多的关系。

限制规则的handler也与优惠券有点区别，大致如下

```java
@Data
public class LimitHandlerContext {
    private Object coupon;
    private List<Object> selectedCoupons;
    private Object params;
}
public interface LimitHandler {
    String name();
    default boolean handle(LimitHandlerContext context, String args) {
        return true;
    }
    default int order() {
        return 0;
    }
}
```

与优惠策略不同，不在传递与处理价格，而是传入LimitHandlerContext容器，由此判断是否拦截（false：拦截，true：通过）
- coupon：指当前触发限制规则的优惠券
- selectedCoupons：指全部已选择的优惠券
- params：额外参数，有业务系统决定比如传递类型等

比如，下面是一些限制规则实例

> TBD

# 发放策略

发放策略在优惠券部分的逻辑其实只是添加一条用户领取的记录，但其难在何时如何领取优惠券。所以，总结一下就是
1. 优惠券系统需要暴露API给外部系统调用，以生成用户的优惠券领取记录
2. 在外部系统（比如活动系统），制定其领取规则

那么接下来简单说下活动系统的实现思路（尽管我认为它已经不属于优惠券系统了）

> TBD

*注：为了降低系统间的耦合性，这部分可以使用发布订阅模式*
