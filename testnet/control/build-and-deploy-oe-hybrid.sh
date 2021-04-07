#!/bin/sh

# build and deploy open ethereum

# Version for build and deploy,
# that uses the build environment of the local machine, 
# uploads the build result to the master server,
# and distributes it from there.

cd ../../../openethereum/

cargo build
scp target/debug/openethereum  hbbft1:~/node/node/

echo "copy openethereum to hbbft2..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft2:~/node/node/'
echo "copy openethereum to hbbft3..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft3:~/node/node/'
echo "copy openethereum to hbbft4..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft4:~/node/node/'
