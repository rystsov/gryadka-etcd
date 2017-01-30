#!/bin/bash

wrk -t1 -c1 -s src/benchmarks/cycles.lua -d1m http://127.0.0.1:2379
