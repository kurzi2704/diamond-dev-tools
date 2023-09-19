import { Node } from "./schema";
import { DbManager } from "./database";

import { ContractManager } from "../contractManager";
import { EventProcessor } from "../eventProcessor";
import { EventVisitor } from "../eventsVisitor";
import { truncate0x } from "../utils/hex";
import { sleep } from "../utils/time";
import { ValidatorObserver } from "../validatorObserver";
import { bufferToAddress, parseEther } from "../utils/ether";


async function run() {

    // we start from head of the chain to the tail.
    // we process each block.

    let contractManager = ContractManager.get();
    let web3 = contractManager.web3;
    let dbManager = new DbManager();

    let validatorObserver = await ValidatorObserver.build(contractManager, dbManager);
    let eventVisitor = new EventVisitor(dbManager);
    let eventProcessor = new EventProcessor(contractManager, eventVisitor);

    // await dbManager.deleteCurrentData();
    // let currentBlock = await dbManager.getLastProcessedBlock();
    // console.log(`currentBlock: ${currentBlock}`);

    let latest_known_block = await web3.eth.getBlockNumber();
    let lastProcessedEpochRow = await dbManager.getLastProcessedEpoch();

    let lastInsertedPosdaoEpoch = lastProcessedEpochRow ? lastProcessedEpochRow.id : - 1;

    let knownNodes: { [name: string]: Node } = {};
    let knownNodesByMining: { [name: string]: Node } = {};
    let knownNodesStakingByMining: { [name: string]: string } = {};

    let nodesFromDB = await dbManager.getNodes();


    for (let nodeFromDB of nodesFromDB) {
        //nodeFromDB.pool_address
        let ethAddress = bufferToAddress(nodeFromDB.pool_address);
        knownNodes[ethAddress] = nodeFromDB;

        let miningAddress = bufferToAddress(nodeFromDB.mining_address);
        knownNodesByMining[miningAddress] = nodeFromDB;
        knownNodesStakingByMining[miningAddress] = ethAddress;
    }

    let lastProcessedBlock = await dbManager.getLastProcessedBlock();
    let currentBlockNumber = lastProcessedBlock ? lastProcessedBlock.block_number + 1 : 0;
    //if currentBlockNumber < latest_known_block

    let blockBeforeTimestamp = lastProcessedBlock
        ? Math.floor(lastProcessedBlock.block_time.getTime() / 1000)
        : 0;

    console.log(`importing blocks from ${currentBlockNumber} to ${latest_known_block}`);

    let insertNode = async (miningAddress: string, blockNumber: number) => {
        // retrieve node information from the contracts.
        //let miningAddress = await contractManager.getAddressMiningByStaking(poolAddress, currentBlockNumber);
        let poolAddress = (await contractManager.getAddressStakingByMining(miningAddress, blockNumber)).toLowerCase();
        let publicKey = await contractManager.getPublicKey(poolAddress, blockNumber);
        let newNode = await dbManager.insertNode(poolAddress, miningAddress, publicKey, blockNumber);

        knownNodes[poolAddress] = newNode;
        knownNodesByMining[miningAddress] = newNode;
        knownNodesStakingByMining[miningAddress] = poolAddress;
    }

    while (currentBlockNumber <= latest_known_block) {
        console.log(`processing block ${currentBlockNumber}`);

        let blockHeader = await web3.eth.getBlock(currentBlockNumber);
        const { timeStamp, duration, transaction_count, txs_per_sec, posdaoEpoch } = await contractManager.getBlockInfos(blockHeader, blockBeforeTimestamp);
        //console.log(`"${blockHeader.number}","${blockHeader.hash}","${blockHeader.extraData}","${blockHeader.timestamp}","${new Date(timeStamp * 1000).toISOString()}","${duration}","${num_of_validators}","${transaction_count}","${txs_per_sec.toFixed(4)}"`);
        // console.log( `${blockHeader.number} ${blockHeader.hash} ${blockHeader.extraData} ${blockHeader.timestamp} ${new Date(thisTimeStamp * 1000).toUTCString()} ${lastTimeStamp - thisTimeStamp}`);
        blockBeforeTimestamp = timeStamp;

        let delta = parseEther(await contractManager.getRewardDeltaPot(blockHeader.number));
        let reinsert = parseEther(await contractManager.getRewardReinsertPot(blockHeader.number));
        let rewardContractTotal = parseEther(await contractManager.getRewardContractTotal(blockHeader.number));
        let governanceBalance = parseEther(await contractManager.getGovernancePot(blockHeader.number));

        let unclaimed = rewardContractTotal.minus(delta.plus(reinsert));

        //lastTimeStamp = thisTimeStamp;
        //blockHeader = blockBefore;
        await dbManager.insertHeader(
            blockHeader.number,
            truncate0x(blockHeader.hash),
            duration,
            new Date(timeStamp * 1000),
            truncate0x(blockHeader.extraData),
            transaction_count,
            posdaoEpoch,
            txs_per_sec,
            reinsert.toString(),
            delta.toString(),
            governanceBalance.toString(),
            rewardContractTotal.toString(),
            unclaimed.toString()
        );

        if (currentBlockNumber == 0) {
            // on the first block we need to add the MOC.
            let validators = await contractManager.getValidators(currentBlockNumber);

            for (let miningAddress of validators) {
                await insertNode(miningAddress, currentBlockNumber);
            }
        }

        await eventProcessor.fetchBlockEvents(currentBlockNumber);

        const poolsSet = eventProcessor.getPoolsSet();

        for (const pool of poolsSet) {
            if (Object.keys(knownNodes).includes(pool)) {
                continue;
            }

            // retrieve node information from the contracts.
            let miningAddress = await contractManager.getAddressMiningByStaking(pool, currentBlockNumber);
            let publicKey = await contractManager.getPublicKey(pool, currentBlockNumber);
            let node = await dbManager.insertNode(pool, miningAddress, publicKey, currentBlockNumber);

            knownNodes[pool.toLowerCase()] = node;
            knownNodesByMining[miningAddress.toLowerCase()] = node;
            knownNodesStakingByMining[miningAddress.toLowerCase()] = pool;
        }

        const delegatorsSet = eventProcessor.getDelegatorsSet();
        await dbManager.insertDelegateStaker(Array.from(delegatorsSet));

        // insert the posdao information
        if (posdaoEpoch > lastInsertedPosdaoEpoch) {
            // we insert the posdao information for the epoch.
            //let posdaoEpoch = await contractManager.getPosdaoEpoch(posdaoEpoch);
            if (lastInsertedPosdaoEpoch >= 0) {
                dbManager.endStakingEpoch(lastInsertedPosdaoEpoch, blockHeader.number - 1);

                // update the rewards of last staking epoch.
                const rewards = await contractManager.getDelegateRewards(lastInsertedPosdaoEpoch, blockHeader.number);
                await dbManager.insertDelegateRewardsBulk(rewards);

                // get the validator infos.
                let rewardedValidators = await contractManager.getValidators(blockHeader.number - 1);

                for (let rewardedValidator of rewardedValidators) {

                    let pool = knownNodesStakingByMining[rewardedValidator.toLowerCase()];

                    if (!pool) {
                        console.log(`Could not find pool for mining address ${rewardedValidator}`);
                        continue;
                    }

                    let validatorReward = (await contractManager.getReward(pool, pool, lastInsertedPosdaoEpoch, blockHeader.number));
                    await dbManager.updateValidatorReward(pool, lastInsertedPosdaoEpoch, validatorReward);
                }

            }

            await dbManager.insertStakingEpoch(posdaoEpoch, blockHeader.number);
            lastInsertedPosdaoEpoch = posdaoEpoch;

            // get the validator infos.
            let validators = await contractManager.getValidators(currentBlockNumber);

            for (let validator of validators) {
                let poolAddressBin = knownNodesByMining[validator.toLowerCase()].pool_address;
                let poolAddress = bufferToAddress(poolAddressBin);
                await dbManager.insertEpochNode(posdaoEpoch, poolAddress);
            }
        }

        // fill db with events
        await eventProcessor.processEvents();
        await validatorObserver.updateValidators(currentBlockNumber);

        // if there is still no change, sleep 1s
        while (currentBlockNumber == latest_known_block) {

            // do something to make further processing possible.
            latest_known_block = await web3.eth.getBlockNumber();

            if (latest_known_block > currentBlockNumber) {
                await eventProcessor.fetchBlockEvents(currentBlockNumber);
            } else {
                await sleep(1000);
            }
        }

        currentBlockNumber += 1;
    }

    // we managed to read the last block.
    // press q to quit.
    // this way it can be ran as a server that keeps importing new blocks.

}


run();
