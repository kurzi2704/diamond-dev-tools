import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getBuildFromSourceCmd } from './buildFromSource';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const nodes = await getNodesFromCliArgs();
  const { installDir, openEthereumBranch } = ConfigManager.getConfig();
  nodes.forEach((n) => {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);
    const buildFromSourceCmd = getBuildFromSourceCmd();
    cmdR(nodeName, buildFromSourceCmd);
  });
}

// todo find better command, this kind of hard kills it.
run();
