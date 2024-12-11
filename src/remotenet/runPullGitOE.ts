import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const nodes = await getNodesFromCliArgs();
  const { nodeBranch } = ConfigManager.getConfig();
  const installDir = ConfigManager.getRemoteInstallDir();
  nodes.forEach((n) => {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);
    cmdR(nodeName, `cd ~/${installDir}/diamond-node-git && git checkout ${nodeBranch} && git pull`);
  });
}

// todo find better command, this kind of hard kills it.
run();
