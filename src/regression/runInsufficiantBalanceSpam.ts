import { ConfigManager } from "../configManager";
import { BigNumber } from "bignumber.js";


export async function insufficientBalanceTest() {

  console.log('testing block proposals with invalid transactions lead to 0-tx-Blocks');
  console.log('see also: https://github.com/DMDcoin/openethereum-3.x/issues/58');

  const web3 = ConfigManager.getWeb3();
  const newAccount = web3.eth.accounts.create();
  web3.eth.accounts.wallet.add(newAccount);
  
  console.log('new test account: ', newAccount.address);
  console.log('using funded account:',  web3.eth.defaultAccount);
  console.log('default gas price: ', await web3.eth.getGasPrice());
  const gasPrice = '100000000000';

  // const gasPriceBN = new BigNumber(gasPrice);


  const valueToPassAround = web3.utils.toWei('1', 'ether');

  const tx = await web3.eth.sendTransaction(
    { from: web3.eth.defaultAccount!,
      to: newAccount.address,
      gas: 21000, 
      value: valueToPassAround,
      gasPrice: gasPrice
    });

  console.log('tx:', tx.transactionHash);
  //tx.cumulativeGasUsed

  const currentTransactionCount = await web3.eth.getTransactionCount(newAccount.address);
  console.log(`currentTransactionCount: `, currentTransactionCount);

  // now create 2 transactions with 0.5 DMD.
  // but send both at the same time, so the RPC won't reject them.


  const halfValue = web3.utils.toWei('0.5', 'ether');

  const txback_2 = web3.eth.sendTransaction(
    { from: newAccount.address!, 
      to: web3.eth.defaultAccount!, 
      gas: 21000, 
      gasPrice: gasPrice,
      value: halfValue,
      nonce: currentTransactionCount + 1
    }
  );
  
  // we need to bypass the insufficient funds problem here.
  const txback_1 = web3.eth.sendTransaction(
    { from: newAccount.address!, 
      to: web3.eth.defaultAccount!, 
      gas: 21000, 
      gasPrice: gasPrice,
      value: halfValue,
      nonce: currentTransactionCount
    }
  );

  console.log('did send both transactions.');
  console.log('awaiting first, that should get processed.');

  const back1Result = await txback_1;

  console.log('back1Result: ', back1Result.transactionHash);
  console.log('await tx2: might never get fullfilled');

  // now track if the blockchain is creating empty blocks or not for a time.
  // concept:
  // const secondsToCheck = 60;

  // let now = new Date(Date.now());
  // const end = new Date();
  // end.setSeconds(now.getSeconds() + secondsToCheck);

  // let lastCheckedBlock = await web3.eth.getBlockNumber();

  // while(Date.now() < end.getDate()) {

    
  // }


  //  anzeigen
  const back2Result = await txback_2;

  console.log('Uh it worked!!');
}


insufficientBalanceTest().then(()=> {
  console.log('stakingSufficientBalanceTestng finihsed.');
});