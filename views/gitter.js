/* global document */
'use strict';

let openGitter = function() {};
document.addEventListener('gitter-sidecar-instance-started', e => {
  // eslint-disable-next-line no-unused-vars
  openGitter = () => {
    e.detail.chat.toggleChat(true);
  };
});
