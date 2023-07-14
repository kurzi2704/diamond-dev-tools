import { ConfigManager } from '../configManager';
import { ContractManager } from '../contractManager';
import createConnectionPool, {sql} from '@databases/pg';
import { truncate0x } from '../utils/hex';
import { DbManager } from '../db/database';


// const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

async function logHeaders() {
  const web3 = ConfigManager.getWeb3();
  // const testConfig = ConfigManager.getConfig();

  const latestBlock = await web3.eth.getBlockNumber();

  // const numOfBlocksToDisplay = Math.min(latestBlock, 255);

  // const pw = process.env["DMD_DB_POSTGRES"];

  // let connectionString = `postgres://postgres:${pw}@38.242.206.145:5432/postgres`;

  //let dbConnection = createConnectionPool(connectionString);

  const numOfBlocksToDisplay = latestBlock;

  //let lastTimeStamp = 0;

  // console.log(``);
  console.log('"block","hash","extraData","timestamp","date","duration","num_of_validators","transaction_count","txs_per_sec"');
  
  let blockHeader = await web3.eth.getBlock(latestBlock);

  const contractManager = ContractManager.get();

  for (let i = numOfBlocksToDisplay; i >= 0; i--) {
    const blockToAnalyse = i;

    let blockBeforeTimestamp = Number.parseInt(String(blockToAnalyse > 0 ? (await web3.eth.getBlock(blockToAnalyse - 1)).timestamp : (await web3.eth.getBlock(blockToAnalyse)).timestamp));
    
    const { timeStamp, duration , transaction_count, txs_per_sec } = await contractManager.getBlockInfos(blockHeader, blockBeforeTimestamp);
    console.log(`"${blockHeader.number}","${blockHeader.hash}","${blockHeader.extraData}","${blockHeader.timestamp}","${new Date(timeStamp * 1000).toISOString()}","${duration}","${transaction_count}","${txs_per_sec.toFixed(4)}"`);
    // console.log( `${blockHeader.number} ${blockHeader.hash} ${blockHeader.extraData} ${blockHeader.timestamp} ${new Date(thisTimeStamp * 1000).toUTCString()} ${lastTimeStamp - thisTimeStamp}`);

    //lastTimeStamp = thisTimeStamp;
    //blockHeader = blockBefore;

    // if (writeToDB) {
    //   // we are not writing the latest block, because the information about the duration is not available.
    //   await  dbManager.insertHeader( blockHeader.number, truncate0x(blockHeader.hash), duration, new Date(timeStamp * 1000), truncate0x(blockHeader.extraData), transaction_count, txs_per_sec);
    // }

    

    // if (blockHeader.timestamp is number)
    // lastTimeStamp = Number.parseInt(blockHeader.timestamp);
  }


}

logHeaders();
