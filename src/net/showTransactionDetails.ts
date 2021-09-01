

import { ConfigManager } from "../configManager";


async function run() {
  
  var args = process.argv.slice(2);
  console.log('myArgs: ', args);

  if (args.length != 1) {
    console.log('Error: expected 1 argument with the transaction hash.');
    return;
  }

  const web3 = ConfigManager.getWeb3();

  const tx = await web3.eth.getTransaction(args[0]);

  console.log(tx);
}

run();