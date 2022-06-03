import deepEqual from "deep-equal";
import { ContractManager, KeyGenMode } from "../contractManager";
import { Transaction } from 'web3-core';
import { blockTimeAsUTC } from "../utils/dateUtils";
import { getKeyGenStates, KeyGenRoundResult } from "./getKeyGenStates";
// import { PouchDB } from "pouchdb";


async function run() {


  console.log('scans the network and looks watches out for nodes');
  console.log('that got included, without having their ACK transaction mined.');

  const contractManager = ContractManager.get();

  const { roundResults } = await getKeyGenStates(contractManager, 940);

  // epochResult.
  console.log('finished!');

  console.log('roundResults:');

  roundResults.forEach(x => {
    console.log(x.prettyPrint());
  });

  console.log('ACK Transactions not included in block:');
  roundResults.forEach(x => {
    x.FoundACKTXInFinalBlock.forEach(t => {
      console.log(t.hash);
    })
  });

  console.log('');
  console.log(KeyGenRoundResult.printCSVHeader());
  roundResults.forEach(x => {
    console.log(x.printCSV());
  });

}

run();

