import { ConfigManager } from '../configManager';
import { executeOnRemotes } from './executeOnRemotes';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const { openEthereumBranch } = ConfigManager.getConfig();
  const installDir = ConfigManager.getRemoteInstallDir();
  const nodesToExecute = await getNodesFromCliArgs();
  
  for(let i = 0; i < 50; i++) {
    console.log("Run: ", i);

    executeOnRemotes(`cd ~/${installDir}/ && ./diamond-node -c=validator_node.toml db reset 50`, nodesToExecute);
  }
  
}

run()
