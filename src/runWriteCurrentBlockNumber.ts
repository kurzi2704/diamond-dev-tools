import BigNumber from 'bignumber.js';
import { ConfigManager } from './configManager';
import { LogFileManager } from './logFileManager';

async function writeBlockNumberFile() {
  const web3 = ConfigManager.getWeb3();
  const latestBlockNumber = await web3.eth.getBlockNumber();

  LogFileManager.writeBlockNumberOutput(latestBlockNumber);
}

writeBlockNumberFile().then(() => {
  process.exit(0);
});
