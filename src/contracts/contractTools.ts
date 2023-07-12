import Web3 from "web3";
import fs from 'fs';

export function artifactRequire(contractName: string): any {

  const filename = `./src/abi/json/${contractName}.json`;
  if (!fs.existsSync(filename)) {
    throw Error(`contract not found: ${filename}`);
  }

  const file = fs.readFileSync(filename, 'utf8');
  return JSON.parse(file);

}


export async function deploy(web3: Web3, contractArtifact: any) {

  console.log('deploying contract...', contractArtifact.contractName);
  //deployedContract
  //const contract = new web3.eth.Contract();
  var bc = contractArtifact.bytecode;
  //var abi = contractArtifact.interface;

  const tx = await web3.eth.sendTransaction({ gas: '10000000', data: bc });

  if (!tx.contractAddress) {
    throw Error('Expected new Contract address.');
  }

  //var contact = web3.eth.Contract new(abi,{from: web3.eth.accounts[0], data: bc});

  //simulate for now.
  return tx;
}