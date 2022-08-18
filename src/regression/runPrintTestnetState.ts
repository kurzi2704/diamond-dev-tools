import { ContractManager } from "../contractManager";
import { NodeManager } from "../net/nodeManager";
import { printState } from "../net/printState";

const nodeManager = NodeManager.get();
const contractManager = ContractManager.get();
printState(nodeManager, contractManager);

