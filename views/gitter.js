
((window.gitter = {}).chat = {}).options = {
  room             : 'jiangtj/Lobby',
  activationElement: false
};
// eslint-disable-next-line no-unused-vars
var openGitter = function() {};
document.addEventListener('gitter-sidecar-ready', function(e) {
  var GitterChat = e.detail.Chat;
  var chat = new GitterChat({
    room             : 'jiangtj/Lobby',
    activationElement: false
  });
  openGitter = () => {
    chat.toggleChat(true);
  };
});
