#!/bin/sh


DIR=$(date "+%Y.%m.%d-%H.%M.%S")

mkdir ./log-analysis/$DIR

scp hbbft1:~/node/node/parity.log ./log-analysis/$DIR/hbbft1.log
scp hbbft2:~/node/node/parity.log ./log-analysis/$DIR/hbbft2.log
scp hbbft3:~/node/node/parity.log ./log-analysis/$DIR/hbbft3.log
scp hbbft4:~/node/node/parity.log ./log-analysis/$DIR/hbbft4.log


