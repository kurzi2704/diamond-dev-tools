import Web3 from 'web3';
import { ValidatorSetHbbft } from './abi/contracts/ValidatorSetHbbft';
import JsonValidatorSetHbbft from './abi/json/ValidatorSetHbbft.json';

import { StakingHbbft } from './abi/contracts/StakingHbbft';
import JsonStakingHbbft from './abi/json/StakingHbbft.json';

import { KeyGenHistory } from './abi/contracts/KeyGenHistory';
import JsonKeyGenHistory from './abi/json/KeyGenHistory.json';

import { BlockRewardHbbftBase } from './abi/contracts/BlockRewardHbbftBase';
import JsonBlockRewardHbbftBase from './abi/json/BlockRewardHbbftBase.json';

import { AdminUpgradeabilityProxy } from './abi/contracts/AdminUpgradeabilityProxy';
import JsonAdminUpgradeabilityProxy from './abi/json/AdminUpgradeabilityProxy.json';

import { Registry } from './abi/contracts/Registry';
import JsonRegistry from './abi/json/Registry.json';

import { ConfigManager } from './configManager';
import BigNumber from 'bignumber.js';
import { BlockType } from './abi/contracts/types';



export enum KeyGenMode {
  NotAPendingValidator = 0,
  WritePart,
  WaitForOtherParts,
  WriteAck,
  WaitForOtherAcks,
  AllKeysDone
}

export interface ContractAddresses {
  validatorSetAddress: string
}

// Hex string to number
function h2n(hexString: string): number {
  return new BigNumber(hexString).toNumber();
}

function h2bn(hexString: string): BigNumber {
  return new BigNumber(hexString);
}
export class ContractManager {

  


  private cachedValidatorSetHbbft?: ValidatorSetHbbft;
  private cachedStakingHbbft?: StakingHbbft;
  private cachedKeyGenHistory?: KeyGenHistory;
  private cachedRewardContract?: BlockRewardHbbftBase;

  public constructor(public web3: Web3) {

  }

  /**
   * retrieves a ContractManager with the web3 context from current configuration.
  */
  public static get(): ContractManager {
    const web3 = ConfigManager.getWeb3();
    const contractManager = new ContractManager(web3);
    return contractManager;
  }

  public static getContractAddresses(): ContractAddresses {
    //todo: query other addresses ?!
    // more intelligent contract manager that queries lazy ?
    return { validatorSetAddress: '0x1000000000000000000000000000000000000001' }
  }

  public getValidatorSetHbbft(): ValidatorSetHbbft {

    if (this.cachedValidatorSetHbbft) {
      return this.cachedValidatorSetHbbft;
    }

    const contractAddresses = ContractManager.getContractAddresses();

    const abi: any = JsonValidatorSetHbbft.abi;
    const validatorSetContract: any = new this.web3.eth.Contract(abi, contractAddresses.validatorSetAddress);
    this.cachedValidatorSetHbbft = validatorSetContract;
    //const validatorSet : ValidatorSetHbbft = validatorSetContract;
    return validatorSetContract;
  }

  public getRegistry(): Registry {

    const abi: any = JsonRegistry.abi;
    let result: any = new this.web3.eth.Contract(abi, '0x6000000000000000000000000000000000000000');
    return result;
  }

  public async getRewardHbbft(): Promise<BlockRewardHbbftBase> {
    if (this.cachedRewardContract) {
      return this.cachedRewardContract;
    }

    const contractAddress = await this.getValidatorSetHbbft().methods.blockRewardContract().call();

    const abi: any = JsonBlockRewardHbbftBase.abi;
    const result: any = new this.web3.eth.Contract(abi, contractAddress);
    this.cachedRewardContract = result;
    //const validatorSet : ValidatorSetHbbft = validatorSetContract;
    return this.cachedRewardContract!;
  }

  public async getEpoch(blockNumber: BlockType): Promise<number> {
    return h2n(await (await this.getStakingHbbft()).methods.stakingEpoch().call({}, blockNumber));
  }

