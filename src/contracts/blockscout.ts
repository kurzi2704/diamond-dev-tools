import { ConfigManager } from "../configManager";
import axios from "axios";
import { sleep } from "../utils/time";
import { cmd } from "../remoteCommand";
export class Blockscout {

  public constructor(public url: string) {

  }

  // retrieves a blockscout instance if a blockscout is configured in the url.
  // verifies that blockscout is on the same network as the web3 instance.
  public static get() : Blockscout | undefined {

    const { blockscoutInstance } = ConfigManager.getConfig();
    
    if (blockscoutInstance.length > 0) {
      const result = new Blockscout(blockscoutInstance);
      return result;
    }

    return undefined;
  }

  public async waitForBlockscoutToSync(blockNumber: number, timoutMS: number = 20000): Promise<boolean> {

    const startOfWait = Date.now();

    while (startOfWait + timoutMS > Date.now()) {
      const latestBlock = await this.getLatestBlock();
      if (latestBlock >= blockNumber) {
        return true;
      }
      await sleep(500);
    }

    return false;

  }

  // verifies the contract on blockscout using the hardhat integration verification script
  // it requires proper setup of both chains.
  public verifyHbbftContract(address: string) : { success: boolean, script: string} {

    // get correct network mapping:
    const verifyCmd = "npx hardhat verify --network alpha " + address;
    const cmdResult = cmd("cd ../hbbft-posdao-contracts && " + verifyCmd);
    const result = cmdResult.output;
    console.log(result);

    if (!cmdResult.success) {
      return { success: false, script: verifyCmd };
    }

    const success = result.includes("Successfully verified contract");
    return { success, script: verifyCmd };
  }

  public async getLatestBlock() : Promise<number> {

    // example:
    // http://explorer.uniq.diamonds/api?module=block&action=eth_block_number

    const blockHex = await this.queryJsonSingleResult("module=block&action=eth_block_number", "result");
    return parseInt(blockHex, 16);
  }

  /// queries the Blockscout API interface with the given query return the Json result as Javascript Object.
  public async queryJsonRaw(module_path: string) : Promise<any> {

    const full_request = this.getAPIUrl() + module_path;
    // util.
    let result = await axios.get(full_request);
    
    // console.log(result.status);
    // console.log(result.data);
    return result.data;
  }

  /// queries the Blockscout API interface with the given query and interpretes the Json result, 
  /// giving back the defined output_id.
  /// example:
  /// const blockNumber = queryJsonSingleResult("module=block&action=eth_block_number", "result");
  /// // blockNumber is the hex encoded block number.
  public async queryJsonSingleResult(module_path: string, output_id: string) : Promise<string> {
    // could be done much faster than the raw method.
    const result = await this.queryJsonRaw("module=block&action=eth_block_number");
    return result[output_id];
  }

  public getAPIUrl() : string {
    return this.url + "/api?";
  }
}

// async function test() {

//   const bs = Blockscout.get();

//   if (bs) {
//     const latestBlock = await bs.getLatestBlock();
//     console.log("latest block: " + latestBlock);
//   }
// }