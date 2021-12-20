
import { nowFormatted } from "../utils/dateUtils";
import { executeOnRemotesFromCliArgs } from "./executeOnRemotes";



async function run() {

  const filename = 'log_backup_' + nowFormatted() + ".log";

  console.log('cycling current log file name to ' + filename);
  //todo find better command, this kind of hard kills it.
  //executeOnRemotesFromCliArgs("rm ~/hbbft_testnet/node/parity.log");

  const baseDir = '~/hbbft_testnet/node/';
  executeOnRemotesFromCliArgs(`mv ${baseDir}parity.log ${baseDir}${filename}`);

}

run();


