import { object } from "underscore";
import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { sleep } from "../utils/time";
import fs from "fs";
import { awaitTransactions } from "../tools/awaitTransactions";


function toNumber(value: string | number) : number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number.parseInt(value);
  }

  throw Error('not a number');
  
}

async function run() {

  const config = ConfigManager.getConfig();
  const contractManager = ContractManager.get();
  const web3 = contractManager.web3;

  const wallets = ConfigManager.insertWallets(web3, 50);

  const defaultGasPrice = '1000000000000';
  console.log("Warmup: Funding Accounts.");

  let confirmed = 0;
  let feedAccount = web3.eth.defaultAccount!;
  let nonceFeed = await web3.eth.getTransactionCount(feedAccount);
  for(const wallet of wallets) {
    web3.eth.sendTransaction({ from: feedAccount, to: wallet.address, nonce: nonceFeed, value: web3.utils.toWei('1', "ether"), gas: "21000", gasPrice: defaultGasPrice})
      .once("receipt", () => {
        confirmed++
      });
      nonceFeed++;
  }

  console.log('waiting for Accounts to be funded.');

  while ( confirmed < wallets.length) {
    console.log(`confirmed ${confirmed}/${wallets.length}`);
    await sleep(1000);
  }

  console.log('funds transfers confirmed.');
  console.log('Ramping up - finding plateu');

  let txPerAccount = 1;
  let outputFile = 'find-plateau.csv';
  console.log(`writing output to ${outputFile}`);
  fs.writeFileSync(outputFile, "tx-per-account;num-of-accounts;total-txs;number-of-blocks;sum-of-block-time;blockStart;blockEnd;block-per-second;txs-per-second;\n");
  

  // make a transaction to ensure the start of block production on hbbft.
  web3.eth.sendTransaction({ from: web3.eth.defaultAccount!, to: web3.eth.defaultAccount!, nonce: nonceFeed, value: web3.utils.toWei('1', "ether"), gas: "21000", gasPrice: defaultGasPrice});

  while (txPerAccount < 10) { // this while condition is kind of a max - we early exit if we have found a plateau.

    const blockStart = await web3.eth.getBlockNumber();
    const blockStartInstance = await web3.eth.getBlock(blockStart);
    const blockStartTime = toNumber(blockStartInstance.timestamp);

    let totalTxs = txPerAccount * wallets.length;
    let transactionHashesToConfirm : Array<string> = [];
    for(const wallet of wallets) {

      let nonce = await web3.eth.getTransactionCount(wallet.address);

      for(let i = 0; i<txPerAccount; i++) {
        web3.eth.sendTransaction({ from: wallet.address, to: wallet.address, value: '0', nonce, gas: "21000", gasPrice: defaultGasPrice})
        .once("transactionHash", (transactionHash) => {
          transactionHashesToConfirm.push(transactionHash);
        });
        nonce++;
      }
    }

    console.log(`transactions Sent: ${transactionHashesToConfirm.length} scanning blocks to verify transaction receipts...`);
    


    const blockEnd = await awaitTransactions(web3, blockStart, transactionHashesToConfirm);
    console.log(`all transactions confirmed with block:`, blockEnd);

    const blockEndInstance = await web3.eth.getBlock(blockEnd);
    const numOfBlocks = blockEnd - blockStart;
    const blockEndTime = toNumber(blockEndInstance.timestamp);
    const sumOfBlockTime = blockEndTime - blockStartTime;
    const blocksPerSecond = numOfBlocks / sumOfBlockTime;
    const txsPerSecond = totalTxs / sumOfBlockTime;

    fs.appendFileSync(outputFile, `${txPerAccount};${wallets.length};${totalTxs};${numOfBlocks};${sumOfBlockTime};${blockStart};${blockEnd};${blocksPerSecond.toPrecision(4)};${txsPerSecond.toPrecision(4)};\n`);
    txPerAccount++;
  }
  

  

  console.log('transactions funded.');




  

}

run();