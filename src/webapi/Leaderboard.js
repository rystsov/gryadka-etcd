const HashRing = require('hashring');
const {Pinger} = require("./Pinger");
const {ProposerClient} = require("./ProposerClient");

class Leaderboard {
    constructor() {
        this.id_get = 0;
        this.services = new Map();
        this.ring = new HashRing();
        this.statuses = new Map();
        this.isStarted = false;
    }
    async add(hostPort, key, period_us) {
        const settings = {
            keys: "http://" + hostPort + "/v2/keys"
        };
        const service = new ProposerClient(settings);
        service.id = (this.id_get++);
        service.hostPort = hostPort;
        this.statuses.set(hostPort, true);

        this.services.set(hostPort, {
            service: service,
            pinger: new Pinger(service, key, this, period_us)
        });
        this.ring.add(hostPort);

        if (this.isStarted) {
            await this.services.get(hostPort).pinger.start();
        }
    }
    markAlive(hostPort) {
        if (this.statuses.get(hostPort)) return;
        this.statuses.set(hostPort, true);
        this.ring.add(hostPort);
    }
    markDead(hostPort) {
        if (!this.statuses.get(hostPort)) return;
        this.statuses.set(hostPort, false);
        this.ring.remove(hostPort);
    }
    route(key) {
        key = this.ring.get(key);
        if (this.services.has(key)) {
            return this.services.get(key).service;
        } else {
            return null;
        }
    }
    async start() {
        for(const key of this.services.keys()) {
            await this.services.get(key).pinger.start();
        }
        this.isStarted = true;
    }
    async stop() {
        for(const key of this.services.keys()) {
            await this.services.get(key).pinger.stop();
        }
        this.isStarted = false;
    }
}

exports.Leaderboard = Leaderboard;