
// the RPC Nodes holds the data, 
// all other nodes get deleted the caches.

import { ConfigManager } from "../configManager";
import { NodeManager } from "../net/nodeManager";
import fs from "fs";

async function runRestoreValidatorsDB() {

  const config = ConfigManager.getConfig();
  const backupFile = `testnet/${config.nodesDir}/db-backup.tar.gz`;

  if (!fs.existsSync(backupFile)) {
    console.log(`backup file not found: ${backupFile}`);
    return;
  } else {
    console.log(`Restoring DB from ${backupFile}`);
    //await NodeManager.restoreValidatorsDB(backupFile);

    const nodeManager = NodeManager.get();

    for (let n of nodeManager.nodeStates) {
      if (n.nodeID > 0) {
        await n.clearDB();
        await n.restoreDB(backupFile);
      }
    }
  }
}

runRestoreValidatorsDB()