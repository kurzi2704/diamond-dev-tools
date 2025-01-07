import { ContractManager } from "../contractManager"
import { NodeManager } from "../net/nodeManager";
import { printContractDetails } from "./printContractDetails";

async function run() {

    const contractManager = ContractManager.get();
    const nodeManager = NodeManager.get();
    
    await printContractDetails(contractManager, nodeManager);
}

run();