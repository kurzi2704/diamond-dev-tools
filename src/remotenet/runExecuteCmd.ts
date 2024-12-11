import { ConfigManager } from '../configManager';
import { executeOnRemotes } from './executeOnRemotes';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const { nodeBranch } = ConfigManager.getConfig();
  const installDir = ConfigManager.getRemoteInstallDir();
  const nodesToExecute = await getNodesFromCliArgs();
  executeOnRemotes(`mv ~/${installDir}/node.toml ~/${installDir}/validator_node.toml `, nodesToExecute);
  executeOnRemotes(`cd ~/${installDir}/openethereum-3.x && git pull && git checkout ${nodeBranch}`, nodesToExecute);
}

run();
