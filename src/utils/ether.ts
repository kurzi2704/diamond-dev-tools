import BigNumber from "bignumber.js";
import { ConfigManager } from "../configManager";

export function parseEther(wei: string): BigNumber {
  const web3 = ConfigManager.getWeb3();

  BigNumber.set({ DECIMAL_PLACES: 18 });

  const etherValue = web3.utils.fromWei(wei);
  return BigNumber(etherValue);
}

export function addressToBuffer(address: string): Buffer {
  return Buffer.from(address.toLowerCase().slice(2), 'hex');
}

export function bufferToAddress(buffer: Buffer) {
  return "0x" + buffer.toString('hex').toLowerCase();
}
