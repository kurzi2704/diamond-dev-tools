import { sleep } from "../utils/time";
import { getNodesFromCliArgs } from "./remotenetArgs";
import { startRemoteNode } from "./startRemoteNode";
import { stopRemoteNode } from "./stopRemoteNode";

async function run() {
    const nodes = await getNodesFromCliArgs();
    for (let n of nodes) {
      const nodeName = `hbbft${n.nodeID}`;
      console.log(`=== ${nodeName} ===`);
  
      stopRemoteNode(n);
      startRemoteNode(n);
    
    };
}

run();