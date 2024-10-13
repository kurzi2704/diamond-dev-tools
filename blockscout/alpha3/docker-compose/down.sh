#!/bin/sh

docker compose -f dmd-alpha3.yml down
rm -fr services/blockscout-db-data
rm -fr services/logs
rm -fr services/redis-data
rm -fr services/stats-db-data