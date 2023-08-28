import schedule from 'node-schedule';

import { ContractManager } from "./contractManager";
import { sleep } from "./utils/time";
import BigNumber from 'bignumber.js';

const START_BLOCK_NUMBER = 1;
const TIMER_SECONDS = 30;

async function sendDilutionAmount(contractManager: ContractManager, caller: string, dilutionFracrtion: number): Promise<void> {
  // diluted amounts are split 50/50 to DAO and ReinsertPot.

  const reinsertPotAddress = await contractManager.getRewardContractAddress();
  const governanceAddress = await contractManager.getGovernancePotAddress();

  const balance = BigNumber(await contractManager.web3.eth.getBalance(caller));

  const dilutionAmount = balance.div(dilutionFracrtion);

  const reinsertAmount = dilutionAmount.div(2);
  const governanceAmount = dilutionAmount.minus(reinsertAmount);

  await contractManager.web3.eth.sendTransaction({
    to: reinsertPotAddress,
    from: caller,
    value: reinsertAmount.toString()
  });

  await contractManager.web3.eth.sendTransaction({
    to: governanceAddress,
    from: caller,
    value: governanceAmount.toString()
  });
}


async function setup() {
  const contractManager = ContractManager.get();
  const web3 = contractManager.web3;

  let currentBlock = await web3.eth.getBlockNumber();

  while (currentBlock < START_BLOCK_NUMBER) {
    await sleep(1000);

    currentBlock = await web3.eth.getBlockNumber();
  }

  const startBlockTimestamp = Number((await web3.eth.getBlock(START_BLOCK_NUMBER)).timestamp);
  const executionTime = new Date((startBlockTimestamp + TIMER_SECONDS) * 1000);

  // todo: get account #50
  const sendFrom = web3.defaultAccount!;

  console.log(`Scheduling job to execute dilute1() at ${executionTime}`)

  schedule.scheduleJob(executionTime, function () {
    sendDilutionAmount(contractManager, sendFrom, 4).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });

  console.log(`Scheduling job to execute dilute2() at ${executionTime}`)

  schedule.scheduleJob(executionTime, function () {
    sendDilutionAmount(contractManager, sendFrom, 3).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });

  console.log(`Scheduling job to execute dilute3() at ${executionTime}`)

  schedule.scheduleJob(executionTime, function () {
    sendDilutionAmount(contractManager, sendFrom, 1).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });
}

setup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
