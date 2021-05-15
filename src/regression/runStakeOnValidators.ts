

// Prerequisite:
// Candidate node is running, and not registered as validator node.
// Maximum number of Nodes not reached yet.

// Action
// stacker adds a pool for candidate node.

// Expected result
// The Node get's picked up as validator within the next epoch swich.


import { loadNodeInfosFromTestnetDirectory } from './nodeInfo';

import { ConfigManager } from '../configManager';
import { ContractManager } from '../contractManager';
import { BigNumber } from 'bignumber.js';



// import { StakingHbbft } from  '../abi/contracts/StakingHbbft'


//const x : StakingHbbft = {};


//const stackingContract = StakingHbbft.

//const contract = new web3.eth.Contract()167.86.125.140


async function stakeOnValidators() {

  const web3 = ConfigManager.getWeb3();

  const contractManager = new ContractManager(web3);

  
  
  const validatorSet = contractManager.getValidatorSetHbbft();

  const stacking = await contractManager.getStakingHbbft();
  const stackingPools = await stacking.methods.getPools().call();

  const currentTimestamp = await validatorSet.methods.getCurrentTimestamp().call();
  const currentValidators = await validatorSet.methods.getValidators().call();

  console.log('current Validators:');

  currentValidators.forEach(x=>console.log(x));

  const nodeInfos = loadNodeInfosFromTestnetDirectory();

  for(let i = 0; i < nodeInfos.validators.length; i++) {
    const validator = nodeInfos.validators[i];

    const stakingAddress = await validatorSet.methods.stakingByMiningAddress(validator).call();

    const stakingAddressBN = new BigNumber(stakingAddress);
    
    if (!stakingAddressBN.isZero()) {
      console.log(`validator ${validator} is already assigned to the pool ${stakingAddress}`);
    }

    let isCurrentValidator = currentValidators.findIndex(x=>x==validator) !== -1;

    if (isCurrentValidator) {
      console.log(`validator ${validator} is a current validator. (probably MOC Node)`);
    }

    console.log(`validator ${validator} is able to get picked up as new pool!`);
  }

  console.log('current Time:', currentTimestamp);
}

stakeOnValidators();