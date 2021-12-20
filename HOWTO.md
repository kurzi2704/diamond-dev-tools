
## Download and analyse messages

Analytical materials are stored in the testnet/testnet-analysis directory.
Messages can be downloaded from a remotenet using the `remotenet-download-messages` command.
TO analyse a stuck network this can be accelerated by only including the current validators.

`npm run remotenet-download-messages -- --current`

To analyse run

`npm run analyse-messages-pending-block`
