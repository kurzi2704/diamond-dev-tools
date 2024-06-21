

import * as child from 'child_process';
import { cmdR } from '../remoteCommand';
import { NodeManager } from "../net/nodeManager";
import { getNodesFromCliArgs } from './remotenetArgs';
import { ConfigManager } from '../configManager';


function cmd(command: string): string {
  console.log(command);
  const result = child.execSync(command);
  const txt = result.toString();
  console.log(txt);
  return txt;
}

async function run() {


  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  const nodesDir = ConfigManager.getNodesDir();

  const nodesSubdir = 'testnet/' + nodesDir;
  const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

  console.log('Looking up local nodes directory:', nodesDirAbsolute);

  const nodes = await getNodesFromCliArgs();

  const {installDir, name} = ConfigManager.getNetworkConfig();

  let nameForChain = name.startsWith("nodes-") ? name.substring("nodes-".length) : name;

  for (let i = 0; i < nodes.length; i++) {

    const node = nodes[i];
    const nodeName = `hbbft${node.nodeID}`;
    console.log(`=== Node ${nodeName} ===`);

    const scpCommand = `scp -pr ${nodesDirAbsolute}/node${node.nodeID}/* ${nodeName}:~/${installDir}`;
    cmd(scpCommand);

    cmdR(nodeName, `cp ~/${installDir}/node.toml ~/${installDir}/validator_node.toml`);
    //cmdR(nodeName, `mkdir ~/${installDir}/data/keys/${nameForChain}`);
    cmdR(nodeName, `cp -r ~/${installDir}/data/keys/DPoSChain/* ~/${installDir}/data/keys/${nameForChain}`);
    
  }

}


run();