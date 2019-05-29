import http from 'http';

export default {
    createServer(port, callback = new Function()) {
        return http.createServer((req, res) => {
            callback(req, res);
            res.writeHead(200);
            res.end();
        }).listen(port);
    }
}