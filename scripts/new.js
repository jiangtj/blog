'use strict';

function createNewPost(args){
  let config = hexo.config.jiang || {};
  if (!config.post_base_dir) {
    console.warn('需要配置jiang.post_base_dir!')
    hexo.call('help', {_:['x']})
    return;
  }
  args.path = config.post_base_dir + '/' + args._[0];
  hexo.call('new',args);
};

hexo.extend.console.register('x', '在指定路径创建文件', {
  arguments: [
      { name: 'title', desc: '标题名' }
  ]
}, createNewPost);
