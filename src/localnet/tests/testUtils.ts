import Web3 from "web3";
import { sleep } from "../../utils/time";

export async function createBlock(web3: Web3,last_checked_block: number = Number.NaN) {
    
    if (Number.isNaN(last_checked_block)) {
        last_checked_block = await web3.eth.getBlockNumber();
    }
    let current_block =  await web3.eth.getBlockNumber();

    console.log("sending transaction to trigger block creation");
    // this should be enugh for trigger, but we don't rely on block production.
    web3.eth.sendTransaction({from: web3.eth.defaultAccount!, to: web3.eth.defaultAccount!, gas: "21000", gasPrice:"1000000000"});  
    
    console.log("transaction sent");
    
    //whilst()
    while (current_block <= last_checked_block)  {
        await sleep(250);
        current_block =  await web3.eth.getBlockNumber();
    }  

    console.log('block created.')
}
