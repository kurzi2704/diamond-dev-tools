import { analyseBlockMessages } from "./analysis/analyseBlockMessages";
import { ConfigManager } from "./configManager"





async function run() {

  const web3 = ConfigManager.getWeb3();

  const currentBlock = await web3.eth.getBlockNumber();

  analyseBlockMessages(currentBlock + 1, web3);


}

run();