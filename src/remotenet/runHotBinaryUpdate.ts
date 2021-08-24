import * as child from 'child_process';
import { cmdR } from '../remoteCommand';
import { executeOnRemotes, transferFilesToRemote, transferFilesToRemotes, transferFileToRemote } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

async function run() {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());
  const args = parseRemotenetArgs();

  const nodes =  await getNodesFromCliArgs();

  nodes.forEach(async node =>  {
    const nodeName = `hbbft${node.nodeID}`;
    console.log(`stopping ${nodeName}`);
    try {
      await cmdR(nodeName, 'screen -X -S node_test quit');
    } catch (e) {
      console.log('error durring stopping. probably screen not running. ignoring problem.');
    }
    
    console.log(`updating openethereum on ${nodeName}`);
    await transferFileToRemote("../openethereum/target/release/openethereum",nodeName);
    console.log(`starting node: ${nodeName}`);
    
    await cmdR(nodeName, "screen -S node_test -d -m ~/hbbft_testnet/node/start.sh");
  });
  //todo find better command, this kind of hard kills it.

  

}


run();