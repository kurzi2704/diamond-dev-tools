import createConnectionPool from "@databases/pg";
import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { DbManager } from "./database";
import { truncate0x } from "../utils/hex";
import { sleep } from "../utils/time";
import { times } from "underscore";



async function run() {

    // we start from head of the chain to the tail.
    // we process each block.


    let contractManager = ContractManager.get();
    let web3 = contractManager.web3;
    let current_block = 0;

    let dbManager = new DbManager();

    let latest_known_block = await web3.eth.getBlockNumber(); 
    let blockBeforeTimestamp = 0;
    let lastBlocksTimestamp = 0;

    let lastInsertedPosdaoEpoch = 0;

    // let connectionString = `postgres://postgres:${pw}@38.242.206.145:5432/postgres`;

    // let dbConnection = createConnectionPool(connectionString);

    while (current_block <= latest_known_block) {

        if (current_block ==  latest_known_block) {
            latest_known_block = await web3.eth.getBlockNumber();

            let blockHeader = await web3.eth.getBlock(current_block);
            const { timeStamp, duration, transaction_count, txs_per_sec } = await contractManager.getBlockInfos(blockHeader, blockBeforeTimestamp);
            //console.log(`"${blockHeader.number}","${blockHeader.hash}","${blockHeader.extraData}","${blockHeader.timestamp}","${new Date(timeStamp * 1000).toISOString()}","${duration}","${num_of_validators}","${transaction_count}","${txs_per_sec.toFixed(4)}"`);
            // console.log( `${blockHeader.number} ${blockHeader.hash} ${blockHeader.extraData} ${blockHeader.timestamp} ${new Date(thisTimeStamp * 1000).toUTCString()} ${lastTimeStamp - thisTimeStamp}`);
            
            //lastTimeStamp = thisTimeStamp;
            //blockHeader = blockBefore;
            dbManager.insertHeader(blockHeader.number, truncate0x(blockHeader.hash), duration, new Date(timeStamp * 1000), truncate0x(blockHeader.extraData), transaction_count, txs_per_sec);
            

            // insert the posdao information

            //let epochNumber = contractManager.getEpoch(blockHeader.number);

            

            // if there is still no change, sleep 1s
            if (current_block == latest_known_block) {
                await sleep(1000);
            }
        }
    }

    // we managed to read the last block.

    // press q to quit.
    // this way it can be ran as a server that keeps importing new blocks.



}


run();