
import { ConfigManager } from "../configManager";
import { cmdRemoteAsync } from "../remoteCommand";
import { nowFormatted } from "../utils/dateUtils";
import { getNodesFromCliArgs } from "./remotenetArgs";

async function run() {

  const config = ConfigManager.getConfig();
  const baseDir = `~/${config.installDir}/`;
  const nodes = await getNodesFromCliArgs();

  const remoteBackupFile = baseDir + "messages_backup_" + nowFormatted() + ".tar.gz";
  console.log('cycling current messages as tar archive to ' + remoteBackupFile);

  for (let i = 0; i < nodes.length; i++) {

    const node = nodes[i];
    const nodeName = node.sshNodeName();

    try {

      console.log('creating backup archive on ', nodeName);
      await cmdRemoteAsync(nodeName, `tar -zcf ${remoteBackupFile} -C ${baseDir}data/messages/ .`);
      console.log('deleting files after creating a backup on ', nodeName);
      await cmdRemoteAsync(nodeName, `rm -r ${baseDir}data/messages`);

    } catch {
      //ignore
    }

  }

}

run();


