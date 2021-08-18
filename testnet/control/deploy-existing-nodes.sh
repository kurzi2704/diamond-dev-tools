#!/bin/sh
#
# builds the openethereum client in release mode and deploys it to the nodes.


#
ssh hbbft1 'mkdir -p ~/node/node/'
ssh hbbft2 'mkdir -p ~/node/node/'
ssh hbbft3 'mkdir -p ~/node/node/'
ssh hbbft4 'mkdir -p ~/node/node/'
ssh hbbft5 'mkdir -p ~/node/node/'
ssh hbbft6 'mkdir -p ~/node/node/'
ssh hbbft7 'mkdir -p ~/node/node/'


scp -r ../nodes/node1/* hbbft1:~/node/node/
scp -r ../nodes/node2/* hbbft2:~/node/node/
scp -r ../nodes/node3/* hbbft3:~/node/node/
scp -r ../nodes/node4/* hbbft4:~/node/node/
scp -r ../nodes/node5/* hbbft5:~/node/node/
scp -r ../nodes/node6/* hbbft6:~/node/node/
scp -r ../nodes/node7/* hbbft7:~/node/node/


cd -