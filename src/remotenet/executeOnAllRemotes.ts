import * as child from 'child_process';
import fs from 'fs';

import { cmd, cmdR } from '../remoteCommand';

import { NodeManager } from "../regression/nodeManager";

export async function transferFilesToAllRemotes(localPath: string, numberOfNodes: number | undefined = undefined) { 
  
  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  if (!fs.existsSync(localPath)){
    console.log(`Error transfering files: could not find local directory: ${localPath}`);
    return;
  }

  const nodeManager = NodeManager.get();

  let numOfNodes = numberOfNodes ?? nodeManager.nodeStates.length;

  for(let i = 1; i <=  numOfNodes; i++) {

    const nodeName = `hbbft${i}`;
    console.log(`patching ${nodeName} ${localPath} to `);
    cmd(`scp -r ${localPath}/* ${nodeName}:~/hbbft_testnet/node`);
  }
}

export async function executeOnAllRemotes(shellCommand: string, numberOfNodes: number | undefined = undefined) {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());
  const nodeManager = NodeManager.get();
  let numOfNodes = numberOfNodes ?? nodeManager.nodeStates.length;

  for(let i = 1; i <=  numOfNodes; i++) {
    
    const nodeName = `hbbft${i}`;

    try {
      cmdR(nodeName, shellCommand);
    }
    catch (e) {
      console.log(`Error on ${nodeName}`);
    }
  }

  console.log(`finished all commands`)
}
