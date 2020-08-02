/* global window document exclamationSVG timesSVG fetch performance */
'use strict';

const initServerList = top => {
  top.querySelector('.more').addEventListener('click', () => {
    top.remove();
    const bg = document.createElement('div');
    bg.classList.add('server-list-bg');
    document.body.append(bg);
    const container = document.createElement('div');
    container.classList.add('server-list-container');
    document.body.append(container);
    const card = document.createElement('div');
    card.classList.add('server-list-card', 'card');
    card.innerHTML = `<div><h1>详情<span class="close">${timesSVG}</span></h1></div>`;
    container.append(card);
    const cardContent = document.createElement('div');
    cardContent.innerHTML = '正在获取数据...';
    card.append(cardContent);
    fetch('/server-list.html')
      .then(response => response.text())
      .then(body => {
        cardContent.innerHTML = body;
      });
    card.querySelector('.close').addEventListener('click', () => {
      bg.remove();
      container.remove();
    });
  });
};

function print_nav_timing_data() {
  const perfEntries = performance.getEntriesByType('navigation');
  if (!perfEntries) return;

  for (let i = 0; i < perfEntries.length; i++) {
    const p = perfEntries[i];
    if (p.domComplete > 10000) {
      console.log('DOM complete = ' + p.domComplete);
      const top = document.createElement('div');
      top.classList.add('server-list-top');
      top.innerHTML = `${exclamationSVG} Sorry 服务器刚刚走神了！ <span class="more">详情</span>`;
      document.body.prepend(top);
      initServerList(top);
    }
  }
}

if ([
  'dnocm.com',
  'www.dnocm.com',
  'jiangtj.com',
  'zh.jiangtj.com',
  'wwww.jiangtj.com',
  'dnocm.netlify.app',
  'jiangtj.gitlab.io'
].indexOf(window.location.hostname) < 0) {
  const top = document.createElement('div');
  top.classList.add('server-list-top');
  top.innerHTML = `${exclamationSVG} 您访问的是非正式的站点！ <span class="more">详情</span>`;
  document.body.prepend(top);
  initServerList(top);
} else {
  window.onload = print_nav_timing_data;
}
