

import { ConfigManager } from './configManager';
import { ContractManager } from './contractManager';

// Returns a Promise that resolves after "ms" Milliseconds
function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

export async function awaitEpochSwitch() {

  const web3 = ConfigManager.getWeb3();
  const contractManager = new ContractManager(web3);

  const staking = await contractManager.getStakingHbbft();
  
  
  const stakingEpochAtStart = await staking.methods.stakingEpoch().call();
  let currentEpoch = stakingEpochAtStart;
  //todo: we could just forecast the next epoch Switch here, instead of polling.
  console.log(`waiting for switch staking epoch (current: ${stakingEpochAtStart})`);

  while (currentEpoch === stakingEpochAtStart) {
    await wait(1000);
    currentEpoch = await staking.methods.stakingEpoch().call();
    process.stdout.write('.');
  }

  console.log(`!validator set switched from ${stakingEpochAtStart} to ${currentEpoch}!`);
}

