import { ContractManager } from "../../contractManager";
import { NodeManager } from "../../net/nodeManager";
import { sleep } from "../../utils/time";
import Web3 from "web3";
import { createBlock } from "./testUtils";
import { Watchdog } from "../../watchdog";


async function runEarlyEpochTestNetwork() {


    console.log(`Early epoch test network. designed to run on testnet-fresh-test-early-epoch-end.`);

    let nodesManager = NodeManager.get();

    if (nodesManager.nodeStates.length != 16) {
        console.log(`ABORTING: expected 16 nodes to run this test`);
        return;
    }
    
    console.log(`starting rpc`);
    nodesManager.rpcNode?.start();
    
    console.log(`Starting up the network. Total nodes: ${nodesManager.nodeStates.length}`);

    for (let node of nodesManager.nodeStates) {
        node.start();
    }

    console.log(`all normal nodes started.`);

    console.log(`waiting for rpc`);
    await sleep(20000);

    let contractManager = ContractManager.get();
    let web3 = contractManager.web3;

    console.log(`initialize Watchdog`);
    let watchdog = new Watchdog(contractManager, nodesManager, false, false);

    watchdog.startWatching();
    

    let start_block =  await web3.eth.getBlockNumber();
    console.log('current block:', start_block);

    if (start_block > 10) {
        console.log('ABORTING: expected a fresh chain to run this test');
        return;
    }

    let last_checked_block = start_block;


    let current_epoch = await contractManager.getEpoch("latest");

    let     refreshBlock = async () => {
        last_checked_block = await web3.eth.getBlockNumber();
        current_epoch = await contractManager.getEpoch("latest");
    };

    let createBlockAndRefresh = async() => {
        await createBlock(web3, last_checked_block);
        await refreshBlock();
    }

    console.log("Epoch number at start: ", current_epoch);
    await createBlockAndRefresh();
    console.log("block creation confirmed.");


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

    // on an F = 5, N = 16 network, we can tolerate 3 nodes failing.


    await stopNode(1);
    
    console.log('node 1 stopped, creating block should work, because of fault tolerance.');

    await stopNode(2);
    await createBlockAndRefresh();
    console.log('node 2 stopped, creating block should work, because of fault tolerance.');

    await stopNode(3);
    await createBlockAndRefresh();
    console.log('node 3 stopped, creating block should work, because of fault tolerance.');

    await stopNode(4);
    await createBlockAndRefresh();
    console.log('node 4 stopped, creating block should work, because of fault tolerance. but above early epoch end tolerance');

    let maxTriesForEpochSwitch = 1000;

    console.log('waiting for epoch switch to happen.');

    let epochAtStart = current_epoch;

    for (let trial = 0; trial < maxTriesForEpochSwitch; trial++) {

        await sleep(1000);
        await refreshBlock();

        if (current_epoch > epochAtStart) {

            console.log("SUCCESS: Epoch switch did happen.");
            console.log("Count of validators:", await (await contractManager.getValidators()).length);
            nodesManager.stopAllNodes();
            nodesManager.stopRpcNode();
            return;
        }
    }

    console.log(`FAILURE: Epoch switch did not happen within the expected time of seconds: `, maxTriesForEpochSwitch);
    console.log('triggering block creation that should not create block, because of tolerance reached.');
    
    await watchdog.stopWatching();
    nodesManager.stopAllNodes();
    nodesManager.stopRpcNode();

}



runEarlyEpochTestNetwork();
