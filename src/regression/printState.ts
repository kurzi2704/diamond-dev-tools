// the RPC Nodes holds the data, 
// all other nodes get deleted the caches.

import { ContractManager } from "../contractManager";
import { NodeManager } from "./nodeManager";

export async function printState(nodeManager: NodeManager, contractManager: ContractManager) {

  nodeManager.nodeStates.forEach(async (s) => {
    if (s.address) {
      const validatorSet = contractManager.getValidatorSetHbbft();
      const stakingAddress =  await validatorSet.methods.stakingByMiningAddress(s.address).call();
      const encodedABI = validatorSet.methods.validatorAvailableSince(stakingAddress).encodeABI();
      // console.log(`call Encoded for ${s.address}:`, encodedABI);
      const callResult = await validatorSet.methods.validatorAvailableSince(stakingAddress).call();
      console.log(`call result for ${s.address}`, callResult);
      //s.address
    }
  
  })

}