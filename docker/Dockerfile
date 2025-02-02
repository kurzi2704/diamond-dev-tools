from ubuntu:22.04


RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl
#    && rm -rf /var/lib/apt/lists/*

RUN pwd

RUN git clone https://github.com/DMDcoin/dmdv4-testnet.git 

WORKDIR /dmdv4-testnet

ARG DMD_NODE_GIT_TARGET=" --branch main "

RUN ./_setup-build-from-source-base.sh

ARG DMD_NODE_BUILD_FLAGS=" --release "

ARG RUST_BACKTRACE=0

RUN ./build-from-source-fast.sh

ENV TOML_FILE=rpcnode.toml
ENV DMD_NODE_ADDITONAL_STARTUP_ARGS=

# HTTP JSON-RPC Port
EXPOSE 54100/tcp 
# Websockdets Port
EXPOSE 54200/tcp

# Start Command.
CMD /dmdv4-testnet/diamond-node-git/target/release/diamond-node --config $TOML_FILE $DMD_NODE_ADDITONAL_STARTUP_ARGS