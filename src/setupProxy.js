const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // Forzar no-cache para uploads (imágenes que se actualizan frecuentemente)
    app.use('/uploads', (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
    });

    app.use(
        ['/uploads', '/vitrina_futbolera'],
        createProxyMiddleware({
            target: 'http://localhost:8080',
            changeOrigin: true,
        })
    );
};
