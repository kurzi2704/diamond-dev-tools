

import { NodeManager } from './nodeManager';
import { awaitEpochSwitch } from '../awaitEpochSwitch';
import { ContractManager } from '../contractManager';
import { ConfigManager } from '../configManager';



function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
 }


async function run() {

  const manager = NodeManager.get();
  manager.initFromTestnetManifest();
  console.log('Got node manager.');

  const node1 = manager.startNode(1);
  console.log('started node 1');
  const node2 = manager.startNode(2);
  console.log('started node 2');
  const node3 = manager.startNode(3);
  console.log('started node 3');
  
  console.log('waiting 10 seconds for starting up RPC node.');
  await sleep(10000);
  console.log('waiting for epoch switch');

  await awaitEpochSwitch();

  console.log('getting web3');
  const web3 = ConfigManager.getWeb3();
  console.log('getting contract manager');
  const contractManager = new ContractManager(web3);

  //manager.getNode();

  const validatorSet = contractManager.getValidatorSetHbbft();

  

  //const isValidator = await validatorSet.methods.isValidator('').call();

  

  console.log('stopping nodes...');
  await node1.stop();
  await node2.stop();
  await node3.stop();

}


run();