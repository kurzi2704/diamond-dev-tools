#!/bin/sh
#
# builds the openethereum client in release mode and deploys it to the nodes.


#
scp -r ../nodes/node1/* hbbft1:~/node/node/
scp -r ../nodes/node2/* hbbft2:~/node/node/
scp -r ../nodes/node3/* hbbft3:~/node/node/
scp -r ../nodes/node4/* hbbft4:~/node/node/

cd -