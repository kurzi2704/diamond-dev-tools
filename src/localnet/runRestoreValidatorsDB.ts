// the RPC Nodes holds the data,
// all other nodes get deleted the caches.

import fs from 'fs';
import { ConfigManager } from '../configManager';
import { NodeManager } from '../net/nodeManager';

async function runRestoreValidatorsDB() {
  const config = ConfigManager.getConfig();
  const backupDir = `testnet/${config.nodesDir}/dbbackup`;

  if (!fs.existsSync(backupDir)) {
    console.log(`backup directory not found: ${backupDir}`);
  } else {
    console.log(`Restoring DB from ${backupDir}`);
    // await NodeManager.restoreValidatorsDB(backupFile);

    const nodeManager = NodeManager.get();

    for (const n of nodeManager.nodeStates) {
      if (n.nodeID > 0) {
        await n.clearDB();
        await n.restoreDB(backupDir);
      }
    }
  }
}

runRestoreValidatorsDB();
