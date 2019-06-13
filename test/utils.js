import http from 'http';

export default {
    /**
     * 
     * @param {Number} port
     * @param {Function} callback stop default response action when return true
     */
    createServer(port, callback = new Function()) {
        return http.createServer((req, res) => {
            if (callback(req, res)) {
                return;
            }
            res.writeHead(200);
            res.end();
        }).listen(port);
    }
}