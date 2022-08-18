import { ConfigManager } from "../configManager";


async function run() {

  const web3 = ConfigManager.getWeb3();
  const block = await web3.eth.getBlock(12733);

  console.log(block);
}

run();