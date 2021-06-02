import { startNode } from '../startNode';
import { awaitEpochSwitch } from '../awaitEpochSwitch';
import { stakeOnValidators } from './stakeOnValidators';

// startNode()


export async function run() {

  const numOfNodesTofill = 23;
  const offset = 0;



  // for(let i = 0; i < numOfNodesTofill; i++) {
  //   const nodeToStart = i + offset;
  //   await startNode(nodeToStart);
  //   console.log(`Node ${nodeToStart} started.`);
  // }

  let numOfValidatorsStaked = 0;
  let runCounter = 1;
  do {
    console.log(`awaiting epoch switch  ${runCounter}`);
    await awaitEpochSwitch();
    console.log(`staking on validaor  ${runCounter}`);
    numOfValidatorsStaked = await stakeOnValidators(1);
    runCounter = runCounter + 1;
    //await startNode(nodeToStart);
  } while (numOfValidatorsStaked > 0 )

  console.log('DONE - did all stackings.');

}


run();