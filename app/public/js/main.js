var webrtc;
var socket;
var sid;
var callTimer;
var callTimerDelay = config.callTimerDelay;

var currStoreName;
var currUserId;
var isChatOpen = false;

// Provider information
var remoteStoreName;
var listing;
var remotePeerId;

// Temp variable used to fix bug with incorrect RTCPeerConnection
var tempConnection;

// Ice restart variables
var ongoingCall = false;
var failTimer = null;
var remotePeer;

// Detect browser
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = typeof InstallTrigger !== 'undefined';
var ua = navigator.userAgent.toLowerCase();
var isSafari = ua.indexOf('safari') != -1;
var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isChrome = !!window.chrome && !!window.chrome.webstore;
var isEdge = !isIE && !!window.StyleMedia;

$(document).ready(function() {
  events();
  tempConnection = window.RTCPeerConnection;
});

function init() {
  webrtc = new SimpleWebRTC({
    url: config.signallingServer,
    localVideoEl: 'localVideo',
    remoteVideosEl: 'remoteVideo',
    autoRequestMedia: false,
    detectSpeakingEvents: true,
    socketio: {
      forceNew: true
    },
    debug: false,
  });
  socket = webrtc.connection.connection;
  currUserId = generateUserId();
  console.log('Store peer id of current user is ' + currUserId);
}

function generateUserId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function events() {
  var self = this;

  // Mute button click
  $('.js-mute').on('click', function(e) {
    if ($(this).hasClass('muted')) {
      self.webrtc.unmute();
      $(this).removeClass('muted');
      $(this).attr('title', 'Mute');
      $(this).html('<i class="fa fa-microphone" aria-hidden="true"></i>');
    }
    else {
      self.webrtc.mute();
      $(this).addClass('muted');
      $(this).attr('title', 'Unmute');
      $(this).html('<i class="fa fa-microphone-slash" aria-hidden="true"></i>');
    }
  });

  $('.js-openchat').on('click', function(e) {
      self.toggleChatWindow();
  });

  // Video button click
  $('.js-pause').on('click', function(e) {
      var localVideoContainerEl = $('#localVideoContainer');
      if ($(this).hasClass('paused')) {
        self.webrtc.resumeVideo();
        $(this).removeClass('paused');
        localVideoContainerEl.removeClass('display');
        localVideoContainerEl.addClass('display');
        $(this).attr('title', 'Pause video');
        $(this).html('<i class="fa fa-video-camera" aria-hidden="true">');
      }
      else {
        self.webrtc.pauseVideo();
        $(this).addClass('paused');
        localVideoContainerEl.removeClass('display');
        $(this).attr('title', 'Resume video');
        $(this).html('<i class="fa fa-pause" aria-hidden="true"></i>');
      }
  });

  // End call button click
  $('.js-end').on('click', function() {
    var data = {
      to: self.remotePeerId,
      from: self.currUserId
    };

    self.socket.emit('endCall', data);
    self.closeConn();
  });

  // Fullscreen
  $('.js-fullScreen').on('click', function() {
      self.handleFullScreenBtnClick(self);
  });

    if (isChrome || isOpera || isEdge || isSafari) {
        handleFullScreenChangeEvent('webkitfullscreenchange', 'webkit');
    }
    else if (isFirefox) {
        handleFullScreenChangeEvent('mozfullscreenchange', 'firefox');
    }
    else if (isIE) {
        handleFullScreenChangeEvent('MSFullscreenChange','ie');
    }

  // Send message
  $('.chatInput').keypress(function(e) {
    if (e.which === 13) {
      var message = $('.chatInput').val().trim();

      if (message === '') {
        return;
      }

      var data = {
        from: self.currStoreName,
        remotePeerId: self.currUserId,
        to: self.remotePeerId,
        msg: message
      };

      self.prependMsg(data, true);

      self.socket.emit('chatMsg', data);
    }
  });

  // Listen to messages from parent window
  bindEvent(window, 'message', function (e) {
    if (e.data && e.data.type === 'initiateCall') {
      self.currStoreName = 'Visitor of ' + e.data.widgetStoreName;
      self.remoteStoreName = e.data.remoteStoreName;
      self.remotePeerId = e.data.peerId;
      self.listing = e.data.listingName;
      // Fix problem with window scopes. Problem:
      // When accessing iframe from global window (client provider),
      // it changes RTCPeerConnection function to the native one, though
      // it was set to SimpleWebRTC's implementation.
      window.RTCPeerConnection = tempConnection;
      self.startCall();
    }
  });
}

function startCall() {
  init();
  webrtcEvents();
  socketEvents();
  self.toggleCallingWindow(true, remoteStoreName, null);
  self.webrtc.startLocalVideo();
}

// addEventListener support for IE8
function bindEvent(element, eventName, eventHandler) {
  if (element.addEventListener) {
      element.addEventListener(eventName, eventHandler, false);
  } else if (element.attachEvent) {
      element.attachEvent('on' + eventName, eventHandler);
  }
}

