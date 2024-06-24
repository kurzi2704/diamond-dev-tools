// Prerequisite:
// Candidate node is running, and not registered as validator node.
// Maximum number of Nodes not reached yet.

// Action
// stacker adds a pool for candidate node.

// Expected result
// The Node get's picked up as validator within the next epoch swich.

import { getNodesFromCliArgs } from '../remotenet/remotenetArgs';
import { stakeOnValidators } from './stakeOnValidators';

async function runStakeOnValidators() {

  const nodes = await getNodesFromCliArgs();

  // let poolAddresses = nodes.filter((n) => { n.address }).map((n) => { return n.address!; });
  let poolAddressesUnfiltered = nodes.map((n) => { return n.address!; });
  console.log(poolAddressesUnfiltered);
 
  console.log("nodes", poolAddressesUnfiltered );
  await stakeOnValidators(undefined, poolAddressesUnfiltered);
}

 
runStakeOnValidators().then(() => {
  console.log('staking finihsed.');
});
