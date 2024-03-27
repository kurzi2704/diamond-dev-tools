import Web3 from "web3";
import { sleep } from "../../utils/time";

export async function createBlock(web3: Web3,last_checked_block: number = Number.NaN) {
    
    if (Number.isNaN(last_checked_block)) {
        last_checked_block = await web3.eth.getBlockNumber();
    }
    let current_block =  await web3.eth.getBlockNumber();

    console.log("sending transaction to trigger block creation");
    // this should be enugh for trigger, but we don't rely on block production.

    let tx = web3.eth.sendTransaction({from: web3.eth.defaultAccount!, to: web3.eth.defaultAccount!, gas: "21000", gasPrice:"1000000000"});  
    let transaction_was_confirmed = false;
    tx.on("confirmation", (p) => { 
        console.log("transaction confirmed");
        transaction_was_confirmed = true;
    });
    
    console.log("transaction sent");
    
    //whilst()
    while (!transaction_was_confirmed)  {
        await sleep(250);
        // current_block =  await web3.eth.getBlockNumber();
    }  

    console.log('block created.')
}
