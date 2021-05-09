
import fs from 'fs';


export function loadFromTestnetDirectory() {

  const pathToFile = './testnet/nodes/nodes_info.json';

  if (!fs.existsSync(pathToFile)) {
    console.error('Config for testnet was not found!');
  }
  
  const readFile = fs.readFileSync(pathToFile, {encoding: 'utf8'});

  
  const parsedJson = JSON.parse(readFile);

  console.log(parsedJson);
  //fs.readFileSync()
}