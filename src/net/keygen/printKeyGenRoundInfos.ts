import { ContractManager } from "../../contractManager";
import { toNumber } from "../../utils/numberUtils";


//const blockToStart = 2500;
// const blockToEnd = 2932;

const blockToStart = 300;
const blockToEnd = 905;

async function printKeyGenRoundInfos() {

    const contractManager = ContractManager.get();

    let lastKeyGenRound = 0;
    let lastEpoch = 0;
    let lastEventBlockNumber = blockToStart;


    const startBlockNumber = await contractManager.getEpochStartBlock(blockToStart);
    const startBlock = await contractManager.web3.eth.getBlock(startBlockNumber);

    let startTime = toNumber(startBlock.timestamp);


    for (let blockNumber = blockToStart; blockNumber < blockToEnd; blockNumber++) {
        //const keyGenRound = await contractManager.getKeyGenRound(blockNumber);
        //console.log(`Block number: ${blockNumber}, keyGenRound: ${keyGenRound}`);
    
        const keyGenRound = await contractManager.getKeyGenRound(blockNumber);
        const epoch = await contractManager.getEpoch(blockNumber);

        //if (lastKeyGenRound !== keyGenRound || lastEpoch !== epoch) {
            {

            const block = await contractManager.web3.eth.getBlock(blockNumber);
            const blockTime = toNumber(block.timestamp);
            
            const blocksPassed = blockNumber - lastEventBlockNumber;
            const blockTimePassed = blockTime - startTime;

            const pending = await contractManager.getPendingValidators(blockNumber);

            console.log(`Block number: ${blockNumber}, keyGenRound: ${keyGenRound}, epoch: ${epoch}, blocksPassed ${blocksPassed}, blockTimePassed: ${blockTimePassed}, pending: ${pending.length}`);
            lastKeyGenRound = keyGenRound;
            lastEpoch = epoch;
            lastEventBlockNumber = blockNumber;
            startTime = blockTime;
        }
    }

}

printKeyGenRoundInfos();