
import { ConfigManager } from "../configManager";
import { cmdR } from "../remoteCommand";
import { executeOnRemotesFromCliArgs } from "./executeOnRemotes";
import { getNodesFromCliArgs } from "./remotenetArgs";


function getDateFormatted()
    {
      const d = new Date(Date.now());

      //const dateString = (d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "0" + d.getDate()).slice(-2) + "-" +
      // "_" + ("0" + d.getHours()).slice(-2) + "_" + ("0" + d.getMinutes()).slice(-2);


      const dateString = d.getFullYear() + "-" + ("0" + d.getMonth()) + "-" + d.getDate()  +
       "_" + ("0" + d.getHours()).slice(-2) + "_" + ("0" + d.getMinutes()).slice(-2);

      return dateString;
    }

async function run() {

  const baseDir = '~/hbbft_testnet/node/';

  const nodes =  await getNodesFromCliArgs();


  const remoteBackupFile = baseDir + "messages_backup_" + getDateFormatted() + ".tar.gz";
  console.log('cycling current messages as tar archive to ' + remoteBackupFile);

  for(let i = 0; i <nodes.length; i++) {

    const node = nodes[i];
    const nodeName = node.sshNodeName();

    try {

      console.log('creating backup archive on ', nodeName);
      cmdR(nodeName, `tar -zcf ${remoteBackupFile} -C ~/hbbft_testnet/node/data/messages/ .`);
      console.log('deleting files after creating a backup on ', nodeName);
      cmdR(nodeName, 'rm -r ~/hbbft_testnet/node/data/messages');

    } catch {
      //ignore
    }
    
  }

    



}

run();


