#!/bin/bash

cd ..

CACHE="--no-cache"

docker build $CACHE -t diamond-dev-tools-base -f docker-dev-tools/Dockerfile .
docker build $CACHE -t diamond-watchdog -f docker-dev-tools/Dockerfile-Watchdog .
docker build $CACHE -t diamond-state-server -f docker-dev-tools/Dockerfile-State-Server .