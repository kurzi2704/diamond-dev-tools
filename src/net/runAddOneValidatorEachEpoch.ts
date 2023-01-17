
import { awaitEpochSwitch } from '../awaitEpochSwitch';
import { stakeOnValidators } from './stakeOnValidators';
import { Watchdog } from '../watchdog';
import { NodeManager, NodeState } from './nodeManager';
import { ContractManager } from '../contractManager';
import { ConfigManager } from '../configManager';
import { parse } from 'ts-command-line-args';

function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

interface IRunAddOneValidatorEachEpochArgs {
  boot: boolean;
}

export async function run() {

  // todo: tee testnet/nodes/runAddOneValidatorEachEpoch.log

  const args = parse<IRunAddOneValidatorEachEpochArgs>({
    boot: { type: Boolean, alias: 'b' }
  });

  
  const offset = 0;
  const manager = NodeManager.get();
  manager.initFromTestnetManifest();

  console.log(`Watchdog - woof woof`);
  const web3 = ConfigManager.getWeb3();
  const contractManager = new ContractManager(web3);

  if (args.boot) {
    manager.startRpcNode();
    manager.startAllNodes();
  }

  console.log('waiting for Nodes to get started');
  await sleep(3000);

  const watchdog = new Watchdog(contractManager, manager);
  watchdog.startWatching();


  // feeding pots...
  console.log('feeding pots');
  const reward = await contractManager.getRewardHbbft();
  await reward.methods.addToDeltaPot().send({ from: web3.eth.defaultAccount!, gas: '100000', gasPrice: '1000000000', value: web3.utils.toWei('500', 'ether') });
  await reward.methods.addToReinsertPot().send({ from: web3.eth.defaultAccount!, gas: '100000', gasPrice: '1000000000', value: web3.utils.toWei('500', 'ether') });


  let numOfValidatorsStaked = 0;
  let runCounter = 1;
  do {

    console.log(`staking on validaor  ${runCounter}`);
    const validatorsStaked = await stakeOnValidators(1);
    numOfValidatorsStaked = validatorsStaked.length;

    if (numOfValidatorsStaked === 1) {
      console.log('staked details:', validatorsStaked[0]);
    }

    console.log(`staked: `, numOfValidatorsStaked);
    runCounter = runCounter + 1;

    console.log(`awaiting epoch switch  ${runCounter}`);
    await awaitEpochSwitch();

    //await startNode(nodeToStart);
  } while (numOfValidatorsStaked > 0)

  console.log('DONE - did all stackings.');

}


run();