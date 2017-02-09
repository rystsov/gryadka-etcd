const minimist = require('minimist');
const fs = require("fs");
const {ReadIncWriteTest} = require("./ReadIncWriteTest");

const args = Object.assign({
    c:1,
    d:"10s",
    h: null
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

if (args.h == null) {
    throw new Error("user should specify hosts with -h arg");
}

const hostPorts = args.h.split(",");

const tester = new ReadIncWriteTest(hostPorts, args.c, duration_us, 5 * 1000 * 1000);
(async () => {
    await tester.run();
})()
