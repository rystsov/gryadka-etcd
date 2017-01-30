#!/bin/bash

set -e

rm -rf deployment

mkdir -p deployment/proposers

node-nightly --harmony src/deploy/deploy.js $1 acceptors | xargs -n1 -I '{}' mkdir "deployment/{}"
node-nightly --harmony src/deploy/deploy.js $1 redis etc/redis.mustache "$(pwd)"
node-nightly --harmony src/deploy/deploy.js $1 load-lua | xargs -L1 ./src/deploy/load-lua.sh
node-nightly --harmony src/deploy/deploy.js $1 proposer "$(pwd)"