const {Leaderboard} = require("./Leaderboard");
const {SlidingWindow} = require("./SlidingWindow");

class ReadIncWriteTest {
    constructor(hostPorts, numberOfThreads, duration_us, ping_period_us) {
        this.leaderboard = new Leaderboard();
        this.duration_us = duration_us;
        this.thread = null;
        this.isActive = false;
        this.stat = {
            started: null,
            ended: null,
            cps: new SlidingWindow()
        };
        this.numberOfThreads = numberOfThreads;
        let i=0;
        for (const hostPort of hostPorts) {
            this.leaderboard.add(hostPort, "ping" + i, ping_period_us);
            i+=1;
        }
        this.hostPorts = hostPorts;
    }
    
    async run() {
        try {
            await this.leaderboard.start();
            this.isActive = true;
            this.stat.started = time_us();
            const threads = [];
            threads.push(this.agg());
            for (let i=0;i<this.numberOfThreads;i++) {
                const key = "key" + i;
                threads.push(this.startClientThread(key));
            }
            for (const thread of threads) {
                await thread;
            }
            this.stat.ended = time_us();
            await this.leaderboard.stop();
            console.info("OK");
        } catch(e) {
            console.info(e);
            console.info("WAT?!");
        }
    }

    async agg() {
        const started = time_us();
        while (this.isActive) {
            await new Promise((resolve, reject) => {
                setTimeout(() => resolve(true), 1000);
            });
            const time = time_us()
            this.stat.cps.forgetBefore(time - 1000*1000)
            
            console.info(
                "" + Math.floor((time - started) / (1000 * 1000)) + "\t" + 
                this.stat.cps.getStat(this.hostPorts)
            );
        }
    }

    async startClientThread(key) {
        while (this.isActive) {
            try {
                this.isActive = time_us() - this.stat.started < this.duration_us;
                const service = this.leaderboard.route(key);
                if (service == null) {
                    await new Promise((resolve, reject) => {
                        setTimeout(() => resolve(true), 500);
                    });
                    continue;
                }
                const read = await service.read(key);
                let written = null;
                if (read == null) {
                    written = await service.create(key, "0");
                } else {
                    written = await service.write(key, read.ver, "" + (parseInt(read.val) + 1));
                }
                if (written.isConflict) {
                    continue;
                }
                if (!written.isOk) {
                    throw new Error();
                }
                this.stat.cps.enqueue(time_us(), service.hostPort);
            } catch(e) { 
                //console.info("RIWT error:");
                //console.info(e);
                await new Promise((resolve, reject) => {
                    setTimeout(() => resolve(true), 0);
                });
            }
        }
    }
}

exports.ReadIncWriteTest = ReadIncWriteTest;

function time_us() {
    const [s, ns] = process.hrtime();
    return (s*1e9 + ns) / 1000;
}