function webrtcEvents() {
  var self = this;

  webrtc.on('connectionReady', function(sessionId) {
    console.log('Connection is ready with session id ' + sessionId);
    if (ongoingCall && !isFirefox) {
       console.log('Initiating ice restart');
       remotePeer.icerestart(sid);
    }
    self.sid = sessionId;
    self.socket.emit('initializeSession', {obId: self.currUserId, sid: self.sid});
  });

  webrtc.on('videoAdded', function(video, peer) {
    if (peer && peer.pc) {
      self.remotePeer = peer;
      peer.pc.on('iceConnectionStateChange', function (event) {
        switch (peer.pc.iceConnectionState) {
         case 'checking':
           console.log('checking state');
           break;
         case 'connected':
           console.log('connected state');
           clearTimeout(self.failTimer);
           self.failTimer = null;
           self.toggleLoadingWindow(false);
         case 'completed':
           console.log('completed state');
           break;
         case 'disconnected':
           console.log('disconnected state');
           self.toggleLoadingWindow(true);
           break;
         case 'failed':
           console.log('failed state');
           console.log('Setting timeout after call has been dropped');
           if (isFirefox) {
               self.toggleTerminationMessage('Call ended due to connectivity problem');
           }
           else {
               self.failTimer = setTimeout(function() {
                   self.toggleTerminationMessage('Call ended due to connectivity problem');
               }, 30 * 1000);
           }
           break;
         case 'closed':
           console.log('closed state');
           break;
        }
      });
    }
    self.toggleCallingWindow(false, remoteStoreName, video);
  });

  webrtc.on('readyToCall', function() {
   if (!ongoingCall) {
       self.webrtc.createRoom(self.uuid(), function (error, roomId) {
           data = {
               to: self.remotePeerId,
               from: self.currUserId,
               listingName: self.listing,
               createdRoomId: roomId,
               remotePeerName: self.currStoreName,
               avatarHashes: "",
               fromWidget: true,
           };

           self.socket.emit('call', data);

           self.callTimer = setTimeout(function () {
               self.socket.emit('timeOut', {to: self.remotePeerId, from: self.currUserId});
               self.toggleTerminationMessage('No answer');
           }, callTimerDelay);
       });
   }
  });

  webrtc.on('localStreamRequestFailed', function() {
      self.toggleTerminationMessage('Please provide access to microphone and camera');
  });
}

function socketEvents() {
  var self = this;
  if(!socket) {
    return;
  }

  socket.on('declined', function() {
    self.toggleTerminationMessage('The call has been declined');
  });

  socket.on('accepted', function() {
    console.log('The call has been accepted');
    self.ongoingCall = true;
    self.clearTimer();
  });

  socket.on('userOffline', function() {
    self.toggleTerminationMessage('User is offline');
  });

  socket.on('userBusy', function() {
    self.toggleTerminationMessage('User is busy');
  });

  socket.on('callEnded', function(remotePeerId) {
    self.toggleTerminationMessage('Call ended by remote user');
  });

  socket.on('peerDisconnected', function(remotePeerId) {
    if (self.remotePeerId === remotePeerId) {
      self.changeSelfState();
      self.toggleTerminationMessage('Call ended by remote user');
    }
  });

  socket.on('chatMsg', function(data) {
    if (data.msg) {
      self.prependMsg(data, false);
    }
    if (!isChatOpen) {
      self.addChatNotification();
      self.toggleVideoControls();
    }
  });
}

function toggleTerminationMessage(info) {
    closeFullScreen();
    var msgContainer = $('.videoContainer__msgs');
    var msgText = $('.videoContainer__msgs__text');
    var self = this;
    msgText.text(info);
    msgContainer.removeClass('hide');
    window.parent.postMessage({message: 'display-message'}, '*');
    var msgTimeout = setTimeout(function() {
        msgContainer.addClass('hide');
        msgText.text('');
        self.closeConn();
        msgTimeout = null;
    }, 2500)
}

// Used to create unique room name
function uuid() {
  var uuid = "", i, random;
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (i == 8 || i == 12 || i == 16 || i == 20) {
      uuid += "-"
    }
    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }
  return uuid;
}

function changeSelfState() {
   socket.emit('changeSelfState', { from: currUserId });
}

function clearTimer() {
  if (callTimer) {
    clearTimeout(callTimer);
    callTimer = null;
  }
}

function closeConn() {
  console.log('Destroying connection');
  closeFullScreen();
  if (webrtc) {
    webrtc.off();
    webrtc.stopLocalVideo();
    webrtc.leaveRoom();
    webrtc.disconnect();
  }
  if (socket) {
    socket.off();
  }

  webrtc = null;
  socket = null;
  ongoingCall = null;
  remotePeer = null;
  isChatOpen = false;

  // Inform client provider window that call has ended.
  // It should hide the modal.
  window.parent.postMessage({message: 'close'}, '*');

  clearTimer();
  clearCountTimer();
  deleteChat();
  elementsToInitialState();
}
