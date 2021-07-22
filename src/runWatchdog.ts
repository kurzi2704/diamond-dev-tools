import { ConfigManager } from "./configManager";
import { ContractManager } from "./contractManager";
import { NodeManager } from "./regression/nodeManager";
import { Watchdog } from "./watchdog";




async function runWatchdog() : Promise<Watchdog> {

  console.log('getting web3');
  const web3 = ConfigManager.getWeb3();
  console.log('getting contract manager');

  const contractManager = new ContractManager(web3);

  const nodeManager = NodeManager.get();
  const watchdog = new Watchdog(contractManager, nodeManager);

  watchdog.startWatching();

  return watchdog;
}

runWatchdog();