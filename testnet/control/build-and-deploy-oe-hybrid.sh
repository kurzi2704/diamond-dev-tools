#!/bin/sh

# build and deploy open ethereum

# Version for build and deploy,
# that uses the build environment of the local machine, 
# uploads the build result to the master server,
# and distributes it from there.

cd ../../../openethereum/

cargo build --release
scp target/release/openethereum  hbbft1:~/node/node/

echo "copy openethereum to hbbft2..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft2:~/node/node/'

echo "copy openethereum to hbbft3..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft3:~/node/node/'

echo "copy openethereum to hbbft4..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft4:~/node/node/'

echo "copy openethereum to hbbft5..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft5:~/node/node/'

echo "copy openethereum to hbbft6..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft6:~/node/node/'

echo "copy openethereum to hbbft7..."
ssh hbbft1 'scp ~/node/node/openethereum hbbft7:~/node/node/'
