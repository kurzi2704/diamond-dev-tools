
import { cmd, cmdR } from '../remoteCommand';

//var exec = require('child_process').exec, child;
import { getNodesFromCliArgs } from './remotenetArgs';



async function run() {

  const nodes = await getNodesFromCliArgs();
  const nodesSubdir = 'testnet/nodes';
  const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

  console.log('Looking up local nodes directory:', nodesDirAbsolute);

  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    console.log(`=== Node ${node.nodeID} ===`);

    const nodeName = `hbbft${node.nodeID}`;
    console.log('deploying openethereum executable.');
    const scpCommandExe = `scp ../openethereum/target/release/openethereum ${nodeName}:~/hbbft_testnet/node`;
    cmd(scpCommandExe);
  }


}


run();