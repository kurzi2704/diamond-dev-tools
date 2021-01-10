#!/bin/sh

# clears the log, but leaves a backup behind.

ssh hbbft1 rm '~/node/node/parity.log'
ssh hbbft2 rm '~/node/node/parity.log'
ssh hbbft3 rm '~/node/node/parity.log'
ssh hbbft4 rm '~/node/node/parity.log'
