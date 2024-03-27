import { Account } from "web3-core";
import { ConfigManager } from "../../configManager";
import { NodeManager } from "../../net/nodeManager";
import { sleep } from "../../utils/time";
import { Watchdog } from "../../watchdog";
import { ContractManager } from "../../contractManager";


async function runTest() {

    
    console.log("Booting testnetwork for automatic restaking test.");
    console.log("Tests and documents the implication of the automatic reward restaking feature https://github.com/DMDcoin/diamond-contracts-core/issues/43");
    

    //let nodeManager = await bootNetwork();

    const nodeManager = NodeManager.get();
    const contractManager = ContractManager.get();
    let watchdog = new Watchdog(contractManager, nodeManager);

    console.log("booting network...");
    nodeManager.startRpcNode();
    nodeManager.startAllNodes();

    console.log("waiting...");
    let waitTime = 20;
    console.log(`waiting ${waitTime} seconds for boot`);
    await sleep(waitTime * 1000);   

    watchdog.startWatching();

    

    watchdog.onEpochSwitch = async (epoch: number) => {
        console.log("!!!!!!!!!!!epoch switch!!!!!!!!!!", epoch);
    };
    
    let numOfNodes = nodeManager.nodeStates.length;
    let numOfDelegatorsEachEpoch = 100;



    const web3 = ConfigManager.getWeb3();

    console.log("block at startup:", await web3.eth.getBlockNumber());
    

    let accounts: Array<Account> = [];
    
    // const newAccount = web3.eth.accounts.create();
    // accounts.push(newAccount)

    await sleep(1000 * 1000);
    
}

runTest().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});