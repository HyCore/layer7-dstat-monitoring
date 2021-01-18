const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');

var rps = 0;
setInterval(() => rps = 0, 1000);

class Dstat {
    constructor(options) {
        this.options = options;
        this.express = express;
        this.app = this.express();
        this.wss = new WebSocket.Server(options.websocket);
        this.js = fs.readFileSync('html/js/index.js', 'utf-8').replace(/{port}/gi, options.websocket.port);
    }
    start() {
        this.startSite();
        this.startDstat();
    }
    startSite() {

        this.app.use((req, res, next) => {
            rps++;
            next();
        });

        this.app.get('/js/index.js', (req, res) => res.end(this.js));

        this.app.use(this.express.static('html'));

        this.app.listen(this.options.site.port, () => {
            console.log('Started L7 Dstat successfully on %s', this.options.site.port);
        });
    }
    startDstat() {
        this.wss.on('connection', function connection(ws) {

         // U can change here the check interval for ex: 3000ms=3s. Remember to change also in line 6

            let int = setInterval(() => send({ requests: rps }), 1000);

            function send(json) {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(json));
                } else if (int) {
                    clearInterval(int);
                }
            }
        });
    }
}

module.exports = Dstat;
