#!/bin/bash

mkdir -p deployment/etcd

./etcd-v3.1.0/etcd \
  --name 'etcd-1' \
  --data-dir "$(pwd)/deployment/etcd" \
  --listen-peer-urls 'http://127.0.0.1:2380' \
  --listen-client-urls 'http://127.0.0.1:2379' \
  --advertise-client-urls 'http://localhost:2379'
