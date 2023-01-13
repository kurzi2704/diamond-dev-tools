import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const nodes = await getNodesFromCliArgs();
  const { installDir, openEthereumBranch } = ConfigManager.getConfig();
  nodes.forEach((n) => {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);
    cmdR(nodeName, `cd ~/${installDir}/openethereum-3.x && git checkout ${openEthereumBranch} && git pull`);
  });
}

// todo find better command, this kind of hard kills it.
run();
