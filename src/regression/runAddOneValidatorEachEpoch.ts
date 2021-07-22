
import { awaitEpochSwitch } from '../awaitEpochSwitch';
import { stakeOnValidators } from './stakeOnValidators';
import { Watchdog } from '../watchdog';
import { NodeManager, NodeState } from './nodeManager';
import { ContractManager } from '../contractManager';
import { ConfigManager } from '../configManager';

function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function run() {

  const offset = 0;
  const manager = NodeManager.get();
  manager.initFromTestnetManifest();
  const numOfNodesTofill = manager.startAllNodes().length;

  console.log(`starting ${numOfNodesTofill} potential validator nodes`);

  manager.startRpcNode();
  console.log(`starting rpc node`);
  console.log(`waiting 10 seconds for boot up.`);


  await sleep(10000);


  console.log(`Watchdog - woof woof`);
  const web3 = ConfigManager.getWeb3();
  const contractManager = new ContractManager(web3);
  const watchdog = new Watchdog(contractManager, manager);
  watchdog.startWatching();

  // feeding pots...
  console.log('feeding pots');
  const reward = await contractManager.getRewardHbbft();
  await reward.methods.addToDeltaPot().send({  from: web3.eth.defaultAccount!, value: web3.utils.toWei('500', 'ether')});
  await reward.methods.addToReinsertPot().send({  from: web3.eth.defaultAccount!, value: web3.utils.toWei('500', 'ether')});

  // for(let i = 0; i < numOfNodesTofill; i++) {
  //   const nodeToStart = i + offset;
  //   await startNode(nodeToStart);
   //   console.log(`Node ${nodeToStart} started.`);
  // }

  let numOfValidatorsStaked = 0;
  let runCounter = 1;
  do {
    console.log(`staking on validaor  ${runCounter}`);
    numOfValidatorsStaked = await (await stakeOnValidators(1)).length;
    runCounter = runCounter + 1;

    console.log(`awaiting epoch switch  ${runCounter}`);
    await awaitEpochSwitch();

    //await startNode(nodeToStart);
  } while (numOfValidatorsStaked > 0 )

  console.log('DONE - did all stackings.');

}


run();