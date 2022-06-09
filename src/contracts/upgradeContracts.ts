import { encodeSingle, encodeMulti, MetaTransaction, TransactionType, RawTransactionInput, isValid } from 'ethers-multisend';
import { Dictionary } from 'underscore';

import { ConfigManager } from "../configManager";
import { ContractManager } from '../contractManager';


import { artifactRequire, deploy } from './contractTools';
import { verifySourceCode } from './verifySourceCode';

async function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}


enum UpdateState {
  Unknown,
  IsUpToDate,
  Pending,
  Done
}

class ContractDeployment {
  constructor(
  public contractName: string,
  public currentAddress: string,
  public proxyAddress: string,
  public currentAdmin: string,
  public updateState: UpdateState = UpdateState.Unknown,
  public newAddress: string  = "",
  public upgradeCall: boolean = false,
  public deploymentHash: string = ""
  ) {

  }
}

class ContractDeploymentCollection extends Array<ContractDeployment> {

  public get(contractName: string) : ContractDeployment | undefined {
    
    return this.find(x=> x.contractName == contractName);
  }
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

  const contractAddresses : { [name: string]: string } = {
    'TxPermissionHbbft': '0x4000000000000000000000000000000000000001',
    'ValidatorSetHbbft': '0x1000000000000000000000000000000000000001',
    'StakingHbbft':      '0x1100000000000000000000000000000000000001',
    'BlockRewardHbbft':  '0x2000000000000000000000000000000000000001',
    'KeyGenHistory':     '0x7000000000000000000000000000000000000001',
  }

  let contractDeployments : ContractDeploymentCollection = new ContractDeploymentCollection();

  const contractsToUpdate = new ContractDeploymentCollection();

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

    let deployment = new ContractDeployment(contractToUpdate, currentImplementationAddress, address, currentAdmin);
    contractDeployments.push(deployment);

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
    
    // console.log(`${contractToUpdate} isEqual ? `, isEqual);

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

        deployment.updateState = isDifferent ? UpdateState.Pending : UpdateState.IsUpToDate;

        if (isDifferent) {
          contractsToUpdate.push(deployment);
        }

      } else {
        console.log(`${contractToUpdate} + 'length difference: existing: ${lenExisting} new: ${lenNew}`);
        deployment.updateState = UpdateState.Pending;
        contractsToUpdate.push(deployment);
      }

      console.log(`${contractToUpdate} is not up to date!.`);
    }
  }

  console.log('list of all contracts to update. TODO Ask user if he wants to deploy', contractsToUpdate);

  

  //todo: safety check: do you really want to deploy this contracts ?

  const deployedContracts : Dictionary<string> = {};

  for(let contract of contractsToUpdate) {
    const contractArtifact = artifactRequire(contract.contractName);
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
    deployedContracts[contract] = newContractAddress;
  }

  
  console.log('all contracts have been deployed on the blockchain. they are still inactive. creating update transaction');
  // const deployedContractAdresses = {};

  const metaTransactions : MetaTransaction[] = [];
  const upgradeMetaTransactions : MetaTransaction[] = [];
  
  for(let contract of contractsToUpdate) {
   
    //const contract = contractsToUpdate[contractName];
    console.log('update transaction for contract ', contract);  
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


  // handle MultiSend contract.

  let multiSendAddress : string | undefined = undefined;

  // if (!multiSendAddress) {

  //   console.log('MultiSend not found, deploying MultiSend');
  //   const artifactMultisend = artifactRequire('MultiSend');
  //   multiSendAddress = await deploy(web3, artifactMultisend);

  //   // console.log('Verifying Sourcecode of MultiSend on chain ', multiSendAddress);
  //   // await verifySourceCode('MultiSend', multiSendAddress);
  //   // console.log('Source code got verified.');
  // }

  if (metaTransactions.length > 0) {
    const allTransactions: MetaTransaction[] = [];
    allTransactions.push(...metaTransactions);
    allTransactions.push(...upgradeMetaTransactions);
    const x = encodeMulti(allTransactions, multiSendAddress);

    
    console.log('Transaction:', x);

    // for (const x of metaTransactions) {
    //   const upgradeResult = await web3.eth.sendTransaction({ 
    //     from: web3.eth.defaultAccount!,
    //     to: x.to,
    //     gas: '100000',
    //     gasPrice: '1000000000',
    //     data: x.data
    //   })
    //   console.log(`Tx: ${upgradeResult.transactionHash} Status: ${upgradeResult.status}`);
    // };
  }

  // todo: store deployment report for community discussion.
  
}

doDeployContracts();

