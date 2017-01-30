const {ProposerService} = require("./ProposerService");

const settings = JSON.parse(require("fs").readFileSync(process.argv[2]));
console.info(settings);

const service = new ProposerService(settings);
service.start();