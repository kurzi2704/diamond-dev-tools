#!/bin/sh

# clears the caches of the servers.

ssh hbbft1 'cd ~/openethereum && cargo build'
echo "openethereum build. calc sha1:"
ssh hbbft1 'sha1sum ~/openethereum/target/debug/openethereum'

ssh hbbft1 'cd ~/openethereum && cargo build'
echo "copy openethereum to hbbft1..."
ssh hbbft1 'cp ~/openethereum/target/debug/openethereum ~/node/node/openethereum'
echo "copy openethereum to hbbft2..."
ssh hbbft1 'scp ~/openethereum/target/debug/openethereum hbbft2:~/node/node/openethereum'
echo "copy openethereum to hbbft3..."
ssh hbbft1 'scp ~/openethereum/target/debug/openethereum hbbft3:~/node/node/openethereum'
echo "copy openethereum to hbbft4..."
ssh hbbft1 'scp ~/openethereum/target/debug/openethereum hbbft4:~/node/node/openethereum'
