"use strict";


import { ConfigManager } from './configManager';

import {KeyPair, generateAddressesFromSeed } from './utils';


import Web3 from 'web3';
import {PromiEvent, RLPEncodedTransaction, SignedTransaction, TransactionConfig, TransactionReceipt} from "web3-core";
import BigNumber from "bignumber.js";
import { sleep } from './utils/time';

let numberOfAccounts = 1000;

const passedArgument = process.argv[2];
if (passedArgument) {
    const parsedNumberOfAccounts = Number(passedArgument);
    if (parsedNumberOfAccounts) {
        numberOfAccounts = parsedNumberOfAccounts;
    }
}

console.log(`Feeding first ${numberOfAccounts} accounts.`);

const config = ConfigManager.getConfig();
const web3 = ConfigManager.getWeb3();

const mnemonic = config.mnemonic;

//const web3 = new Web3('http://185.244.194.53:8541');

// const account = web3.eth.accounts.privateKeyToAccount(privKey);
//console.log('Address: ', account.address);
const addr = web3.defaultAccount!; 

const countOfRecipients = numberOfAccounts;
const valueToFeed = '100000000000000000000';
//on new network you might want to "feed" all the accounts.
const transactionValue = '0';

async function getBalances(addresses: Array<KeyPair>){
    const balances = new Map<string, BigNumber>();

    for(let i = 0; i < addresses.length; i++) {
        const a = addresses[i].address;
        const balance = await web3.eth.getBalance(a);
        console.log(i + ': ' + a + ' : ' + balance);
        balances.set(a, new BigNumber(balance));
    }
    return balances;
};

async function runFeed() {

    const addresses = generateAddressesFromSeed(mnemonic, countOfRecipients);

    console.log('Balances before run:');
    await getBalances(addresses);

    //web3.eth.transactionConfirmationBlocks = 0;
    const currentBlockNumber = await web3.eth.getBlockNumber();

    console.log('currentBlockNumber = ', currentBlockNumber);

    //const web3Local = new Web3('http://127.0.0.1:8540');

    //console.log('currentBlockNumber from  local = ', await web3Local.eth.getBlockNumber());

    let nonceBase = await web3.eth.getTransactionCount(addr);

    console.log(`Current Transaction Count: ${nonceBase}`);
    //going to cache the number of transactions,
    // so the signing process does not

    //return;

   //  const rawTransactions : Array<RLPEncodedTransaction> = new Array<RLPEncodedTransaction>(countOfRecipients);

   let hashes : Array<string>= [];
   let confirmed = 0;

    for(let i = 0; i < countOfRecipients; i++) {

        //console.log(`next nonce: ${nonce}`);
        const txObj : TransactionConfig = {
            from: addr,
            to: addresses[i].address,
            gas: 21000,
            gasPrice: '1000000000',
            value: valueToFeed,
            nonce: nonceBase + i,
        };

        console.log(`sending TX: `, txObj);
        
        web3.eth.sendTransaction(txObj)
            .once("transactionHash", (h) => { hashes.push(h) })
            .once("confirmation", () => {
                confirmed++
            });

        //console.log('got signed Transaction: ', signedTx.rawTransaction);
    }

    console.log(`all Transactions sent, awaiting...`);


    while ( confirmed < countOfRecipients) {
        console.log(`confirmed ${confirmed}/${countOfRecipients}`);
        await sleep(1000);
    }

    console.log(`Confirmed all Transactions`);
}

runFeed().then((value) => {
    console.log('Job Done!!');
    process.exit();
}, (error) => {
    console.error('got some Error', error);
    process.exit(1);
});
