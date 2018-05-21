$(document).ready(function() {
  events();
});

function events() {
  var self = this;
  $('.js-call').on('click', function() {
    var iframeEl = $('#clientScreen__iframe')[0];
    var msg = {
      type: 'startCall',
    }
    iframeEl.contentWindow.postMessage(msg, '*');
    self.showVideoModal();
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
