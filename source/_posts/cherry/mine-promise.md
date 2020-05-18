---
title: 造了套自己的 Promise
categories: [前端]
tags: []
date: 2020-04-22 16:39:45
updated: 2020-04-22 16:39:45
description: 39行代码，走过路过不要错过哦~
---

Promise 很火，没看源码，仅参考平时的使用，造了一个小轮子（有时间再去看源码把）

```js
class PromiseT {
  constructor() {
    this.status = 'running';
    this.val = null;
    this.pendingList = [];
  }
  then(...list) {
    this.pendingList.push(...list);
    return this.run();
  }
  resolve(val) {
    this.status = 'running';
    if (val !== undefined) {
      this.val = val;
    }
    return this.run();
  }
  pending() {
    this.status = 'pending';
  }
  run() {
    if (this.status === 'pending') {
      return this;
    }
    const cal = this.pendingList.shift();
    if (cal === undefined) {
      return this;
    }
    const result = cal(this.val, this);
    if (result === undefined) {
      return this.run();
    }
    if (result.constructor === PromiseT) {
      return result.then(...this.pendingList);
    }
    this.val = result;
    return this.run();
  }
}
```

测试：

```js
new PromiseT()
  .resolve(5)
  .then(x => x + 1)
  .then(x => new PromiseT().resolve(2).then(a => x / a))
  .then(x => console.log(x))
  .then((x, p) => {
    p.pending();
    setTimeout(() => {
      p.resolve(x - 3);
    }, 2000);
  })
  .then(x => console.log(x));

// 输出 3
// 等待 2s
// 输出 0
```

毕竟是小轮子，`catch()` `finally()` 这些没写。。。
