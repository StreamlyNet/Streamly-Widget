function events() {
    var self = this;

    $('.js-call').on('click', function () {
        var iframeEl = $('#clientScreen__iframe')[0];
        var msg = {
            type: 'initiateCall',
            peerId: $(this).data().peerId,
            listingName: $(this).data().listingName,
            storeName: $(this).data().storeName,
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

function showVideoModal() {
    $('.integration__video-container').removeClass('hidden');
    $('.integration__overlay').removeClass('hidden');
}

function hideVideoModal() {
    $('.integration__video-container').addClass('hidden');
    $('.integration__overlay').addClass('hidden');
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

    createElement('link', 'http://localhost:8080/streamly/api/clientScreen.css');
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
             class: "integration__overlay hidden"
        })
    ).addClass("integration__video-container hidden")
     .prepend(
         $('<iframe />', {
            name: 'streamly-widget',
            id: 'clientScreen__iframe',
            src: 'http://localhost:8080/',
            allowFullScreen: '',
            height: "640",
            width: "1200",
            frameborder: "0",
            allow: "microphone; camera"
         })
    )
}

function addBtnClasses() {
    $(".streamlyBtn").addClass('integration__button vertical-right integration__button--vertical js-call');
}

setEssentials();