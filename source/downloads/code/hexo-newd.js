/* eslint-disable no-undef */
/* eslint-disable no-console */
'use strict';

function createNewPost(args) {
  console.log(args);
  //需要将date改为正确的日期
  args.slug = 'date-' + (args.slug || args._[0]);
  hexo.call('new', args);
}

hexo.extend.console.register('newd', '为文件添加日期', {
  arguments: [
    { name: 'title', desc: '标题名' }
  ]
}, createNewPost);
