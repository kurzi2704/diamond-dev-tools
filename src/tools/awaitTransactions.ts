import Web3 from "web3";
import { sleep } from "../utils/time";



export async function awaitTransactions(web3: Web3, blockBeforeTxSend: number, transactions: Array<string>) : Promise<number> {

  let lastAnalysedBlock = blockBeforeTxSend;

  while ( transactions.length > 0 ) {
    await sleep(200);
    // console.log("awaiting confirmation of txs: ", transactions.length);
    let currentBlock = await web3.eth.getBlockNumber(); 

    for (let blockToAnalyse = lastAnalysedBlock; blockToAnalyse < currentBlock; blockToAnalyse ++) {
      console.log('analysing block', blockToAnalyse);

      const block = await web3.eth.getBlock(blockToAnalyse);

      const txCountBeforeFilter = transactions.length;
      transactions = transactions.filter(x => !block.transactions.includes(x));
      const txCountAfterFilter = transactions.length;
      const txCountConfirmed = txCountBeforeFilter - txCountAfterFilter;
      console.log(`block ${blockToAnalyse} proccessed. confirmed txs: ${txCountConfirmed}`);
    }

    lastAnalysedBlock = currentBlock;
  }
  
  console.log('all transactions confirmed at block:', lastAnalysedBlock);

  return lastAnalysedBlock;
}