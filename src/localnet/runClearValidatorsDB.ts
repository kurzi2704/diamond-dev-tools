

// the RPC Nodes holds the data, 
// all other nodes get deleted the caches.

import { NodeManager } from "../net/nodeManager";

async function run() {

  const nodeManager = NodeManager.get();

  for (let n of nodeManager.nodeStates) {
    if (n.nodeID > 0) {
      await n.clearDB();
    }
  }

  nodeManager.rpcNode = new NodeState(0, undefined, undefined);

  if (nodeManager.rpcNode) {
    nodeManager.rpcNode.clearDB();
  }
  
}

run();