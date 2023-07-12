import { ContractManager } from '../contractManager';
import { NodeManager } from './nodeManager';
import { printState } from './printState';

const nodeManager = NodeManager.get();
const contractManager = ContractManager.get();
printState(nodeManager, contractManager);
