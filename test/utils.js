import http from 'http';

const originConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
};

export default {
    /**
     * @param {Number} port
     * @param {Function} callback stop default response action when return true
     */
    createServer(port, callback = new Function()) {
        return http.createServer((req, res) => {
            if (callback(req, res)) {
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(this.defaultServerRespose));
        }).listen(port);
    },


    /**
     * Respond to the data that request
     * @param {Number} port
     */
    createBounceServer(port) {
        return http.createServer((req, res) => {
            let rawData = '';
            req.on('data', chunk => rawData += chunk);
            req.on('end', () => {
                const data = JSON.parse(rawData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            });
        }).listen(port);
    },

    defaultServerRespose: {
        code: 200,
        msg: 'success'
    },

    overrideConsole() {
        console.warn = txt => {
            throw txt;
        }
        console.error = txt => {
            throw txt;
        }
    },

    recoverConsole() {
        console.log = originConsole.log;
        console.warn = originConsole.warn;
        console.error = originConsole.error;
    }
}