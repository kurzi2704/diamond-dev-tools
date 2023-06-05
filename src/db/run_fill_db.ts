import createConnectionPool from "@databases/pg";
import { ConfigManager } from "../configManager";
import { ContractManager, StakeChangedEvent } from "../contractManager";
import { DbManager, convertPostgresBitsToEthAddress } from "./database";
import { truncate0x } from "../utils/hex";
import { sleep } from "../utils/time";
import { times } from "underscore";
import { Node } from "./schema";

// class Node {
//     public constructor(public string
// }


async function buildEventCache(fromBlock: number, toBlock: number, contractManager: ContractManager) {

}
class EventCache {

    // private lastEventIndex = 0;

    public constructor(public fromBlock: number, public toBlock: number, public storedEvents: StakeChangedEvent[]) {

    }

    public getEvents(blockNumber: number) : StakeChangedEvent[] {
        if (blockNumber < this.fromBlock || blockNumber > this.toBlock) {
            throw new Error(`blockNumber ${blockNumber} is not in range ${this.fromBlock} - ${this.toBlock}`);
        }

        // ok this could be implemented in a more efficient way.
        // but we do not have many events, so this is ok for now.
        let result = this.storedEvents.filter((event) => event.blockNumber == blockNumber);
        return result;
    }
}

async function run() {

    // we start from head of the chain to the tail.
    // we process each block.

    let contractManager = ContractManager.get();
    let web3 = contractManager.web3;
    let dbManager = new DbManager();

    let currentBlock = dbManager.getLastProcessedBlock();
    console.log(`currentBlock: ${currentBlock}`);

    let latest_known_block = await web3.eth.getBlockNumber(); 
    let blockBeforeTimestamp = 0;
    let lastBlocksTimestamp = 0;

    let lastInsertedPosdaoEpoch = - 1;


    // let knownNodes = {};
    let knownNodes: { [name: string]: Node } = {};

    let nodesFromDB = await dbManager.getNodes();


    for (let nodeFromDB of nodesFromDB) {

        //nodeFromDB.pool_address
        let ethAddress = convertPostgresBitsToEthAddress(nodeFromDB.pool_address);
        knownNodes[ethAddress] = nodeFromDB;
    }

    // let connectionString = `postgres://postgres:${pw}@38.242.206.145:5432/postgres`;

    // let dbConnection = createConnectionPool(connectionString);

    // let currentStakeUpdates = contractManager.getStakeUpdatesEvents(blockHeader.number);
    
    // get's the StakeUpdateEvents from current block and latest known block.
    
    let lastProcessedBlock = await dbManager.getLastProcessedBlock();
    

   
    
    let currentBlockNumber = lastProcessedBlock ? lastProcessedBlock.block_number : 0;

    let eventCache = await buildEventCache(currentBlockNumber, latest_known_block, contractManager);
    
    //let currentStakePlaceEvents = await contractManager.getStakeUpdateEvents(lastProcessedBlock, );


    while (currentBlockNumber <= latest_known_block) {

        if (currentBlockNumber ==  latest_known_block) {
            latest_known_block = await web3.eth.getBlockNumber();

            let blockHeader = await web3.eth.getBlock(currentBlockNumber);
            const { timeStamp, duration, transaction_count, txs_per_sec, posdaoEpoch } = await contractManager.getBlockInfos(blockHeader, blockBeforeTimestamp);
            //console.log(`"${blockHeader.number}","${blockHeader.hash}","${blockHeader.extraData}","${blockHeader.timestamp}","${new Date(timeStamp * 1000).toISOString()}","${duration}","${num_of_validators}","${transaction_count}","${txs_per_sec.toFixed(4)}"`);
            // console.log( `${blockHeader.number} ${blockHeader.hash} ${blockHeader.extraData} ${blockHeader.timestamp} ${new Date(thisTimeStamp * 1000).toUTCString()} ${lastTimeStamp - thisTimeStamp}`);
            
            //lastTimeStamp = thisTimeStamp;
            //blockHeader = blockBefore;
            dbManager.insertHeader(blockHeader.number, truncate0x(blockHeader.hash), duration, new Date(timeStamp * 1000), truncate0x(blockHeader.extraData), transaction_count, txs_per_sec);
            
            // events to process 
            // - ClaimedOrderedWithdrawal
            // - OrderedWithdrawal
            // - PlacedStake
            // - WithdrewStake
            // - MovedStake

            // insert the posdao information
            if (posdaoEpoch > lastInsertedPosdaoEpoch) {
                // we insert the posdao information for the epoch.
                //let posdaoEpoch = await contractManager.getPosdaoEpoch(posdaoEpoch);
                dbManager.endStakingEpoch(lastInsertedPosdaoEpoch, blockHeader.number - 1);
                dbManager.insertStakingEpoch(posdaoEpoch, blockHeader.number);
            }

            // get the validator infos.
            let validators = await contractManager.getValidators();



            for (let validator of validators) { 
                dbManager.insertEpochNode(posdaoEpoch, validator, contractManager);
            }
            
            // if there is still no change, sleep 1s
            if (currentBlockNumber == latest_known_block) {
                await sleep(1000);
            }
        }
    }

    // we managed to read the last block.
    // press q to quit.
    // this way it can be ran as a server that keeps importing new blocks.

}


run();

