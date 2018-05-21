$(document).ready(function() {
  events();
});

function events() {
  var self = this;

  $('.js-call').on('click', function() {
    var iframeEl = $('#clientScreen__iframe')[0];
    var msg = {
      type: 'initiateCall',
    };

    iframeEl.contentWindow.postMessage(msg, '*');
    self.showVideoModal();
  });

    bindEvent(window, 'message', function (e) {
       if (e.data && e.data.message === 'close') {
           self.hideVideoModal();
       }
    });
}

function showVideoModal(){
   $('.integration__video-container').removeClass('hidden');
   $('.integration__overlay').removeClass('hidden');
}

function hideVideoModal(){
   $('.integration__video-container').addClass('hidden');
   $('.integration__overlay').addClass('hidden');
}

function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener){
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}
