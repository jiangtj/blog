/* global document */
'use strict';

document.addEventListener('gitter-sidecar-instance-started', e => {
  // every button has it's id such as #moon-menu-item-<key>
  document.querySelector('#moon-menu-item-chat').addEventListener('click', () => {
    e.detail.chat.toggleChat(true);
  });
});
