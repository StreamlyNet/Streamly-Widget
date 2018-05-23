var isFullScreen = false;
var countTimer;

 function toggleCallingWindow (flag, storeName, video) {
     var callDetailsSelector = $('#videoContainer').find('.btnContainer.top .nickname, .btnContainer.top .durationDisplay__text, .btnContainer.top .centPerMinute__container');
     var callingStringSelector = $('#videoContainer').find('.btnContainer.top .callingString');
     var callingProfileSelector = $('#videoContainer').find('.callingScreen');
     if (flag){
        $('.callingScreen__name').text(storeName);
        handleDisplayVideoControls($('#videoContainer'));
        callDetailsSelector.removeClass('hide');
        callDetailsSelector.addClass('hide');
        callingStringSelector.removeClass('hide');
        callingProfileSelector.removeClass('hide');
        disattachVisualizeVideoControlEvents();
        $('.js-fullScreen').prop("disabled", true);
     } else {
         $('.nickname').text(storeName);
         $('#remoteContainer').append(video);
         callDetailsSelector.removeClass('hide');
         callingStringSelector.removeClass('hide');
         callingStringSelector.addClass('hide');
         callingProfileSelector.removeClass('hide');
         callingProfileSelector.addClass('hide');
         attachVisualizeVideoControlEvents();
         $('.js-fullScreen').prop("disabled", false);
         startCountTimer();
     }
 }

 function startCountTimer() {
    setTimeout(function(){
        $('.videoContainer__body').removeClass('display');
        $('.videoContainer__body').addClass('display');
        $('.videoContainer__spinner').removeClass('display');
    }, 1000);
    window.callDurationNumber = 0;
    window.centPerMinuteNumber = 0;
    window.callDurationInterval = setInterval(function() {
        window.callDurationNumber++;
        var hours   = Math.floor(window.callDurationNumber / 3600);
        var minutes = Math.floor((window.callDurationNumber - (hours * 3600)) / 60);
        var seconds = window.callDurationNumber - (hours * 3600) - (minutes * 60);
        if (hours === 0){
          hours = '';
        } else if (hours < 10){
          hours = '0' + hours + ':';
        } else {
          hours += ':'
        }

        minutes < 10 ? minutes = '0' + minutes: minutes;
        seconds < 10 ? seconds = '0' + seconds: seconds;
        $('.durationDisplay__number').text(hours + minutes + ':' + seconds);

        window.centPerMinuteNumber++;
        var dollars = Math.floor(window.centPerMinuteNumber/100);
        var cents = window.centPerMinuteNumber - (dollars*100);
        cents < 10 ? cents = '0' + cents : cents;
        $('.centPerMinute__value').text(dollars + '.' + cents);
    }, 1000);
}

 function attachVisualizeVideoControlEvents () {
    var containerSelector = $('#videoContainer');
    containerSelector.off();
    var self = this;
    containerSelector.mouseenter(function(){
       handleDisplayVideoControls($(this));
    });
    containerSelector.mouseleave(function(){
       handleHideVideoControls($(this));
    });
}

function disattachVisualizeVideoControlEvents(){
    var containerSelector = $('#videoContainer');
    containerSelector.off();
}

function handleDisplayVideoControls(that) {
    that.find('.btnContainer').removeClass('display');
    that.find('.btnContainer').addClass('display');
}

function handleHideVideoControls(that){
    that.find('.btnContainer').removeClass('display');
}

function handleFullScreenBtnClick(self) {
  const fullScreenVideo = $('.videoContainer')[0];
  var fullscreenButton = $('.js-fullScreen');
  var remoteVideo = $('#remoteContainer')[0];
  if (fullScreenVideo && fullScreenVideo.webkitRequestFullscreen) {
    fullScreenVideo.webkitRequestFullscreen();
    isFullscreen = true;
    toggleControlsInFullscreenMode(self);
    $('.videoContainer').css('height','100vh');
    $('.videoContainer').css('width','100vw');
    $('#remoteContainer video').css('height','100vh');
    $('#remoteContainer video').css('width','100vw');
    fullscreenButton.off();
    fullscreenButton.attr('title', 'Exit fullScreen');
    fullscreenButton.html('<i class="fa fa-expand" aria-hidden="true"></i>');
    fullscreenButton.click(function(){self.handleCancelFullScreenBtnClick(self)});
  }
}

function handleCancelFullScreenBtnClick(self){
    const fullScreenVideo = $('.videoContainer');
    var fullscreenButton = $('.js-fullScreen');
    if (fullScreenVideo && document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
      isFullscreen = false;
      $("#videoContainer").off('mousemove');
      clearTimeout(self.animationControlsTimeout);
      $('.videoContainer').css('height','480px');
      $('.videoContainer').css('width','640px');
      $('#remoteContainer video').css('height','480px');
      $('#remoteContainer video').css('width','640px');
      fullscreenButton.off();
      fullscreenButton.attr('title', 'FullScreen');
      fullscreenButton.html('<i class="fa fa-arrows-alt" aria-hidden="true"></i>');
      fullscreenButton.click(function(){self.handleFullScreenBtnClick(self)});
    }
}

function toggleControlsInFullscreenMode(self){
    var animationControlsTimeout = null;
    $("#videoContainer").off('mousemove');
    $("#videoContainer").on('mousemove', function() {
      var videoContainer = $(this);
      clearTimeout(self.animationControlsTimeout);
      self.handleDisplayVideoControls(videoContainer);
      self.animationControlsTimeout = setTimeout(function () {
          self.handleHideVideoControls(videoContainer);
      }, 2000);
    });
}

function clearCountTimer() {
    if (window.callDurationInterval) {
        clearInterval(window.callDurationInterval);
        $('.durationDisplay__number').text('00:00');
        $('.centPerMinute__value').text('0.00');
    }
}
