import { createOptionsSection } from "ts-command-line-args";
import { Account, PromiEvent, TransactionReceipt } from "web3-core";
import { ConfigManager } from "../configManager";
import { isErrorWithMessage, toErrorWithMessage } from "../utils/error";
import { sleep } from "../utils/time";



async function runPerformanceTests() {

  const web3 = ConfigManager.getWeb3();

  const { toWei, toBN } = web3.utils;

  const sendAccounts : Array<Account> = [];

  
  //const minBalance = toBN(toWei('1', 'ether'));

  

  const minGasPrice = await web3.eth.getGasPrice();

  const minBalance = toBN(minGasPrice).mul(toBN(21000));

  console.log("Min gase Price:", minGasPrice);


  // const fundingPromises : Array<PromiEvent<TransactionReceipt>> = [];

  let transactionSuccesses = 0;
  let nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount!);

  

  console.log('Creating accounts for wallet, using funding address: ', web3.eth.defaultAccount);
  for(let i = 1; i <= 10000; i++) {

    
    const account = web3.eth.accounts.create(`test${i}` );
    web3.eth.accounts.wallet.add(account);
    sendAccounts.push(account);
    
    const balance = web3.utils.toBN(await web3.eth.getBalance(account.address));

    if (balance.lt(minBalance)) {
      console.log(`Funding: `, account.address);
      // fundingPromises.push(
      //   web3.eth.sendTransaction({ from: web3.eth.defaultAccount!, to: account.address, value: minBalance, gas: 21000, gasPrice: minGasPrice })
      // );

      for (let j = 1; j < 100; j++) {
        const calcedGasPrice = toBN(minGasPrice).mul(toBN(j)).toString();
        try {
          const tx = { from: web3.eth.defaultAccount!, to: account.address, value: minBalance, gas: 21000, gasPrice: calcedGasPrice, nonce: nonce };
          // console.log("sending transaction: ", tx);
          web3.eth.sendTransaction(tx).once("confirmation",(confirmationNumber: number, receipt: TransactionReceipt, latestBlockHash?: string | undefined) => {
            transactionSuccesses++;
          })
          break; // we are done with this node.
        } catch (e) {
          
          if (isErrorWithMessage(e)) {
            const error = toErrorWithMessage(e);
            if (error.message.includes("Transaction gas price supplied is too low.")) {
              console.log("Detected Gas Price to low - retrying.");
              continue;
            } else {
              console.log("Error during send transaction.");
              throw e;
            }

          } else {
            console.log("Unexpected Error.", e);
            throw e;
          }

        }

        
      }
      
    }

    nonce ++;
  }

  //awaiting funding promises:

  console.log('awaiting funding promises.');

  while(transactionSuccesses < sendAccounts.length) {
    console.log(`confirmed: ${transactionSuccesses} / ${sendAccounts.length}`);
    await sleep(1000);
  }

  console.log("All funding transactions confirmed.");

  // fundingPromises.forEach( async x=> await x);
  // await Promise.all(fundingPromises);

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

