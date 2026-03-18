const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/remote-header',
    createProxyMiddleware({
      target: 'http://10.0.0.24/header/',
      changeOrigin: true,
      pathRewrite: {
        '^/remote-header': '',
      },
    })
  );
};
