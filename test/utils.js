import http from 'http';

export default {
    /**
     * 
     * @param {Number} port
     * @param {Function} callback stop default response action when return true
     */
    createServer(port, callback = new Function()) {
        return http.createServer((req, res) => {
            console.log('Server: ' + req.url);
            if (callback(req, res)) {
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                code: 200,
                msg: 'success'
            }));
        }).listen(port);
    }
}