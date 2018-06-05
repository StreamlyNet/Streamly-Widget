module.exports = [
  {
    path: '/widget',
    handler:  rootRequire('app/routes/IndexRoute'),
  },
  {
    path: '/widget/test',
    handler: rootRequire('app/routes/TestRoute'),
  },
  {
    path: '/widget/streamly/api',
    handler: rootRequire('app/routes/StreamlyAPIRoute'),
  },
  {
    path: '/widget/generator',
    handler: rootRequire('app/routes/GeneratorRoute'),
  }
]
