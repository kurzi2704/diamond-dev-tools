import { createOptionsSection } from "ts-command-line-args";
import { Account, PromiEvent, TransactionReceipt } from "web3-core";
import { ConfigManager } from "../configManager";



async function runPerformanceTests() {

  const web3 = ConfigManager.getWeb3();

  const { toWei, toBN } = web3.utils;

  const sendAccounts : Array<Account> = [];

  
  //const minBalance = toBN(toWei('1', 'ether'));

  

  const minGasPrice = await web3.eth.getGasPrice();

  const minBalance = toBN(minGasPrice).mul(toBN(21000));


  const fundingPromises : Array<PromiEvent<TransactionReceipt>> = [];

  console.log('Creating accounts for wallet, using funding address: ', web3.eth.defaultAccount);
  for(let i = 1; i <= 1000; i++) {

    
    const account = web3.eth.accounts.create(`test${i}` );
    web3.eth.accounts.wallet.add(account);
    sendAccounts.push(account);
    
    const balance = web3.utils.toBN(await web3.eth.getBalance(account.address));

    if (balance.lt(minBalance)) {
      console.log(`Funding: `, account.address);
      // fundingPromises.push(
      //   web3.eth.sendTransaction({ from: web3.eth.defaultAccount!, to: account.address, value: minBalance, gas: 21000, gasPrice: minGasPrice })
      // );
      const doubleGasPrice = toBN(minGasPrice).mul(toBN(2)).toString("hex")
      await web3.eth.sendTransaction({ from: web3.eth.defaultAccount!, to: account.address, value: minBalance, gas: 21000, gasPrice: doubleGasPrice });
    }
  }

  //awaiting funding promises:

  console.log('awaiting funding promises.');

  // fundingPromises.forEach( async x=> await x);
  await Promise.all(fundingPromises);

  // for (let promise of fundingPromises) {
  //   await promise;
  // }

  const promises : Array<PromiEvent<TransactionReceipt>> = [];

  console.log('all accounts funded');

  for (const account of sendAccounts) {

    promises.push(
      web3.eth.sendTransaction({ from: account.address, to: account.address, value: 0, gas: 21000, gasPrice: minGasPrice })
    );

    //await web3.eth.sendTransaction({ from: account.address, to: account.address, value: 0, gas: 21000, gasPrice: minGasPrice })

  }

  console.log('all tx sent. awaiting...');

  await Promise.all(promises);



  
}

runPerformanceTests();

