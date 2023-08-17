
import { ConfigManager } from '../configManager';
import { cmd, cmdR } from '../remoteCommand';

//var exec = require('child_process').exec, child;
import { getNodesFromCliArgs } from './remotenetArgs';


function getSha1FromCmdResult(cmdResult: string): string {
  return cmdResult.substring(0, 40);
}

async function run() {

  const nodes = await getNodesFromCliArgs();
  const nodesSubdir = 'testnet/nodes';
  const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

  const config = ConfigManager.getConfig();
  const networkConfig = ConfigManager.getNetworkConfig();

  console.log('Looking up local nodes directory:', nodesDirAbsolute);

  const localBinary =  `../diamond-node/target/${config.openEthereumProfile}/diamond-node`;
  const cmdResult = cmd(`sha1sum ${localBinary}`);
  const sha1LocalCmdResult = cmdResult.output;
  const sha1Local = getSha1FromCmdResult(sha1LocalCmdResult);

  console.log(`updating to diamond-node client wtih sha1sum: ${sha1Local}`);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    console.log(`=== Node ${node.nodeID} ===`);

    const nodeName = `hbbft${node.nodeID}`;
    //todo: handling for first time install. probably this will crash if there is no openethereum available on target.
    const sha1RemoteCmdResult = cmdR(nodeName, `sha1sum ~/${networkConfig.installDir}/diamond-node`);
    const sha1Remote = getSha1FromCmdResult(sha1RemoteCmdResult);
    console.log(`sha1remote: ${sha1Remote}`);

    if (sha1Local == sha1Remote) {
      console.log(`${nodeName} already up to date, skipping binary update.`);
      continue;
    }

    console.log('deploying diamond-node executable.');
    
    const scpCommandExe = `scp -C ../diamond-node/target/${config.openEthereumProfile}/diamond-node ${nodeName}:~/${networkConfig.installDir}`;
    cmd(scpCommandExe);
  }


}


run();