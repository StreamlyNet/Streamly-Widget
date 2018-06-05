var config = {};

config.server = {
  host: 'localhost',
  httpPort: 8081
};

config.widget = {
  webrtc: {
    signallingServer: "http://45.76.95.99:8888/",
    callTimerDelay: 60000, // in milliseconds
  }
};

module.exports = config;
