import schedule from 'node-schedule';
import BigNumber from 'bignumber.js';

import { ConfigManager } from './configManager';
import { ContractManager } from "./contractManager";
import { generateNthAddressFromSeed } from './utils';
import { sleep } from "./utils/time";

const START_BLOCK_NUMBER = 1;
const ADDRESS_IDNEX = 50;
const D1_TIMER_SECONDS = 15;
const D2_TIMER_SECONDS = 20;
const D3_TIMER_SECONDS = 25;

async function sendDilutionAmount(
  contractManager: ContractManager,
  caller: string,
  dilutionFracrtion: number
): Promise<void> {
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

  const config = ConfigManager.getConfig();
  const keyPair = generateNthAddressFromSeed(config.mnemonic, ADDRESS_IDNEX);
  const sendFrom = keyPair.address;

  web3.eth.accounts.wallet.add(keyPair);

  let currentBlock = await web3.eth.getBlockNumber();

  while (currentBlock < START_BLOCK_NUMBER) {
    await sleep(1000);

    currentBlock = await web3.eth.getBlockNumber();
  }

  const startBlockTimestamp = Number((await web3.eth.getBlock(START_BLOCK_NUMBER)).timestamp);
  const execTimeFirstDilution = new Date((startBlockTimestamp + D1_TIMER_SECONDS) * 1000);

  console.log(`Scheduling job to execute dilute1() at ${execTimeFirstDilution}`)

  schedule.scheduleJob(execTimeFirstDilution, function () {
    sendDilutionAmount(contractManager, sendFrom, 4).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });

  const execTimeSecondDilution = new Date((startBlockTimestamp + D2_TIMER_SECONDS) * 1000);

  console.log(`Scheduling job to execute dilute2() at ${execTimeSecondDilution}`)

  schedule.scheduleJob(execTimeSecondDilution, function () {
    sendDilutionAmount(contractManager, sendFrom, 3).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  });

  const execTimeThirdDilution = new Date((startBlockTimestamp + D3_TIMER_SECONDS) * 1000);

  console.log(`Scheduling job to execute dilute3() at ${execTimeThirdDilution}`)

  schedule.scheduleJob(execTimeThirdDilution, function () {
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
