import * as child from 'child_process';
import { cmd, cmdR } from '../remoteCommand';
import { executeOnRemotes, transferFilesToRemote, transferFilesToRemotes, transferFileToRemote } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

function getSha1FromCmdResult(cmdResult: string) : string {
  return cmdResult.substring(0, 40);
}

async function run() {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());
  const args = parseRemotenetArgs();

  const nodes =  await getNodesFromCliArgs();

  const localBinary = `../openethereum/target/release/openethereum`;
  const sha1LocalCmdResult = cmd(`sha1sum ${localBinary}`);
  const sha1Local = getSha1FromCmdResult(sha1LocalCmdResult);

  for(const node of nodes) {
    
    
    const nodeName = `hbbft${node.nodeID}`;

    const sha1RemoteCmdResult = cmdR(nodeName, `sha1sum ~/hbbft_testnet/node/openethereum`);
    const sha1Remote = getSha1FromCmdResult(sha1RemoteCmdResult);

    if (sha1Local == sha1Remote) {
      console.log(`${nodeName} already up to date, skipping binary update.`);
      continue;
    }

    console.log(`stopping ${nodeName}`);
    try {
      await cmdR(nodeName, 'screen -X -S node_test quit');
    } catch (e) {
      console.log('error durring stopping. probably screen not running. ignoring problem.');
    }
    
    console.log(`updating openethereum on ${nodeName}`);
    await transferFileToRemote(localBinary,nodeName);
    console.log(`starting node: ${nodeName}`);
    
    await cmdR(nodeName, "screen -S node_test -d -m ~/hbbft_testnet/node/start.sh");
  };
  //todo find better command, this kind of hard kills it.

  

}


run();