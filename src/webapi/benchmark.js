const minimist = require('minimist');
const fs = require("fs");
const {ReadIncWriteTest} = require("./ReadIncWriteTest");

const args = Object.assign({
    c:1,
    d:"10s"
}, minimist(process.argv.slice(2)));

let duration_us = null;
let s = /^(\d+)s$/.exec(args.d);
if (s) {
    duration_us = parseInt(s[1]) * 1000 * 1000;
}
s = /^(\d+)m$/.exec(args.d);
if (s) {
    duration_us = parseInt(s[1]) * 60 * 1000 * 1000;
}
if (duration_us == null) {
    throw new Error("unknown duration: " + args.d);
}



const hostPorts = [
    "127.0.0.1:2400",
    "127.0.0.1:2401"
];

const tester = new ReadIncWriteTest(hostPorts, args.c, duration_us, 5 * 1000 * 1000);
(async () => {
    await tester.run();
})()
