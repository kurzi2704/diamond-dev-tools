import { ConfigManager } from "../configManager";


async function run() {

  const web3 = ConfigManager.getWeb3();
  web3.eth.sendTransaction({from: web3.eth.defaultAccount!, to: "0xcAd012d7AC13C99cf37E1EB7b2606eC6fCdB7a93", value: "10000000000000000000000", gas: 21000, gasPrice: "1000000000" });
}

run();