import { ConfigManager } from "../configManager";
import { NodeState } from "../net/nodeManager";
import { cmdR } from "../remoteCommand";

export function startRemoteNode(node: NodeState) {

    const { installDir } = ConfigManager.getConfig();
    const nodeName = `hbbft${node.nodeID}`;
    let runOnThisNode = true;

    try {
      const runningScreens = cmdR(nodeName, 'screen -ls');

      if (runningScreens.includes('node_test')) {
        console.log('WARNING: node_test screen already running, not starting another one.!!');
        runOnThisNode = false;
      } else {

      }
    } catch (e) {
      // if no screen, we get an error - all good.
    }

    if (runOnThisNode) {
      cmdR(nodeName, `cd ${installDir} && screen -S node_test -d -m ~/${installDir}/start.sh`);
    }
}