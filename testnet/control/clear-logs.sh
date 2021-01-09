#!/bin/sh

# clears the log, but leaves a backup behind.

ssh hbbft1 mv '~/node/node/parity.log ~/node/node/parity_$(date "+%Y.%m.%d-%H.%M.%S").log'
ssh hbbft2 mv '~/node/node/parity.log ~/node/node/parity_$(date "+%Y.%m.%d-%H.%M.%S").log'
ssh hbbft3 mv '~/node/node/parity.log ~/node/node/parity_$(date "+%Y.%m.%d-%H.%M.%S").log'
ssh hbbft4 mv '~/node/node/parity.log ~/node/node/parity_$(date "+%Y.%m.%d-%H.%M.%S").log'