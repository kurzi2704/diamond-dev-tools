
import fs from 'fs';
import { ConfigManager } from '../configManager';

export interface NodeInfos {
  validators: string[],
  staking_addresses: string[],
  public_keys: string[],
  ip_addresses: string[],
  parts: number[][],
  acks: number[][][]
}


export function loadNodeInfosFromTestnetDirectory(): NodeInfos | undefined {

  const { nodesDir } = ConfigManager.getConfig();
  const pathToFile = `./testnet/${nodesDir}/nodes_info.json`;



  if (!fs.existsSync(pathToFile)) {
    console.error('Config for testnet was not found!');
    return undefined;
  }

  const readFile = fs.readFileSync(pathToFile, { encoding: 'utf8' });
  const parsedJson = JSON.parse(readFile);

  //console.log(parsedJson);

  return parsedJson;
}