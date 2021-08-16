import * as child from 'child_process';
import fs from 'fs';

import { cmd, cmdR } from '../remoteCommand';

import { NodeManager } from "../regression/nodeManager";
import { ContractManager } from '../contractManager';

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

export async function executeOnAllRemotes(shellCommand: string, numberOfNodes: number | undefined = undefined, onlyUnavailable: boolean = false) {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());
  const nodeManager = NodeManager.get();
  let numOfNodes = numberOfNodes ?? nodeManager.nodeStates.length;

  for(let i = 1; i <=  numOfNodes; i++) {
    
    const nodeName = `hbbft${i}`;

    let executeOnThisRemote = true;
    if (onlyUnavailable)
    {
      console.log('only shutting down unavailable nodes. querying for availability.');
      const contractManager = await ContractManager.get();
      const node = nodeManager.getNode(i);
      if (node.address) {
        
        
        executeOnThisRemote = !await contractManager.isValidatorAvailable(node.address);
        if (!executeOnThisRemote) {
          console.log('Skipping Node that is available:', node.address);
        }
      }
      
    }

    if (executeOnThisRemote) {
      try {
        cmdR(nodeName, shellCommand);
      }
      catch (e) {
        console.log(`Error on ${nodeName}`);
      }
    }
  }

  console.log(`finished all commands`)
}
