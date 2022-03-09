import * as child from 'child_process';
import fs from 'fs';

import { cmd, cmdR } from '../remoteCommand';

import { NodeManager, NodeState } from "../regression/nodeManager";
import { ContractManager } from '../contractManager';
import { getNodesFromCliArgs, IRemotnetArgs } from './remotenetArgs';


function doLocalFileExistCheck(localPath: string) {
  if (!fs.existsSync(localPath)){
    const message = `Error transfering files: could not find local directory: ${localPath}`;
    console.log(message);
    throw Error(message);
  }
}


export async function transferFileToRemote(localPath: string, remoteSSHName: string ) { 

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  doLocalFileExistCheck(localPath);

  console.log(`transferring files on  ${localPath} to ${remoteSSHName}`);
  cmd(`scp ${localPath} ${remoteSSHName}:~/dmdv4-testnet`);
  

}

export async function transferFilesToRemote(localPath: string, remoteSSHName: string ) { 

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  doLocalFileExistCheck(localPath);

  console.log(`transferring files on  ${localPath} to ${remoteSSHName}`);
  cmd(`scp -r ${localPath}/* ${remoteSSHName}:~/dmdv4-testnet`);
  

}

export async function transferFilesToRemotes(localPath: string, nodes: Array<NodeState> ) { 

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  doLocalFileExistCheck(localPath);

  for(const node of nodes) {
    const nodeName = node.sshNodeName();
    console.log(`patching ${nodeName} ${localPath} to `);
    cmd(`scp -r ${localPath}/* ${nodeName}:~/dmdv4-testnet`);
  }

}

// interpretes the CLI args and executes the shellCommand on matching nodes.
export async function executeOnRemotesFromCliArgs(shellCommand: string) {

  const nodes = await getNodesFromCliArgs();
  nodes.forEach(n=> {
    const nodeName = `hbbft${n.nodeID}`;
    try {
      cmdR(nodeName, shellCommand);
    } catch (e ) {
      console.error(`error on: ${n.nodeID}`);
    }
    
  });
}


export async function executeOnRemotes(shellCommand: string, nodes: Array<NodeState>) {
  nodes.forEach(n=> {
    const nodeName = `hbbft${n.nodeID}`;
    try {
      
      console.log(`=== ${nodeName} ===`);
      cmdR(nodeName, shellCommand);
    } catch (e) {
      console.log(`Error on ${nodeName}`, e);
    }
    
  });
}

export async function executeOnAllRemotes(shellCommand: string, numberOfNodes: number | undefined = undefined, onlyUnavailable: boolean = false, miningAddress: string | undefined = undefined) {

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
    else if (miningAddress) {
      const node = nodeManager.getNode(i);
      if (node.address === miningAddress) {
        console.log(`Node for mining address ${miningAddress} : ${nodeName}`);
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
