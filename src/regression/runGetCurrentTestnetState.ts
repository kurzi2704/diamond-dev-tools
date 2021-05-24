

import Web3 from 'web3';
//import Web3Eth from 'web3-eth';


async function run() {

  let nodeID = 2;
  let latestBlock = 0;

  while(nodeID < 25) {

    const port = 8540 + nodeID;
    const web3 = new Web3(`http://localhost:${port}`);
    const eth = web3.eth;

    let blockNumber : number | 'offline';

    try {
      blockNumber = await eth.getBlockNumber();
    } catch(e) {
      blockNumber = 'offline';
    }
    
    console.log(`Node: ${nodeID} Block: ${blockNumber}`);
    nodeID ++;
  }
}


run();
