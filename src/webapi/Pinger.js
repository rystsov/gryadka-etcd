class Pinger {
    constructor(service, key, liveness, period_us) {
        this.service = service;
        this.key = key;
        this.liveness = liveness;
        this.period_us = period_us;
        this.retry_us = 500 * 1000; // 0.5s
        this.isActive = false;
        this.thread = null;
    }

    async start() {
        this.thread = ((async () => {
            this.isActive = true;
            let timeout = this.period_us;
            while (this.isActive) {
                await new Promise((resolve,reject) => {
                    setTimeout(() => {
                        resolve(true);
                    }, timeout / 1000);
                });
                try {
                    const read = await this.service.read(this.key);
                    this.liveness.markAlive(this.service.hostPort);
                    timeout = this.period_us;
                } catch (e) {
                    timeout = this.retry_us;
                    this.liveness.markDead(this.service.hostPort);
                }
            }
        })());
    }

    async stop() {
        this.isActive = false;
        await this.thread;
    }
}

exports.Pinger = Pinger;

function time_us() {
    const [s, ns] = process.hrtime();
    return (s*1e9 + ns) / 1000;
}