import { ConfigManager } from '../configManager';
import { executeOnRemotes, executeOnRemotesAsync } from './executeOnRemotes';
import { getNodesFromCliArgs } from './remotenetArgs';

async function runDBRollback() {
  const { openEthereumBranch } = ConfigManager.getConfig();
  const installDir = ConfigManager.getRemoteInstallDir();
  const nodesToExecute = await getNodesFromCliArgs();
  
  for(let i = 1; i <= 100; i++) {
    console.log("Run: ", i);

    // let x = async () => {
    // };
    // x();

    await executeOnRemotesAsync(`cd ~/${installDir}/ && ./diamond-node -c=validator_node.toml db reset 50`, nodesToExecute);
  }
}

runDBRollback();
