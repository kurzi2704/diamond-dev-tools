import { BigNumber } from "bignumber.js";
import { ContractManager } from "../contractManager";


async function run() {

  console.log('Scans the network and looks watches out for nodes');
  console.log('that got included, without having their ACK transaction mined.');

  const contractManager = ContractManager.get();
  const { web3 } = contractManager;

  let blockToAnalyze = await web3.eth.getBlockNumber();
  console.log('current block: ', blockToAnalyze);
  let epochNumber = await contractManager.getEpoch(blockToAnalyze);

  console.log('epoch: ', epochNumber);

}

run();

