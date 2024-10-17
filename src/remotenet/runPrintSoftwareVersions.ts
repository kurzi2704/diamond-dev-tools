import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {

  console.warn(`this script still exists only for compatibility reasons. try to use remotenet-csv-version instead for better results.`);
  const nodes = await getNodesFromCliArgs();
  const installDir = ConfigManager.getRemoteInstallDir();
  nodes.forEach((n) => {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);
    cmdR(nodeName, `~/${installDir}/diamond-node --version`);
    cmdR(nodeName, `sha1sum ~/${installDir}/diamond-node`);
  });
}

// todo find better command, this kind of hard kills it.
run();
