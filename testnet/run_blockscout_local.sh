#!/bin/sh
cd blockscout-local

echo "Starting Blockscout - in case of replacing an instance, run `docker-compose down` before to delete data."

docker-compose up