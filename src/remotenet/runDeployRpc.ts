import { cmd, cmdR } from "../remoteCommand";


  try {
    cmdR('hbbft1', 'mkdir -p ~/hbbft_testnet/node-rpc/');
  } catch (error) {
  }

  const nodesSubdir = 'testnet/nodes';
  const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

  const scpRpcCommand = `scp -pr ${nodesDirAbsolute}/rpc_node/* hbbft1:~/hbbft_testnet/node-rpc`;
  cmd(scpRpcCommand);
  
  try {
    //copy openethereum from main node if RPC node is already set up.
    cmdR('hbbft1', 'cp ~/hbbft_testnet/node/openethereum ~/hbbft_testnet/node-rpc/');
  } catch (error) {

  }
