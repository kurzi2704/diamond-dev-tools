

import * as child from 'child_process';
import { cmdR } from '../remoteCommand';
import { NodeManager } from "../regression/nodeManager";
import { getNodesFromCliArgs } from './remotenetArgs';


function cmd(command: string) : string {
  console.log(command);
  const result = child.execSync(command);
  const txt = result.toString();
  console.log(txt);
  return txt;
}

async function run() {


  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  const nodesSubdir = 'testnet/nodes';
  const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

  console.log('Looking up local nodes directory:', nodesDirAbsolute);

  const nodes = await getNodesFromCliArgs();

  for(let i = 0; i < nodes.length; i++) {

    const node = nodes[i];
    const nodeName = `hbbft${node.nodeID}`;
    console.log(`=== Node ${nodeName} ===`);

 
    const remoteMainDir = '~/hbbft_testnet';

    console.log(`ensure main directory: ${remoteMainDir} on ${nodeName}`);
    try {
      cmdR(nodeName, `mkdir -p ${remoteMainDir}/node`);
    } catch (error) {
      // no problem, just swallow the error.
    }
    

    const scpCommand = `scp -pr ${nodesDirAbsolute}/node${node.nodeID}/* ${nodeName}:~/hbbft_testnet/node`;
    cmd(scpCommand);

    const scpTemplateCommand = `scp -pr ${process.cwd()}/templates/* ${nodeName}:~/hbbft_testnet/node`;
    cmd(scpTemplateCommand);

  }

}


run();