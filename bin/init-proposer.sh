#!/bin/bash

set -e

mkdir -p deployment

node-nightly --harmony src/deploy/proposer.js $1 $2 "$(pwd)/deployment"
