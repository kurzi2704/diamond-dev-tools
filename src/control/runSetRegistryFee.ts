import { ContractManager } from "../contractManager";
import { NetworkController } from "./networkController";


async function run() {
  const networkController = new NetworkController(ContractManager.get());
  const value = '0x0';
  networkController.setRegistryFee(value);
  console.log('registry fee set to ', value);
}

run();