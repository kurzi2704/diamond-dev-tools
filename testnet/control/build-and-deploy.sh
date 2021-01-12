#!/bin/sh
#
# builds the openethereum client in release mode and deploys it to the nodes.

cd ../../../openethereum/

cargo build

#
scp target/debug/openethereum  hbbft1:~/node/node/
scp target/debug/openethereum  hbbft2:~/node/node/
scp target/debug/openethereum  hbbft3:~/node/node/
scp target/debug/openethereum  hbbft4:~/node/node/

cd -