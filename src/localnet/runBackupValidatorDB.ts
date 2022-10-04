import { ConfigManager } from "../configManager";
import fs from "fs";
import { NodeManager } from "../net/nodeManager";
import { cmd } from "../remoteCommand";


async function runCreateValidatorsDBBackup() {

  const config = ConfigManager.getConfig();
  const backupFile = `testnet/${config.nodesDir}/dbbackup`;

  if (fs.existsSync(backupFile)) {
    cmd(`rm -r ${backupFile}`);
  }

  //console.log(`Restoring DB from ${backupFile}`);
  //await NodeManager.restoreValidatorsDB(backupFile);

  const nodeManager = NodeManager.get();
  const node = nodeManager.nodeStates[0];
  const source = `testnet/${config.nodesDir}/${node.nodeID}/data/chains`;

  console.log(`deleting current backupFile: ${backupFile}`);
  cmd(`cp -r ${source} ${backupFile}`);

  // for (let n of nodeManager.nodeStates) {
  //   if (n.nodeID > 0) {
  //     await n.clearDB();
  //     await n.restoreDB(backupFile);
  //   }
  // }

}

runCreateValidatorsDBBackup();