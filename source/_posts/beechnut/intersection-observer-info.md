---
title: Intersection Observer 简介
categories: [前端]
tags: [Intersection Observer]
date: 2019-12-03 13:38:45
updated: 2019-12-03 13:38:45
description:
---

Intersection Observer API提供了一种异步观察目标元素与祖先元素或顶级文档viewport的交集中的变化的方法。这使得以往较难实现的功能，更加简单，例如，监听图片元素，在适当的时候懒加载图片。

<!-- more -->

# 例子

先看下，下面是一个简单的小例子

{% preview %}

<template>
<div id="e1" style="background-color:black;width:100%;height:500px;">
  <ul style="color:white;">
    <li>boundingClientRect:<span id="el-boundingClientRect"></span></li>
    <li>intersectionRatio:<span id="el-intersectionRatio"></span></li>
    <li>intersectionRect:<span id="el-intersectionRect"></span></li>
    <li>isIntersecting:<span id="el-isIntersecting"></span></li>
    <li>rootBounds:<span id="el-rootBounds"></span></li>
    <li>time:<span id="el-time"></span></li>
  </ul>
</div>
</template>

<script>
var observer = new IntersectionObserver((entries,observer) => {
  // 我只监听了一个对象
  let entry = entries[0]
  document.querySelector("#el-boundingClientRect").innerHTML = JSON.stringify(entry.boundingClientRect);
  document.querySelector("#el-intersectionRatio").innerHTML = JSON.stringify(entry.intersectionRatio);
  document.querySelector("#el-intersectionRect").innerHTML = JSON.stringify(entry.intersectionRect);
  document.querySelector("#el-isIntersecting").innerHTML = JSON.stringify(entry.isIntersecting);
  document.querySelector("#el-rootBounds").innerHTML = JSON.stringify(entry.rootBounds);
  document.querySelector("#el-time").innerHTML = JSON.stringify(entry.time);
  //document.querySelector("el-target").innerHTML = entry.target;
}, {
  threshold : [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
});
observer.observe(document.querySelector("#e1"));
</script>

{% endpreview %}

# 构造器

通过例子，我们可以看到Intersection Observer需要通过构造器来创建，即`new IntersectionObserver(callback[, options])`，参数有两部分组成，一个必传的回调函数以及一个可选的配置参数

## 回调Callback

Intersection Observer的翻译就是“交点观察”，因此，他的回调就成了重点。当观察元素与根元素之间的交叉状态发生变化时，它会将这部分信息反馈回来--通过回调告知

在回调函数里，我们会接受到两个对象，发生状态变化的元素集合以及监听者本身（注意：创建时，会将所有被观察元素的状态传递过来），监听者本身我们可以通过它增加或者减少监听的元素或者销毁自身（后续讲），这里我们更关注观察元素

```js
function callback(entries,observer) {
  entries -> 一系列被观察的元素
  observer -> 观察者
}
```

`entries` 是一个 `IntersectionObserverEntry` 对象的数组，`IntersectionObserverEntry` 包换以下元素（来自MDN）
- boundingClientRect: 返回包含目标元素的边界信息的DOMRectReadOnly. 边界的计算方式与 Element.getBoundingClientRect() 相同
- intersectionRatio: 返回intersectionRect 与 boundingClientRect 的比例值
- intersectionRect: 返回一个 DOMRectReadOnly 用来描述根和目标元素的相交区域
- isIntersecting: 返回一个布尔值, 如果目标元素与交叉区域观察者对象(intersection observer) 的根相交，则返回 true .如果返回 true, 则 IntersectionObserverEntry 描述了变换到交叉时的状态; 如果返回 false, 那么可以由此判断,变换是从交叉状态到非交叉状态
- rootBounds: 返回一个 DOMRectReadOnly 用来描述交叉区域观察者(intersection observer)中的根
- target: 与根出现相交区域改变的元素 (Element)
- time: 返回一个记录从 IntersectionObserver 的时间原点(time origin)到交叉被触发的时间的时间戳(DOMHighResTimeStamp)

具体的值是多少，我们可以在最上面的例子中看到，需要注意传递过来的对象都是只读（毕竟回调，只是通知你发生变化了）

## 参数options

我们可以通过 options 配置 IntersectionObserver，他包含以下几项配置
- root: 监听元素的祖先元素Element对象，其边界盒将被视作视口。目标在根的可见区域的的任何不可见部分都会被视为不可见。默认情况下文档视口会作为root
- rootMargin: 一个在计算交叉值时添加至根的边界盒(bounding_box)中的一组偏移量，类型为字符串(string) ，可以有效的缩小或扩大根的判定范围从而满足计算需要。语法大致和CSS 中的margin 属性等同。默认值是"0px 0px 0px 0px"。
- threshold: 规定了一个监听目标与边界盒交叉区域的比例值，可以是一个具体的数值或是一组0.0到1.0之间的数组。若指定值为0.0，则意味着监听元素即使与根有1像素交叉，此元素也会被视为可见. 若指定值为1.0，则意味着整个元素都交叉时视为可见。阈值的默认值为0.0。

在上面的例子中，我未修改root与rootMargin，你可以将浏览器的窗口作为可见区域，threshold定义了一系列数组，意味着到达那些交叉比时触发回调

# 属性

在创建或者回调函数中，我们可以得到 IntersectionObserver 对象，他包含以下属性：

- root: 所监听对象的具体祖先元素(element)。如果未传入值或值为null，则默认使用顶级文档的视窗
- rootMargin: 计算交叉时添加到根(root)边界盒bounding box的矩形偏移量， 可以有效的缩小或扩大根的判定范围从而满足计算需要。此属性返回的值可能与调用构造函数时指定的值不同，因此可能需要更改该值，以匹配内部要求。所有的偏移量均可用像素(pixel)(px)或百分比(percentage)(%)来表达, 默认值为"0px 0px 0px 0px"
- thresholds: 一个包含阈值的列表, 按升序排列, 列表中的每个阈值都是监听对象的交叉区域与边界区域的比率。当监听对象的任何阈值被越过时，都会生成一个通知(Notification)。如果构造器未传入值, 则默认值为0

IntersectionObserver 的属性也都是只读，他在创建之后不支持修改

# 方法

IntersectionObserver 通过以下方法添加或者取消监听元素
- IntersectionObserver.disconnect() 使IntersectionObserver对象停止监听工作。
- IntersectionObserver.observe() 使IntersectionObserver开始监听一个目标元素。
- IntersectionObserver.takeRecords() 返回所有观察目标的IntersectionObserverEntry对象数组。
- IntersectionObserver.unobserve() 使IntersectionObserver停止监听特定目标元素。

# 真实的例子

## 懒加载

IntersectionObserver 可以很简单的实现图片懒加载，开头就提到的，看下面很少的代码，我们就实现了懒加载的功能（目前已经好些图片懒加载框架使用它了，比如我的博客所使用的lozad.js）

{% preview %}

<template>
<img id="e2-lazy" load-url="/images/avatar.jpg" />
</template>

<script>
var observer = new IntersectionObserver((entries,observer) => {
  let entry = entries[0]
  if (entry.isIntersecting) {
    let el = entry.target;
    el.src = el.getAttribute('load-url');
    observer.disconnect();
  }
});
observer.observe(document.querySelector("#e2-lazy"));
</script>

{% endpreview %}

## TOC 自动定位

见我博客（Cake与NexT主题）的侧边栏，它使用的就是IntersectionObserver。不过在使用时，也遇到了些问题。比如，IntersectionObserver 在浏览器中的优先级不高（高效，必然也有缺陷），如果你很快的移动，可能无法触发

我们（NexT团队）第一次尝试时，并未考虑优先级的事情，我们根据标题元素的是否在浏览器窗口可见计算其toc的位置，但如果快速滑动，那么toc的定位就会错乱

后续，我们调整，扩大根窗口的区域（与文章一样长）的方式，那么我们只需要判断是不是已经交叉即可，即便滑动太快也无需担心

相关的代码可以见：
- https://github.com/jiangtj/hexo-theme-cake/blob/9532ba695834a80bde883386efd2af8ffe6fe351/source/js/next-boot.js#L61-L134
- https://github.com/theme-next/hexo-theme-next/blob/ba019030a1293c80536fcb16777cc05a94305118/source/js/utils.js#L222-L300
- https://github.com/theme-next/hexo-theme-next/pull/1125

## 评论系统懒加载

由于国内网络不稳定（众所周知的原因），当我们要加载一些国外服务时，往往希望在需要时加载，以改善网站的加载速度。在博客中比较常见的是disqus，NexT团队将其扩展到所有的评论系统。实现当用户浏览到评论系统位置（或者多评论系统启用某一评论系统）时，加载相关评论系统服务

相关的代码见：
- https://github.com/jiangtj/hexo-theme-cake/pull/33
