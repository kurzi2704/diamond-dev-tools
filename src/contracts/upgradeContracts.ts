

// import Web3 from 'web3';
// const web3 = new Web3;


import { findSeries } from 'async';
import { encodeSingle, encodeMulti } from 'ethers-multisend';

import { ConfigManager } from "../configManager";
import { ContractManager } from '../contractManager';
import fs from 'fs';
import { Dictionary } from 'underscore';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

//const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');


function artifactRequire(contractName: string) : any {

  const filename = `./src/abi/json/${contractName}.json`;
  if (!fs.existsSync(filename)){
    throw Error(`contract not found: ${filename}`);
  }
  
  const file = fs.readFileSync(filename, 'utf8');
  return JSON.parse(file);

}

async function deploy(web3: Web3, contractArtifact: any) : Promise<string> {

  console.log('deploying contract...');
  //deployedContract
  //const contract = new web3.eth.Contract();
  var bc = contractArtifact.bytecode;
  //var abi = contractArtifact.interface;
  
  const tx = await web3.eth.sendTransaction({gas: '10000000', data: bc});

  if (!tx.contractAddress) {
    throw Error('Expected new Contract address.');
  }

  //var contact = web3.eth.Contract new(abi,{from: web3.eth.accounts[0], data: bc});
  
  //simulate for now.
  return tx.contractAddress;
}

