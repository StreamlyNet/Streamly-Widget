var webrtc;
var socket;
var sid;
var callTimer;
var callTimerDelay = config.callTimerDelay;

// Provider information
var store;
var listing;
var remotePeerId;

// Temp variable used to fix bug with incorrect RTCPeerConnection
var tempConnection;

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
    detectSpeakingEvents: false,
    socketio: {
      forceNew: true
    },
    debug: false,
  });
  socket = webrtc.connection.connection;
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

  // Video button click
  $('.js-pause').on('click', function(e) {
      const localVideoContainerEl = $('#localVideoContainer');
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
      from: self.store
    };

    self.socket.emit('endCall', data);
    self.closeConn();
  });

  // Fullscreen
  $('.js-fullScreen').on('click', function() {
      self.handleFullScreenBtnClick(self)

      $(document).keydown(function(e) {
         if (self.isFullscreen && e.keyCode == 27) {
            self.handleCancelFullScreenBtnClick(self);
        }
    });
  });

  // Listen to messages from parent window
  bindEvent(window, 'message', function (e) {
    if (e.data && e.data.type === 'initiateCall') {
      self.store = e.data.storeName;
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
  self.toggleCallingWindow(true, store, null);
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
    self.sid = sessionId;
    self.socket.emit('initializeSession', {obId: self.store, sid: self.sid});
  });

  webrtc.on('videoAdded', function(video, peer) {
    if (peer && peer.pc) {
      self.remotePeer = peer;
      peer.pc.on('iceConnectionStateChange', (event) => {
        switch (peer.pc.iceConnectionState) {
         case 'checking':
           console.log('checking state');
           break;
         case 'connected':
           console.log('connected state');
         case 'completed':
           console.log('completed state');
           break;
         case 'disconnected':
           console.log('disconnected state');
           break;
         case 'failed':
           console.log('failed state');
           break;
         case 'closed':
           console.log('closed state');
           break;
        }
      });
    }
    self.toggleCallingWindow(false, store, video);
  });

  webrtc.on('readyToCall', function() {
      self.webrtc.createRoom(self.uuid(), function (error, roomId) {
        data = {
          to: self.remotePeerId,
          from: self.store,
          listingName: self.listing,
          createdRoomId: roomId,
          remotePeerName: self.store,
          avatarHashes: ""
        };

      self.socket.emit('call', data);

      self.callTimer = setTimeout(function() {
        self.socket.emit('timeOut', {to: self.remotePeerId, from: self.store });
        self.closeConn();
        console.log('No answer');
      }, callTimerDelay);
      });
  });
}

function socketEvents() {
  var self = this;
  if(!socket) {
    return;
  }

  socket.on('declined', function() {
    console.log('The call has been declined');
    self.closeConn();
  });

  socket.on('accepted', function() {
    console.log('The call has been accepted');
    self.clearTimer();
  });

  socket.on('userOffline', function() {
    console.log('User is offline');
    self.closeConn();
  });

  socket.on('userBusy', function() {
    console.log('User is busy');
    self.closeConn();
  });

  socket.on('callEnded', function(remotePeerId) {
    console.log('Call ended by remote user');
    self.closeConn();
  });

  socket.on('peerDisconnected', function(remotePeerId) {
    if (self.remotePeerId === remotePeerId) {
      console.log('Remote peer has been disconnected. Ending call!');
      self.changeSelfState();
      self.closeConn();
    }
  });
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
   socket.emit('changeSelfState', { from: this.store });
}

function clearTimer() {
  if (callTimer) {
    clearTimeout(callTimer);
    callTimer = null;
  }
}

function closeConn() {
  console.log('Destroying connection');
  if (webrtc) {
    webrtc.off();
    webrtc.stopLocalVideo();
    webrtc.leaveRoom();
  }
  if (socket) {
    socket.off();
  }

  webrtc = null;
  socket = null;

  // Inform client provider window that call has ended.
  // It should hide the modal.
  var data = {
    to: self.remotePeerId,
    from: self.store
  };

  window.parent.postMessage({message: 'close'}, '*');

  clearTimer();
  clearCountTimer();
}
