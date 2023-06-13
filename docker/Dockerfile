from ubuntu:22.04


ENV BUILD=release
ENV GIT_BRANCH=main


RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl
#    && rm -rf /var/lib/apt/lists/*

RUN pwd

RUN git clone https://github.com/DMDcoin/dmdv4-testnet.git --branch $GIT_BRANCH

WORKDIR /dmdv4-testnet

RUN ./setup-build-from-source.sh

ENV DMD_NODE_BUILD_FLAGS="-j$(nproc) --release"
RUN ./build-from-source-base.sh

ENV TOML_FILE=fullnode.toml
# Start Command.
CMD /dmdv4-testnet/diamond-node-git/target/$BUILD/diamond-node --config $TOML_FILE
# CMD /dmdv4-testnet/rpc.sh
# CMD sleep 100000
