import { ContractManager } from "../contractManager";


async function run() {

    let contractManager = ContractManager.get();
    let web3 = contractManager.web3;
    let latestBlock = await web3.eth.getBlockNumber();
    let result = await contractManager.getStakeUpdateEvents(0, latestBlock);

    console.log("Stake events found: ", result.length);
}

run();