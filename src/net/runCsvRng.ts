import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { blockTimeAsUTC } from "../utils/dateUtils";



async function run() {

  const web3 = ConfigManager.getWeb3();

  const toBN =  web3.utils.toBN;

  const contractManager = ContractManager.get();

  const rng_contract = await contractManager.getRandomHbbft();

  const latestBlockNumber = await web3.eth.getBlockNumber();
  //let numberOfBlocksToLog = 1000;

  // if ( numberOfBlocksToLog > latestBlockNumber ){
  //   numberOfBlocksToLog = latestBlockNumber;
  // }


  for(let blockNumber = latestBlockNumber; blockNumber > 1; blockNumber--) {
    const block = await web3.eth.getBlock(blockNumber);
    
    const extraData = block.extraData;
    const timestamp = blockTimeAsUTC(block.timestamp);
    let rng_from_contract = toBN(0);
    let rng_from_contract_historic = toBN(0);

    try {
      rng_from_contract = web3.utils.toBN(await rng_contract.methods.currentSeed().call({}, blockNumber));
    } catch (e){

    }

    try {
      rng_from_contract_historic  = web3.utils.toBN(await rng_contract.methods.getSeedHistoric(blockNumber).call());
    } catch (e) {
      console.log("Get historic seed failed:", e);
    }

    let health_from_contract = false;
    try {
      let health_from_contract_BN = web3.utils.toBN(await rng_contract.methods.currentSeed().call({}, blockNumber));
      health_from_contract = !health_from_contract_BN.isZero();
    } catch (e) {
      console.log("Get health faled:", e);
    }
 
    const extraDataBN = web3.utils.toBN(extraData);

    const extraDataEqualsSeed = extraDataBN.eq(rng_from_contract);
    const extraDataEqualsHistoric = extraDataBN.eq(rng_from_contract_historic);

    console.log(`block: ${blockNumber} time: ${timestamp} extraDataEqualsSeed: ${extraDataEqualsSeed} extraDataEqualsHistoric: ${extraDataEqualsHistoric} health: ${health_from_contract} extraData: ${extraData} rng_from_contract: ${rng_from_contract.toString('hex')} rng_from_contract_historic: ${rng_from_contract_historic.toString('hex')}`);
    // block.timestamp
    
  }

}

run();