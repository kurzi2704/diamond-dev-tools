import { encodeSingle, encodeMulti, MetaTransaction, TransactionType, RawTransactionInput } from 'ethers-multisend';

import { ConfigManager } from "../configManager";
import { ContractManager } from '../contractManager';

import { Dictionary } from 'underscore';
import Web3 from 'web3';
import { artifactRequire } from './artifactRequire';
import { verifySourceCode } from './verifySourceCode';

async function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
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
    }
  }

  console.log('list of all contracts to update. TODO Ask user if he wants to deploy', contractsToUpdate);

  //todo: safety check: do you really want to deploy this contracts ?

  const deployedContracts : Dictionary<string> = {};

  for(let contract of contractsToUpdate) {
    const contractArtifact = artifactRequire(contract);
    console.log(`deploying new contract ${contract}...`);
    const newContractAddress = await deploy(contractManager.web3, contractArtifact);
    
    console.log(`skipping verifying source code on blockscout - since it does not work propably`);

    // console.log(`waiting for blockscout to catch up.`);
    // await sleep(20000);
    // console.log(`verifying source code on blockscout.`);
    // await verifySourceCode(contract, newContractAddress);

    //verify source code here:
    //
    //metadata
    //const sourceCode = fs.
    //const cmd = `?module=contract&action=verify&addressHash=${encodeURI(newContractAddress)}&name=${encodeURI(contract)}&compilerVersion={compilerVersion}&optimization={false}&contractSourceCode={contractSourceCode}`;

    console.log(`${contract} deployed to ${newContractAddress}`);
    deployedContracts['Contract'] = newContractAddress;
  }

  
  console.log('all contracts have been deployed on the blockchain. they are still inactive. creating update transaction');
  // const deployedContractAdresses = {};

  const metaTransactions : MetaTransaction[] = [];
  const upgradeMetaTransactions : MetaTransaction[] = [];
  
  for(let contract of contractsToUpdate) {
   
    //const contract = contractsToUpdate[contractName];

    const proxyAddress = contractAddresses[contract];
    const adminUpgradeProxy = contractManager.getAdminUpgradeabilityProxy(proxyAddress);
    const currentImplementation = await adminUpgradeProxy.methods.implementation().call();

    const web3 = contractManager.web3.eth.Contract;
    const newContractAddress = deployedContracts[contract];
    const encodedCall = adminUpgradeProxy.methods.upgradeTo(newContractAddress).encodeABI();
    console.log(`upgrade would upgrade: ${contract} on address ${proxyAddress} from address ${currentImplementation} to address ${newContractAddress}`);
    console.log(encodedCall);

    const input : RawTransactionInput = {
      type: TransactionType.raw,
      id: '0x0',
      to: proxyAddress,
      value: '0x0',
      data: encodedCall
    }


    const encodedInput = encodeSingle(input);
    metaTransactions.push(encodedInput);
    

    const contractArtifact = artifactRequire(contract);
    for (let abiItem of contractArtifact.abi) {
      if (abiItem.name === 'upgrade' && abiItem.inputs.length === 0) {
        console.log('Upgrade call found for ' + contract);
        const targetContractToUpdate = new contractManager.web3.eth.Contract(contractArtifact.abi, newContractAddress);
        const encodedCall : string = targetContractToUpdate.methods.upgrade().encodeABI();
        
        const input : RawTransactionInput = {
          type: TransactionType.raw,
          id: '0x0',
          to: proxyAddress,
          value: '0x0',
          data: encodedCall
        }
        upgradeMetaTransactions.push(encodeSingle(input));
        break;
      }
    }
  }

  if (metaTransactions.length > 0) {
    const allTransactions: MetaTransaction[] = [];
    allTransactions.push(...metaTransactions);
    allTransactions.push(...upgradeMetaTransactions);
    const x = encodeMulti(allTransactions, '0x1234567882f906C9843B573a49a364008deDDC27');

    console.log('Transaction:', x);
  }

  // todo: store deployment report for community discussion.

}

doDeployContracts();

