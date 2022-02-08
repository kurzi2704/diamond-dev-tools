import fs from 'fs';

export function artifactRequire(contractName: string) : any {

  const filename = `./src/abi/json/${contractName}.json`;
  if (!fs.existsSync(filename)){
    throw Error(`contract not found: ${filename}`);
  }
  
  const file = fs.readFileSync(filename, 'utf8');
  return JSON.parse(file);

}
