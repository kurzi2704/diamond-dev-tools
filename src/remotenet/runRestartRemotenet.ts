import { getNodesFromCliArgs } from "./remotenetArgs";
import { startRemoteNode } from "./startRemoteNode";
import { stopRemoteNode } from "./stopRemoteNode";

async function run() {
    const nodes = await getNodesFromCliArgs();
    for (let n of nodes) {
      const nodeName = `hbbft${n.nodeID}`;
      console.log(`=== ${nodeName} ===`);
  
  
      //cmdR(n.sshNodeName(),  'screen -X -S node_test quit');
      stopRemoteNode(n);
  
      startRemoteNode(n);
      
    };
}

run();