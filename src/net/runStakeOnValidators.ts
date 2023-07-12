// Prerequisite:
// Candidate node is running, and not registered as validator node.
// Maximum number of Nodes not reached yet.

// Action
// stacker adds a pool for candidate node.

// Expected result
// The Node get's picked up as validator within the next epoch swich.

import { stakeOnValidators } from './stakeOnValidators';

// todo: interprate CLI Arguments.

stakeOnValidators().then(() => {
  console.log('staking finihsed.');
});
