import { ContractManager } from "../contractManager";
import { NodeManager } from "./nodeManager";


export async function registerNames() {

  const contractManager = ContractManager.get();
  const nodeManager = NodeManager.get();

  const registry = contractManager.getRegistry();
  const staking = await contractManager.getStakingHbbft();
  const validatorSet = await contractManager.getValidatorSetHbbft();


  for(let i = 1; i < 5; i ++) {

    const node = nodeManager.getNode(i);
    
    if (node.address) {
      //registry.methods.setData(`name`, )
    }
    //const mining = await validatorSet.methods.stakingByMiningAddress();
    
    //registry.methods.setData()
  }

  
}

registerNames();