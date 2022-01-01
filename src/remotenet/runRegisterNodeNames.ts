import { BigNumber } from "bignumber.js";
import { ContractManager } from "../contractManager";
import { NetworkController } from "../control/networkController";
import { NodeManager } from "../regression/nodeManager";
import { getNodesFromCliArgs } from "./remotenetArgs";

function parseHexString(str: string) { 
  var result = [];
  while (str.length >= 8) { 
      result.push(parseInt(str.substring(0, 8), 16));

      str = str.substring(8, str.length);
  }

  return result;
}

async function run() {

  const contractManager = ContractManager.get();
  const controller = new NetworkController(contractManager);
  const nodeManager = NodeManager.get();
  const validatorSet = contractManager.getValidatorSetHbbft();

  const registry = contractManager.getRegistry();
  const nodes = await getNodesFromCliArgs();

  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    
    if (node.address) {

      // get pool address of this miner address
      const poolAddress = await validatorSet.methods.stakingByMiningAddress(node.address).call();
      
      const poolAddressAsHex = parseHexString(poolAddress);

      console.log(`poolAddress: ${poolAddressAsHex}`, poolAddress);
      const bn = new BigNumber(poolAddress);

      if (!bn.isZero()) {

        //my key:
        //registry.methods.reserved();
        //registry.methods.reserve(poolAddress)
        //registry.methods.setData('name','')
      }
    }
  }
}

run();