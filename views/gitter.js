
((window.gitter = {}).chat = {}).options = {
  room: 'jiangtj/Lobby',
  activationElement: false
};
// eslint-disable-next-line no-unused-vars
let openGitter = function() {};
document.addEventListener('gitter-sidecar-ready', e => {
  const GitterChat = e.detail.Chat;
  const chat = new GitterChat({
    room: 'jiangtj/Lobby',
    activationElement: false
  });
  openGitter = () => {
    chat.toggleChat(true);
  };
});
