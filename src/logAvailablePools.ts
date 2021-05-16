
import { ConfigManager } from './configManager';
import { ContractManager } from './contractManager'; 

async function logHeaders() {

  const web3 = ConfigManager.getWeb3();
  // const testConfig = ConfigManager.getConfig();
  const contractManager = new ContractManager(web3);

  const validatorSet = contractManager.getValidatorSetHbbft();

  //const currentValidaorsvalidatorSet.methods.getValidators();
  
  const latestBlock = await web3.eth.getBlockNumber();

  //const numOfBlocksToDisplay = Math.min(latestBlock, 255);

  const numOfBlocksToDisplay = latestBlock;

  for(let i = numOfBlocksToDisplay; i >= 0; i--) {
    
    const blockToAnalyse = latestBlock - i;
    const blockHeader = await web3.eth.getBlock(blockToAnalyse);

    console.log( `${blockHeader.number} ${blockHeader.hash} ${blockHeader.extraData} ${blockHeader.difficulty}`);


  }
}

logHeaders();