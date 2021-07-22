import { ConfigManager } from "./configManager";
import { ContractManager } from "./contractManager";

async function runFeedPools() {

  console.log('getting web3');
  const web3 = ConfigManager.getWeb3();
  console.log('getting contract manager');

  const contractManager = new ContractManager(web3);

  const reward = await contractManager.getRewardHbbft();
  await reward.methods.addToDeltaPot().send({ from: web3.eth.defaultAccount!, value: web3.utils.toWei('500', 'ether')});
  await reward.methods.addToReinsertPot().send({ from: web3.eth.defaultAccount!, value: web3.utils.toWei('500', 'ether')});
}

runFeedPools();