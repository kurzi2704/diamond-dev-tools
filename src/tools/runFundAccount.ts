import { ConfigManager } from "../configManager";


async function run() {

  const web3 = ConfigManager.getWeb3();
  web3.eth.sendTransaction({from: web3.eth.defaultAccount!, to: "0x073eE866ab99795995e38f1064ac2dC48bf69cB0", value: "10000000000000000000000", gas: 21000, gasPrice: "1000000000" });
}

run();