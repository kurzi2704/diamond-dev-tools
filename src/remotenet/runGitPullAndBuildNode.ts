import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getBuildFromSourceCmd } from './buildFromSource';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const nodes = await getNodesFromCliArgs();
  const { openEthereumBranch } = ConfigManager.getConfig();
  const installDir = ConfigManager.getInstallDir();
  nodes.forEach((n) => {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);
    const buildFromSourceCmd = getBuildFromSourceCmd(true);
    cmdR(nodeName, buildFromSourceCmd);
  });
}

// todo find better command, this kind of hard kills it.
run();
