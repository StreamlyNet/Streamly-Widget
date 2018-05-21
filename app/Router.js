module.exports = [
  {
    path: '/',
    handler:  rootRequire('app/routes/IndexRoute'),
  },
  {
    path: '/test',
    handler: rootRequire('app/routes/TestRoute'),
  }
]
