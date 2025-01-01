#!/bin/sh

pwd
ls -hal

# sleep 3600

CONTAINER_FIRST_STARTUP="CONTAINER_FIRST_STARTUP"
if [ ! -e /$CONTAINER_FIRST_STARTUP ]; then
    touch /$CONTAINER_FIRST_STARTUP
    # place your script that you only want to run on first startup.
    ./init.sh
else
    ./start.sh
fi