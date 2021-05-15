
import fs from 'fs';

export interface NodeInfos {
  validators: string[],
  staking_addresses: string[],
  public_keys: string[],
  ip_addresses: string[],
  parts: number[][],
  acks: number[][][]
}


export function loadNodeInfosFromTestnetDirectory() : NodeInfos {

  const pathToFile = './testnet/nodes/nodes_info.json';

  if (!fs.existsSync(pathToFile)) {
    console.error('Config for testnet was not found!');
  }
  
  const readFile = fs.readFileSync(pathToFile, {encoding: 'utf8'});

  
  const parsedJson = JSON.parse(readFile);

  //console.log(parsedJson);

  return parsedJson;
}