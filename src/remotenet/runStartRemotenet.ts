import * as child from 'child_process';
import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';
import { startRemoteNode } from './startRemoteNode';

async function run() {
  const pwdResult = child.execSync('pwd');
  console.log(`operating in: ${pwdResult.toString()}`);

  const nodesToExecute = await getNodesFromCliArgs();
  

  for (const n of nodesToExecute) {
    
    startRemoteNode(n);
    
  }
}

run();
