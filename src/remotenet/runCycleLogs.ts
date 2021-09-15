
import { executeOnRemotesFromCliArgs } from "./executeOnRemotes";


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



  const filename = 'log_backup_' + getDateFormatted() + ".log";

  console.log('cycling current log file name to ' + filename);
  //todo find better command, this kind of hard kills it.
  //executeOnRemotesFromCliArgs("rm ~/hbbft_testnet/node/parity.log");

  const baseDir = '~/hbbft_testnet/node/';
  executeOnRemotesFromCliArgs(`mv ${baseDir}/parity.log ${baseDir}${filename}`);

}

run();


