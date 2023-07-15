import { whilst } from "async";
import { ContractManager } from "../contractManager";
import { NodeManager } from "../net/nodeManager";
import { sleep } from "../utils/time";
import Web3 from "web3";
import { create } from "underscore";





async function runPhoenixTestNetwork() {


    let heartbeatInterval = 600;
    let nodesManager = NodeManager.get();
    
    console.log(`starting rpc`);
    nodesManager.rpcNode?.start();
    
    console.log(`Starting up the network. Total nodes: ${nodesManager.nodeStates.length}`);

    for (let node of nodesManager.nodeStates) {
        node.start();
    }

    console.log(`all normal nodes started.`);

    console.log(`waiting for rpc`);
    await sleep(10000);

    let contractManager = ContractManager.get();
    let web3 = contractManager.web3;

    let start_block =  await web3.eth.getBlockNumber();
    console.log('current block:', start_block);

    let last_checked_block = start_block;

    let refreshBlock = async () => {
        last_checked_block = await web3.eth.getBlockNumber();
    };

    await createBlock(web3, last_checked_block);

    let stopNode = async (n: number) => { 
        console.log(`stopping node ${n}`);
        await nodesManager.getNode(n).stop();
        console.log(`node ${n} stopped`);
    };


    let startNode = async (n: number) => { 
        console.log(`starting node ${n}`);
        await nodesManager.getNode(n).start();
        console.log(`node ${n} started`);
    };

    await stopNode(1);
    await createBlock(web3, last_checked_block);

    console.log('node 1 stopped, creating block should work, because of fault tolerance');

    await stopNode(2);

    await refreshBlock();

    console.log('triggering block creation that should not create block, because of tolerance reached.');
    let createBlockFailing = createBlock(web3);

    console.log('waiting for nodes...');
    
    await sleep(3000);

    let blockBeforeNewTransaction = last_checked_block;
    await refreshBlock();

    // console.log('Block was not created as expected:', last_checked_block > blockBeforeNewTransaction);

    await startNode(1);
    await sleep(15000);
    await refreshBlock();

    console.assert(last_checked_block > blockBeforeNewTransaction);

    console.log('Block created after tolerance reached was achieved again.:');

    let delta_reward = await contractManager.getRewardDeltaPot(last_checked_block);
    let reinsert_reward = await contractManager.getRewardReinsertPot(last_checked_block);
    let rewardHbbft = await contractManager.getRewardHbbft();
    let total_reward = await contractManager.getRewardContractTotal(last_checked_block); 
    console.log("delta: ", delta_reward);
    console.log("reinsert: ", reinsert_reward);
    console.log("total_reward: ", total_reward);

    
    nodesManager.stopAllNodes();
    nodesManager.stopRpcNode();

    // todo: add a condition to stop this test.
    // maybe phoenix managed a recovery 3 times ?
    // while(true) {
    //     // verify that network is running.
    //     // by sending a transaction and waiting for a new block.
        
        



    // }

}



runPhoenixTestNetwork();

async function createBlock(web3: Web3,last_checked_block: number = Number.NaN) {
    
    if (Number.isNaN(last_checked_block)) {
        last_checked_block = await web3.eth.getBlockNumber();
    }
    let current_block =  await web3.eth.getBlockNumber();

    console.log("sending transaction to trigger block creation");
    let confirmation = await web3.eth.sendTransaction({from: web3.eth.defaultAccount!, to: web3.eth.defaultAccount!, gas: "21000", gasPrice:"1000000000"});  
    
    console.log("transaction sent");
    
    //whilst()
    while (current_block <= last_checked_block)  {
        await sleep(250);
        current_block =  await web3.eth.getBlockNumber();
    }  

    console.log('block created.')
}
