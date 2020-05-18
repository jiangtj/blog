/* global hexo */

'use strict';

if (hexo.config.theme !== 'next') return;

class ViewInject {
  constructor() {
    this.raws = [];
  }
  raw(name, raw, ...args) {
    this.raws.push(name);
  }
  file(name, file, ...args) {
    this.raws.push(name);
  }
}

// 做一点兼容，方便测试NexT主题
hexo.extend.filter.register('theme_inject', function(injects) {
  injects.menu = new ViewInject();
  hexo.theme.config.reward = {
    wechatpay: '/images/wechatpay.png'
  };
}, -99);

hexo.extend.filter.register('theme_inject', function(injects) {
  if (injects.menu.raws.length > 0) {
    hexo.theme.config.local_search.enable = true;
    injects.bodyEnd.raw('local-search', '');
  }
}, 99);

hexo.extend.tag.register('preview', (args, content) => content, {ends: true});