  public async getEpochStartBlock(blockNumber: BlockType = 'latest') {
    return h2n(await (await this.getStakingHbbft()).methods.stakingEpochStartBlock().call({}, blockNumber));
  }

  public async getStakingHbbft(): Promise<StakingHbbft> {

    if (this.cachedStakingHbbft) {
      return this.cachedStakingHbbft;
    }

    const contractAddress = await this.getValidatorSetHbbft().methods.stakingContract().call();

    const abi: any = JsonStakingHbbft.abi;
    const stakingContract: any = new this.web3.eth.Contract(abi, contractAddress);
    this.cachedStakingHbbft = stakingContract;
    return stakingContract;
  }

  public async getKeyGenHistory(): Promise<KeyGenHistory> {

    if (this.cachedKeyGenHistory) {
      return this.cachedKeyGenHistory;
    }

    const contractAddress = await this.getValidatorSetHbbft().methods.keyGenHistoryContract().call();
    console.log('KeyGenHistory address: ', contractAddress);

    const abi: any = JsonKeyGenHistory.abi;
    const contract: any = new this.web3.eth.Contract(abi, contractAddress);
    this.cachedKeyGenHistory = contract;
    return contract;
  }

  public getAdminUpgradeabilityProxy(contractAddress: string): AdminUpgradeabilityProxy {

    const abi: any = JsonAdminUpgradeabilityProxy.abi;
    const contract: any = new this.web3.eth.Contract(abi, contractAddress);
    return contract;
  }

  public async isValidatorAvailable(miningAddress: string, blockNumber: BlockType = 'latest') {
    const validatorAvailableSince = new BigNumber(await (await this.getValidatorSetHbbft()).methods.validatorAvailableSince(miningAddress).call({}, blockNumber));
    return !validatorAvailableSince.isZero();
  }


  public async getTotalStake(address: string,  blockNumber: BlockType = 'latest') {
    return h2bn(await (await this.getStakingHbbft()).methods.stakeAmountTotal(address).call({}, blockNumber));
  }

  public async getMinStake(blockNumber: BlockType = 'latest') {
    return h2bn(await (await this.getStakingHbbft()).methods.candidateMinStake().call({}, blockNumber));
  }


  public async getValidators(blockNumber: BlockType = 'latest') {
    return await this.getValidatorSetHbbft().methods.getValidators().call({}, blockNumber);
  }

  public async getPendingValidators(blockNumber: BlockType = 'latest') {
    return await this.getValidatorSetHbbft().methods.getPendingValidators().call({}, blockNumber);
  }


  public async getPendingValidatorState(validator: string, blockNumber: BlockType = 'latest'): Promise<KeyGenMode> {
    return h2n(await this.getValidatorSetHbbft().methods
      .getPendingValidatorKeyGenerationMode(validator).call({}, blockNumber));
  }

  public async getAddressStakingByMining(miningAddress: string, blockNumber: BlockType = 'latest') {
    return this.getValidatorSetHbbft().methods.stakingByMiningAddress(miningAddress).call({}, blockNumber);
  }

  public async getKeyPARTBytesLength(validator: string, blockNumber: BlockType = 'latest') {
    const part = await this.getKeyPART(validator, blockNumber);
    return (part.length - 2) / 2;
  }

  public async getKeyPART(validator: string, blockNumber: BlockType = 'latest'): Promise<string> {
    return await (await this.getKeyGenHistory()).methods.getPart(validator).call({}, blockNumber);
  }

  // retrieves only the number of written Acks (so not that much data has to get transferted.
  public async getKeyACKSNumber(validator: string, blockNumber: BlockType = 'latest'): Promise<number> {
    return h2n(await (await this.getKeyGenHistory()).methods.getAcksLength(validator).call({}, blockNumber));
  }

  // public async getKeyGenRound(blockNumber: BlockType = 'latest') {
  //   return h2n(await (await this.getKeyGenHistory()).methods.getCurrentKeyGenRound().call({}, blockNumber));
  // }

}
