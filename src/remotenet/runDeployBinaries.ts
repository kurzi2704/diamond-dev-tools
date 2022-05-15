
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

  console.log('Looking up local nodes directory:', nodesDirAbsolute);

  const localBinary = `../openethereum/target/release/openethereum`;
  const sha1LocalCmdResult = cmd(`sha1sum ${localBinary}`);
  const sha1Local = getSha1FromCmdResult(sha1LocalCmdResult);

  console.log(`updating to openethereum client wtih sha1sum: ${sha1Local}`);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    console.log(`=== Node ${node.nodeID} ===`);

    const nodeName = `hbbft${node.nodeID}`;
    //todo: handling for first time install. probably this will crash if there is no openethereum available on target.
    const sha1RemoteCmdResult = cmdR(nodeName, `sha1sum ~/dmdv4-testnet/openethereum`);
    const sha1Remote = getSha1FromCmdResult(sha1RemoteCmdResult);
    console.log(`sha1remote: ${sha1Remote}`);

    if (sha1Local == sha1Remote) {
      console.log(`${nodeName} already up to date, skipping binary update.`);
      continue;
    }

    console.log('deploying openethereum executable.');
    const scpCommandExe = `scp -C ../openethereum/target/release/openethereum ${nodeName}:~/dmdv4-testnet`;
    cmd(scpCommandExe);
  }


}


run();