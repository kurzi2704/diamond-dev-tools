

import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getNodesFromCliArgs } from './remotenetArgs';
import { startRemoteNode } from './startRemoteNode';
import { stopRemoteNode } from './stopRemoteNode';

async function run() {
  const nodes = await getNodesFromCliArgs();
  const { installDir } = ConfigManager.getConfig();
  for (let n of nodes) {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    // pull the latest code.
    // if success, restart the node (= stop and start)
    try {
        cmdR(nodeName, `cd ~/${installDir} && git pull`);
        // todo: if nothing got pulled we could skip the restart ?!

    } catch (e) {
        console.log(`Error pulling latest code for ${nodeName}. skipping the restart fot this node.`);
        console.log(e);
        continue;
    }

    //cmdR(n.sshNodeName(),  'screen -X -S node_test quit');
    stopRemoteNode(n);

    startRemoteNode(n);
    
  };
}

run();
