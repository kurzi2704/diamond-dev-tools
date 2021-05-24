

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

  //todo: we could just forecast the next epoch Switch here, instead of polling.

  while (true) {
    await wait(10000);
    const stakingEpoch = await staking.methods.stakingEpoch().call();
    console.log(`waiting for switch from ${stakingEpochAtStart} to ${stakingEpoch}`);
    if (stakingEpoch > stakingEpochAtStart) {
      console.log(`!validator set switched from ${stakingEpochAtStart} to ${stakingEpoch}!`);
      return;
    }
  }
}

