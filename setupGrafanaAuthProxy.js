const httpProxy = require("http-proxy");

/**
 * Sets up an authentication proxy for Grafana.
 * This function creates a proxy server that authenticates requests before forwarding them to Grafana.
 * 
 * @param {string} target - The target URL of the Grafana server.
 * @param {Function} authCheckFn - A function that performs authentication checks on incoming requests.
 * @param {Object} [proxyOptions={}] - Additional options for the proxy server.
 * @param {Object} [proxyEvents={}] - Custom event handlers for the proxy server.
 * @returns {Function} A middleware function that handles incoming requests, authenticates them, and proxies them to Grafana.
 */
module.exports = function setupGrafanaAuthProxy(target, authCheckFn, proxyOptions = {}, proxyEvents = {}) {
    // 그라파나 프록시 세팅
    const proxy = httpProxy.createProxyServer({
        target,
        changeOrigin: true,
        ...proxyOptions,
    });

    proxy.on('error', (err, req, res) => {
        console.error('grafanaProxy Error', err);
        res.status(500).send('Proxy Error');
    });

    proxy.on('proxyReq', (proxyReq, req) => {
        // Body가 있는 요청의 경우 본문 데이터 다시 세팅
        if (req.body) {
            const bodyData = JSON.stringify(req.body);

            // Content-Length 헤더 다시 세팅
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.setHeader('Content-Type', 'application/json');

            // 본문 데이터를 프록시 요청에 다시 작성
            proxyReq.write(bodyData);
        }
    });

    // add custom proxy events
    if (Object.keys(proxyEvents).length > 0) {
        Object.keys(proxyEvents).forEach((event) => {
            proxy.on(event, proxyEvents[event]);
        });
    }

    return function grafanaAuthProxy(req, res, next) {
        // 토큰 검증 + 유저 정보 헤더에 세팅
        Promise.resolve(authCheckFn(req))
            .then((result) => {
                Object.keys(result).forEach((key) => {
                    req.headers[key] = result[key];
                });

                // 웹소켓 분기
                if (req.headers['upgrade']||req.headers['Upgrade']) {
                    proxy.ws(req, req.socket);
                } else {
                    proxy.web(req, res);
                }
            })
            .catch((e) => {
                console.error('grafana authentication failed', e);
                next();
            });
    }
}