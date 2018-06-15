function events() {
    var self = this;

    $('.js-call').on('click', function () {
        if((navigator.userAgent.indexOf("Chrome") == -1 ) && (navigator.userAgent.indexOf("Safari") == -1 && navigator.userAgent.indexOf("Version/11") == -1) && (navigator.userAgent.indexOf("Firefox") == -1 )){
            var msgContainer = $($('#clientScreen__iframe').contents().find("html")).find('.videoContainer__msgs');
            var msgText =$($('#clientScreen__iframe').contents().find("html")).find('.videoContainer__msgs__text');
            $('.streamly.integration__video-container').addClass('display-msgs');
            showVideoModal();
            msgContainer.removeClass('hide');
            var self = this;
            msgText.text('Your browser is not currently supported by the Streamly widget');
            var msgTimeout = setTimeout(function() {
                msgContainer.addClass('hide');
                msgText.text('');
                msgTimeout = null;
                hideVideoModal();
                $('.streamly.integration__video-container').removeClass('display-msgs');
            }, 2500);
            return;
        }
        var iframeEl = $('#clientScreen__iframe')[0];
        var msg = {
            type: 'initiateCall',
            peerId: $(this).data().peerId,
            listingName: $(this).data().listingName,
            widgetStoreName: window.location.hostname,
            remoteStoreName: $(this).data().remoteStoreName
        };

        iframeEl.contentWindow.postMessage(msg, '*');
        showVideoModal();
    });

    bindEvent(window, 'message', function (e) {
        if (e.data && e.data.message === 'close') {
            self.hideVideoModal();
            $('.streamly.integration__video-container').removeClass('display-msgs');
        }
        if(e.data && e.data.message === 'display-message'){
            $('.streamly.integration__video-container').addClass('display-msgs');
        }
    });
}

function showVideoModal() {
    $('.streamly.integration__video-container').removeClass('hidden');
    $('.streamly.integration__overlay').removeClass('hidden');
    $('body').addClass('streamly integration__video-container--open');
}

function hideVideoModal() {
    $('.streamly.integration__video-container').addClass('hidden');
    $('.streamly.integration__overlay').addClass('hidden');
    $('body').removeClass('streamly integration__video-container--open');
}

function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, eventHandler);
    }
}

function setEssentials() {
    var widgetContainer = document.createElement('div');
    widgetContainer.id = "streamlyWg";
    document.getElementsByTagName('body')[0].appendChild(widgetContainer);

    // createElement('link', 'https://video.streamly.net/widget/streamly/api/clientScreen.css');
    createElement('link', 'http://localhost:8081/widget/streamly/api/clientScreen.css');
    if (!window.jQuery) {
        // Add jQuery if it is not included in page
        createElement('script', 'https://code.jquery.com/jquery-3.3.1.min.js',
            // success
            function () {
                attachIframe();
                addBtnClasses();
                events();
            },
            //failure
            function() {
                console.log('Could not load jQuery. Won\'t start Streamly widget')
            }
        );
    }
    else {
        attachIframe();
        addBtnClasses();
        events();
    }
}

function createElement(element, src, success, failure) {
    var tag = document.createElement(element);

    if (element === 'link') {
        tag.type = 'text/css';
        tag.rel = 'stylesheet';
        tag.href = src;
    }
    else {
        tag.src = src;
    }

    document.getElementsByTagName('head')[0].appendChild(tag);

    if (success) {
        tag.onload = success;
    }

    if(failure) {
        tag.onerror = failure;
    }
}

function attachIframe() {
    $('#streamlyWg').before(
        $('<div />', {
             class: "streamly integration__overlay hidden"
        })
    ).addClass("streamly integration__video-container hidden")
     .prepend(
         $('<iframe />', {
            name: 'streamly-widget',
            id: 'clientScreen__iframe',
            // src: 'https://video.streamly.net/widget/',
            src: 'http://localhost:8081/widget/',
            allowFullScreen: '',
            frameborder: "0",
            allow: "microphone; camera"
         })
    )
}

function addBtnClasses() {
    $(".streamlyBtn").addClass('streamly js-call');
}

setEssentials();