async function doDeployContracts() {

  const web3  = ConfigManager.getWeb3();
  const contractManager = new ContractManager(web3);
   
  console.log('experimential contract updater for admin handled contracts.');
  console.log('detects hbbft contracts that require an update.');
  console.log('executes the update or prepares it for a multisig.');

  const account = web3.eth.defaultAccount;
  console.log('using account: ', account);

  const blockNumber = await web3.eth.getBlockNumber();
  const blockHash = (await web3.eth.getBlock(blockNumber)).hash;
  console.log(`Current Block ${blockNumber}:  ${blockHash}`);

  //const certifierProxyAddress = "0x5000000000000000000000000000000000000001";
  //const certifierProxyAddress = "0x5000000000000000000000000000000000000001";
  


// const VALIDATOR_SET_CONTRACT = '0x1000000000000000000000000000000000000001';
// const BLOCK_REWARD_CONTRACT = '0x2000000000000000000000000000000000000001';
// const RANDOM_CONTRACT = '0x3000000000000000000000000000000000000001';
// const STAKING_CONTRACT = '0x1100000000000000000000000000000000000001';
// const PERMISSION_CONTRACT = '0x4000000000000000000000000000000000000001';
// const CERTIFIER_CONTRACT = '0x5000000000000000000000000000000000000001';
// const KEY_GEN_HISTORY_CONTRACT = '0x7000000000000000000000000000000000000001';

// TODO: 
// compare current code with deployed code, 
// detect different contracts to update.
// make create call for all contracts.
// execute a transaction that executes the switch to new contract address

  const contractAddresses : { [name: string]: string } = {
    'TxPermissionHbbft': '0x4000000000000000000000000000000000000001',
    'ValidatorSetHbbft': '0x1000000000000000000000000000000000000001',
    'StakingHbbft':      '0x1100000000000000000000000000000000000001',
    'BlockRewardHbbft':  '0x2000000000000000000000000000000000000001',
    'KeyGenHistory':     '0x7000000000000000000000000000000000000001',
  }

  const contractsToUpdate = [];

  //const contractToUpdate = 'KeyGenHistory';
  for (const contractToUpdate in contractAddresses) {

    const address = contractAddresses[contractToUpdate];

    console.log(`Updating ${contractToUpdate} on address ${address}`);
    const currentProxy = contractManager.getAdminUpgradeabilityProxy(address);
    
    //const currentProxy = await AdminUpgradeabilityProxy.at(address);
    let currentImplementationAddress = await currentProxy.methods.implementation().call();
    console.log(`current implementation: `, currentImplementationAddress);

    //console.log('proxyMethods: ',await currentProxy.methods);
    let currentAdmin = await currentProxy.methods.admin().call();
    console.log('currentAdmin: ', currentAdmin);

    if (currentAdmin !== account) {
      const errorMessage = `The Account ${account} is not allowed to upgrade. Admin is: ${currentAdmin}`;
      // console.error(errorMessage);
      throw Error(errorMessage);
    }

    //const contractArtifact = artifacts.require(contractToUpdate);
    const contractArtifact = artifactRequire(contractToUpdate) //web3.eth.Contract()


    const code = await web3.eth.getCode(currentImplementationAddress);
    const contractCode = contractArtifact.deployedBytecode;
    //const contractCode = contractArtifact.bytecode;
    const isEqual = contractCode === code;
    
    console.log(`${contractToUpdate} isEqual ? `, isEqual);

    let positions = [];

    if (!isEqual) {

      const lenExisting = contractCode.length;
      const lenNew = code.length;

      if (lenExisting === lenNew) {

        let countDifferences = 0;

        // at the end of the deployed contract, there is always a difference
        // to the information we have stored in the build.
        // https://docs.soliditylang.org/en/develop/contracts.html#call-protection-for-libraries
        let isDifferent = false;
        for(let i = 0; i < lenNew - 86; i++) {
          if (contractCode[i] !== code[i]) {
            countDifferences++;
            positions.push(lenNew - i);
            isDifferent = true;
          }
        }

        console.log(`${contractToUpdate} + 'length: ${lenNew} differences: ${countDifferences}. Positions: ${positions} isDifferent: `, isDifferent);

        if (isDifferent) {
          contractsToUpdate.push(contractToUpdate);
        }

      } else {
        console.log(`${contractToUpdate} + 'length difference: existing: ${lenExisting} new: ${lenNew}`);
        contractsToUpdate.push(contractToUpdate);
      }

      console.log(`${contractToUpdate} is not up to date!.`);
      //console.log(contractArtifact.bytecode);
      //console.log(code);

      console.log(`deploying new contract ${contractToUpdate}...`);
      const newContract = await deploy(web3, contractArtifact);
      console.log('deployed to ', newContract);
      console.log('upgrading...');
      // const txResult = await currentProxy.upgradeTo(newContract.address);
      // console.log(`upgrade result: ${txResult.tx} ${txResult.receipt.status}`, );
    
      console.log('verifying upgrade...');
      // currentImplementationAddress = await currentProxy.implementation.call();
      // console.log(`new implementation address: `, currentImplementationAddress);

    }
  }

  console.log('list of all contracts to update', contractsToUpdate);

  //todo: safety check: do you really want to deploy this contracts ?

  const deployedContracts : Dictionary<string> = {};

  for(let contract of contractsToUpdate) {
    const contractArtifact = artifactRequire(contract);
    console.log(`deploying new contract ${contract}...`);
    const newContractAddress = await deploy(contractManager.web3, contractArtifact);
    
    console.log('deployed to ', newContractAddress);
    deployedContracts[contract] = newContractAddress;
  }

  
  console.log('all contracts have been deployed on the blockchain. they are still inactive. creating update transaction');
  // const deployedContractAdresses = {};
  
  for(let contract of contractsToUpdate) {
   
    //const contract = contractsToUpdate[contractName];
    const contractArtifact = artifactRequire(contract);
    let doUpgradeCall = false;
    for (let abiItem of contractArtifact.abi) {
      if (abiItem.name === 'upgrade' && abiItem.inputs.length === 0) {
        doUpgradeCall = true;
        console.log('Upgrade call found for ' + contract);
        break;
      }
    }

    const adminUpgradeProxy = contractManager.getAdminUpgradeabilityProxy(contractAddresses[contract]);
    const currentImplementation = adminUpgradeProxy.methods.implementation().call();

    const web3 = contractManager.web3.eth.Contract;
    const newContractAddress = deployedContracts[contract];
    const encodedCall = await adminUpgradeProxy.methods.upgradeTo(newContractAddress).encodeABI();
    console.log(`upgrade would upgrade: ${contract} on address ${newContractAddress} to address ${newContractAddress}`);
    console.log(encodedCall);


    
    //encodeMulti(new MetaTransaction())
    
    // callContractInput = {
    //   type: TransactionType.callContract,
    //   id: '1',
    //   to: contract.address,
    //   value: '0x0',
    //   abi: contract.abi,
    //   functionSignature: '',
    //   inputValues: {
    //       [key: string]: ValueType;
    //   };


    // encodeSingle()


  }
}

  


doDeployContracts();

// module.exports = async function deployContracts(callback) {

//   console.log('deploying contracts.');

//   doDeployContracts().then(()=>{
//     console.log('upgrade finished.');
//     callback();
//   }).catch((e) => {
//     console.error('An Error occured while upgrading contracts');
//     callback(e);
//   });
// }

// console.log('starting update process');

//const newContract = new web3.eth.Contract();
// deployContracts();

// console.log('update started');
