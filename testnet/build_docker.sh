cp ../../diamond-node/target/release/diamond-node .
docker build --no-cache -t diamond-node .
rm diamond-node