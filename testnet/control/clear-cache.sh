#!/bin/sh

# clears the caches of the servers.

ssh hbbft1 'rm -r ~/node/node/data/cache'
ssh hbbft2 'rm -r ~/node/node/data/cache'
ssh hbbft3 'rm -r ~/node/node/data/cache'
ssh hbbft4 'rm -r ~/node/node/data/cache'
