const request = require("request");

function read(url, key, onEmpty) {
    return new Promise((resolve, reject) => {
        request(
            {
                method: 'get',
                url: url + "/" + key + "?quorum=true",
                timeout: 1000
            }, 
            (err, res, body) => {
                if (err != null) {
                    reject(new Error());
                    return;
                }
                if (res.statusCode == 404) {
                    resolve(onEmpty);
                    return;
                }
                if (res.statusCode == 200) {
                    body = JSON.parse(body);
                    resolve({ ver: body.node.modifiedIndex, val: body.node.value});
                    return;
                }
                reject(new Error());
            }
        );
    });
}

function create(url, key, val) {
    return new Promise((resolve, reject) => {
        request(
            {
                method: 'put',
                form:  {
                    value: val
                },
                url: url + "/" + key + "?prevExist=false",
                timeout: 1000
            }, 
            (err, res, body) => {
                if (err != null) {
                    reject(new Error());
                    return;
                }
                if (res.statusCode == 201) {
                    resolve({ isConflict: false, isOk: true });
                    return;
                }
                if (res.statusCode == 412) {
                    resolve({ isConflict: true, isOk: false });
                    return;
                }
                reject(new Error());
            }
        );
    });
}

function write(url, key, ver, val) {
    return new Promise((resolve, reject) => {
        request(
            {
                method: 'put',
                form:  {
                    value: val
                },
                url: url + "/" + key + "?prevIndex=" + ver,
                timeout: 1000
            }, 
            (err, res, body) => {
                if (err != null) {
                    reject(new Error());
                    return;
                }
                if (res.statusCode == 200) {
                    resolve({ isConflict: false, isOk: true });
                    return;
                }
                if (res.statusCode == 412) {
                    resolve({ isConflict: true, isOk: false });
                    return;
                }
                reject(new Error());
            }
        );
    });
}

class ProposerClient {
    constructor(settings) {
        this.settings = settings;
    }
    async read(key) {
        return read(this.settings.keys, key, null);
    }
    async create(key, val) {
        return create(this.settings.keys, key, val)
    }
    async write(key, ver, val) {
        return write(this.settings.keys, key, ver, val);
    }
}

exports.ProposerClient = ProposerClient;
