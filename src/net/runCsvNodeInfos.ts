import { min } from "underscore";
import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";


async function runCsvNodeInfos() {

  const web3 = ConfigManager.getWeb3();
  const toBN =  web3.utils.toBN;
  const contractManager = ContractManager.get();
  
  let pools = await contractManager.getAllPools();

  
  let csvLines : Array<String> = [];

  for (let pool of pools) {
    console.log('pool:', pool);

    let miningAddress = await contractManager.getAddressMiningByStaking(pool);
    let availableSince = await contractManager.getAvailableSince(miningAddress);
    
    
    csvLines.push(`${pool};${availableSince}`);
  }


  csvLines.forEach((x) => console.log(x));

  

}

runCsvNodeInfos();