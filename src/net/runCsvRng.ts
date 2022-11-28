import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";



async function run() {

  const web3 = ConfigManager.getWeb3();

  const contractManager = ContractManager.get();

  const rng_contract = await ContractManager.get().getRandomHbbft();

  const latestBlockNumber = await web3.eth.getBlockNumber();
  let numberOfBlocksToLog = 1000;

  if ( numberOfBlocksToLog > latestBlockNumber ){
    numberOfBlocksToLog = latestBlockNumber;
  }


  for(let blockNumber = latestBlockNumber - numberOfBlocksToLog; blockNumber <= latestBlockNumber; blockNumber++) {
    const block = await web3.eth.getBlock(blockNumber);
    
    let extraData = block.extraData;
    let rng_from_contract = await rng_contract.methods.currentSeed().call({}, blockNumber);

    console.log(`block: ${blockNumber} extraData: ${extraData} rng_from_contract: ${rng_from_contract}`);
    // block.timestamp
    
  }

}

run();