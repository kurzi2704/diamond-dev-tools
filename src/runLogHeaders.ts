
import { ConfigManager } from './configManager';
import { ContractManager } from './contractManager'; 

// const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

async function logHeaders() {

  const web3 = ConfigManager.getWeb3();
  // const testConfig = ConfigManager.getConfig();
  const contractAddresses = ContractManager.getContractAddresses();
  
  const latestBlock = await web3.eth.getBlockNumber();

  //const numOfBlocksToDisplay = Math.min(latestBlock, 255);

  const numOfBlocksToDisplay = latestBlock;

  let lastTimeStamp = 0;

  //console.log(``);
  console.log( `"block";"hash";"extraData";"timestamp";"date";"duration"`);




  for(let i = numOfBlocksToDisplay; i >= 0; i--) {
    
    const blockToAnalyse = i;
    const blockHeader = await web3.eth.getBlock(blockToAnalyse);

    const thisTimeStamp = Number.parseInt(String(blockHeader.timestamp));
    console.log( `${blockHeader.number};"${blockHeader.hash}";"${blockHeader.extraData}";${blockHeader.timestamp};"${new Date(thisTimeStamp * 1000).toISOString()}";${lastTimeStamp - thisTimeStamp}`);
    //console.log( `${blockHeader.number} ${blockHeader.hash} ${blockHeader.extraData} ${blockHeader.timestamp} ${new Date(thisTimeStamp * 1000).toUTCString()} ${lastTimeStamp - thisTimeStamp}`);

    lastTimeStamp = thisTimeStamp;
    
    //if (blockHeader.timestamp is number)
    //lastTimeStamp = Number.parseInt(blockHeader.timestamp);
    

  }
}

logHeaders();