var config = {};

config.server = {
  host: 'localhost',
  port: 8080
};

config.widget = {
  id: 'Streamly provider',
  context: 'Test',
  remotePeerId: 'QmQ4MM8shZteAgmGm8JG1h2eJw746VCNmaTnMzu3vkrTWS',
  webrtc: {
    signallingServer: "http://45.76.95.99:8888/",
    callTimerDelay: 60000, // in milliseconds
  }
};

module.exports = config;
