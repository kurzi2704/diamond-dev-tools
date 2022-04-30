import { cmd, cmdR } from "../remoteCommand";


try {
  cmdR('hbbft1', 'mkdir -p ~/dmdv4-testnet-rpc/');
} catch (error) {

}

const nodesSubdir = 'testnet/nodes';
const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

const scpRpcCommand = `scp -pr ${nodesDirAbsolute}/rpc_node/* hbbft1:~/dmdv4-testnet-rpc`;
cmd(scpRpcCommand);

try {
  //copy openethereum from main node if RPC node is already set up.
  cmdR('hbbft1', 'cp ~/dmdv4-testnet/openethereum ~/dmdv4-testnet-rpc/');
} catch (error) {

}
