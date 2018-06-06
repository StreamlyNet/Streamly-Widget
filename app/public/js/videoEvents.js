var isFullScreen = false;
var countTimer;
var mouseIn;
var animationControlsTimeout = null;

var fullScreenKey;

 function toggleCallingWindow (flag, storeName, video) {
     var callDetailsSelector = $('#videoContainer').find('.btnContainer.top .nickname, .btnContainer.top .durationDisplay__text, .btnContainer.top .centPerMinute__container');
     var callingStringSelector = $('#videoContainer').find('.btnContainer.top .callingString');
     var callingProfileSelector = $('#videoContainer').find('.callingScreen');
     if (flag){
        $('.callingScreen__name').text(storeName);
        $('#remoteContainer video').remove();
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
        mouseIn = true;
       handleDisplayVideoControls($(this));
    });
    containerSelector.mouseleave(function(){
        mouseIn = false;
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

function handleFullScreenBtnClick() {
    openFullScreen();
    isFullScreen = true;
}

function handleCancelFullScreenBtnClick(self){
    closeFullScreen();
}

function toggleControlsInFullscreenMode(){
    var self = this;
    animationControlsTimeout = null;
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

function toggleChatWindow(){
    isChatOpen = $('.videoContainer').hasClass('chatOpen') && $('.chatContainer').hasClass('chatOpen');
    if (isChatOpen) {
        closeChat();
        isChatOpen = false;
    } else {
        openChat();
        isChatOpen = true;
    }
}

function toggleVideoControls() {
    animationControlsTimeout = null;
    var videoContainer = $('#videoContainer');
    clearTimeout(animationControlsTimeout);
    handleDisplayVideoControls(videoContainer);
    animationControlsTimeout = setTimeout(function () {
        if (!mouseIn) {
            self.handleHideVideoControls(videoContainer);
        }
    }, 2000);
}

function toggleLoadingWindow(flag){
    $('#videoContainer .loadingScreen').removeClass('hide');
    if(!flag){
        $('#videoContainer .loadingScreen').addClass('hide');
    }
}

function openFullScreen() {
    var fullScreenVideo = $('.videoContainer__body')[0];
    if (isChrome || isEdge || isSafari || isOpera) {
        fullScreenVideo.webkitRequestFullscreen();
    }
    else if (isFirefox){
        fullScreenVideo.mozRequestFullScreen();
    }
    else if (isIE) {
        fullScreenVideo.msRequestFullscreen()
    }
}

function closeFullScreen() {
     if (isFullScreen) {
         var self = this;
         isFullScreen = false;

         if (isChrome || isEdge || isSafari || isOpera) {
             document.webkitExitFullscreen();
         }
         else if (isFirefox){
             document.mozCancelFullScreen();
         }
         else if (isIE) {
             document.msExitFullscreen()
         }
     }
}

function addFullScreenElements(self) {
    var fullScreenBtn = $('.js-fullScreen');
    $('.videoContainer__body').addClass('fullScreen');
    $('.videoContainer').addClass('fullScreen');
    $('.chatContainer').addClass('fullScreen');
    $('#remoteContainer').addClass('fullScreen');
    fullScreenBtn.off();
    fullScreenBtn.attr('title', 'Exit fullScreen');
    fullScreenBtn.html('<i class="fa fa-expand" aria-hidden="true"></i>');
    fullScreenBtn.click(function() {
        self.handleCancelFullScreenBtnClick()
    });
}

function removeFullScreenElements(self) {
    var fullScreenBtn = $('.js-fullScreen');
    $('.videoContainer__body').removeClass('fullScreen');
    $('.videoContainer').removeClass('fullScreen');
    $('.chatContainer').removeClass('fullScreen');
    $('#remoteContainer').removeClass('fullScreen');
    fullScreenBtn.off();
    fullScreenBtn.attr('title', 'FullScreen');
    fullScreenBtn.html('<i class="fa fa-arrows-alt" aria-hidden="true"></i>');
    fullScreenBtn.click(function() {
        self.handleFullScreenBtnClick()
    });
}

function handleFullScreenChangeEvent(event, key) {
     fullScreenKey = key;
     var self = this;
     $(document).on(event, function(e) {
         var element = getFullScreenElement(fullScreenKey);
         if (element) {
             self.toggleControlsInFullscreenMode();
             self.addFullScreenElements(self);
         }
         else {
             self.removeFullScreenElements(self);
             $("#videoContainer").off('mousemove');
             self.clearTimeout(self.animationControlsTimeout);
         }
     })
}

function getFullScreenElement(key) {
     if (key === 'webkit') {
        return document.webkitFullscreenElement
     } else if (key === 'firefox') {
        return document.mozFullScreenElement
     } else if (key === 'ie') {
         return document.msFullscreenElement
     }
}
}