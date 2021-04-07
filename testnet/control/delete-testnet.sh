#!/bin/sh
#
# builds the openethereum client in release mode and deploys it to the nodes.


#
ssh hbbft1 'rm -r ~/node/node/*'
ssh hbbft2 'rm -r ~/node/node/*'
ssh hbbft3 'rm -r ~/node/node/*'
ssh hbbft4 'rm -r ~/node/node/*'

