
// the RPC Nodes holds the data, 
// all other nodes get deleted the caches.

import { ConfigManager } from "../configManager";
import { NodeManager } from "../net/nodeManager";
import fs from "fs";

async function runRestoreValidatorsDB() {

  const config = ConfigManager.getConfig();
  const backupDir = `testnet/${config.nodesDir}/dbbackup`;

  if (!fs.existsSync(backupDir)) {
    console.log(`backup directory not found: ${backupDir}`);
    return;
  } else {
    console.log(`Restoring DB from ${backupDir}`);
    //await NodeManager.restoreValidatorsDB(backupFile);

    const nodeManager = NodeManager.get();

    for (let n of nodeManager.nodeStates) {
      if (n.nodeID > 0) {
        await n.clearDB();
        await n.restoreDB(backupDir);
      }
    }
  }
}

runRestoreValidatorsDB()