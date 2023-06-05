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

import { RandomHbbft } from './abi/contracts/RandomHbbft';
import JsonRandomHbbft  from './abi/json/RandomHbbft.json';

import { Registry } from './abi/contracts/Registry';
import JsonRegistry from './abi/json/Registry.json';

import { ConfigManager } from './configManager';
import BigNumber from 'bignumber.js';
import { BlockType } from './abi/contracts/types';


import { BlockTransactionString } from 'web3-eth';


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

export class StakeChangedEvent {

  public constructor(public poolAddress: string, public stakerAddress: string, public epoch: number, public blockNumber: number) {

  }

}

// export class StakeChangedEventCollection {



//   public add(event: StakeChangedEvent) {

//   }
// }


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

  public async getPlacedStakeEvents(fromBlockNumber: number, toBlockNumber: number) {
    // throw new Error("Method not implemented.");

    let stakingContract = (await this.getStakingHbbft());

    let eventsFilterOptions = { fromBlock: fromBlockNumber, toBlock: toBlockNumber}

    let pastEvents = await stakingContract.getPastEvents('PlacedStake', eventsFilterOptions);
    
    for (let event of pastEvents) {

      let blocknumber = event.blockNumber;
      let returnValues = event.returnValues;

      let poolAddress : string = returnValues.toPoolStakingAddress;
      let staker : string = returnValues.staker;
      let epoch : number = returnValues.stakingEpoch;
      let amount : BigNumber = returnValues.amount;

      console.log(`${amount} stake placed on Block ${blocknumber} during epoch ${epoch} from ${staker} on pool ${poolAddress}`);

    }
    //return (await this.getStakingHbbft()).events.PlacedStake({fromBlock: fromBlockNumber})
  }

  public async getStakeUpdateEvents(blockNumberFrom: number, blockNumberTo: number) : Promise<StakeChangedEvent[]> {

    let result : StakeChangedEvent[] = [];

    let stakingContract = (await this.getStakingHbbft());
    let eventsFilterOptions = { fromBlock: blockNumberFrom, toBlock: blockNumberTo};


    let pastPlacedStakeEvents = await stakingContract.getPastEvents('PlacedStake', );
    
    for (let pastPlacedStakeEvent of pastPlacedStakeEvents) {

      // let blocknumber = event.blockNumber;
      let returnValues = pastPlacedStakeEvent.returnValues;

      let poolAddress : string = returnValues.toPoolStakingAddress;
      let staker : string = returnValues.staker;
      let epoch : number = returnValues.stakingEpoch;
      // let amount : BigNumber = returnValues.amount;

      //console.log(`${amount} stake placed on Block ${blocknumber} during epoch ${epoch} from ${staker} on pool ${poolAddress}`);
      
      let event = new StakeChangedEvent(poolAddress, staker, epoch, pastPlacedStakeEvent.blockNumber);
      console.log(`event: `, event);
      result.push(event);
    }


    let pastWithdrawnStakeEvents = await stakingContract.getPastEvents('WithdrewStake', eventsFilterOptions);

    //     event WithdrewStake(
    //     address indexed fromPoolStakingAddress,
    //     address indexed staker,
    //     uint256 indexed stakingEpoch,
    //     uint256 amount
    // );

    for (let pastWithdrawnStakeEvent of pastWithdrawnStakeEvents) {
      let values = pastWithdrawnStakeEvent.returnValues;

      let event = new StakeChangedEvent(values.fromPoolStakingAddress, values.staker, values.stakingEpoch, pastWithdrawnStakeEvent.blockNumber);
      console.log(`event withdraw: `, event);
      result.push(event);
    }


    // -- MovedStake --

    //   event MovedStake(
    //     address fromPoolStakingAddress,
    //     address indexed toPoolStakingAddress,
    //     address indexed staker,
    //     uint256 indexed stakingEpoch,
    //     uint256 amount
    // );

    let pastMoveStakeEvents = await stakingContract.getPastEvents('MovedStake', eventsFilterOptions);

    for (let pastWithdrawnStakeEvent of pastMoveStakeEvents) {

      let values = pastWithdrawnStakeEvent.returnValues;
      let eventFrom = new StakeChangedEvent(values.fromPoolStakingAddress, values.staker, values.stakingEpoch, pastWithdrawnStakeEvent.blockNumber);
      let eventTo = new StakeChangedEvent(values.toPoolStakingAddress, values.staker, values.stakingEpoch, pastWithdrawnStakeEvent.blockNumber);
      
      // console.log(`event withdraw: `, event);
      result.push(eventFrom);
      result.push(eventTo);
    }

    // -- OrderedWithdrawal --
  //   event OrderedWithdrawal(
  //     address indexed fromPoolStakingAddress,
  //     address indexed staker,
  //     uint256 indexed stakingEpoch,
  //     int256 amount
  // );

    let pastOrderWithdrawEvents = await stakingContract.getPastEvents('OrderedWithdrawal', eventsFilterOptions);

    for (let pastWithdrawnStakeEvent of pastOrderWithdrawEvents) {

      let values = pastWithdrawnStakeEvent.returnValues;
      let event = new StakeChangedEvent(values.fromPoolStakingAddress, values.staker, values.stakingEpoch, pastWithdrawnStakeEvent.blockNumber);
      
      // console.log(`event withdraw: `, event);
      result.push(event);
    }
    
    result.sort((a, b) => a.blockNumber - b.blockNumber);

  //   event WithdrewStake(
  //     address indexed fromPoolStakingAddress,
  //     address indexed staker,
  //     uint256 indexed stakingEpoch,
  //     uint256 amount
  // );


    return result;

  }


  


  public async getStakeChangedEvents(fromBlockNumber: number, toBlockNumber: number) {
    // throw new Error("Method not implemented.");

    let stakingContract = (await this.getStakingHbbft());

    let pastEvents = await stakingContract.getPastEvents('PlacedStake', { fromBlock: fromBlockNumber, toBlock: toBlockNumber});
    
    for (let event of pastEvents) {

      let blocknumber = event.blockNumber;
      let returnValues = event.returnValues;

      let poolAddress : string = returnValues.toPoolStakingAddress;
      let staker : string = returnValues.staker;
      let epoch : number = returnValues.stakingEpoch;
      let amount : BigNumber = returnValues.amount;

      console.log(`${amount} stake placed on Block ${blocknumber} during epoch ${epoch} from ${staker} on pool ${poolAddress}`);

    }
    //return (await this.getStakingHbbft()).events.PlacedStake({fromBlock: fromBlockNumber})
  }


  public getRandomHbbftFromAddress(contractAddress: string): RandomHbbft {

    const abi: any = JsonRandomHbbft.abi;
    const contract: any = new this.web3.eth.Contract(abi, contractAddress);
    return contract;
  }

  public async getRandomHbbft(): Promise<RandomHbbft> {

    let contractAddress = await this.getValidatorSetHbbft().methods.randomContract().call();

    const abi: any = JsonRandomHbbft.abi;
    const contract: any = new this.web3.eth.Contract(abi, contractAddress);
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

  // public async getValidatorAdded() {
  //   return await (await this.getStakingHbbft()).events.ValidatorAdded().call({});
  // }

  public async getPools(blockNumber: BlockType = 'latest') {
    return await (await this.getStakingHbbft()).methods.getPools().call({}, blockNumber);
  }

  public async getValidatorCandidates(blockNumber: BlockType = 'latest') {
    // todo: for performance reasons we could need a getValidatorCandidates on contract level,
    // to make it easier for ui's to get active pools only
    const pools = await this.getPools(blockNumber);
    const minStake = await this.getMinStake(blockNumber);

    const result : Array<string> = [];
    for(let p of pools) {
      const poolStake = await this.getTotalStake(p, blockNumber);
      if (poolStake.gte(minStake)) {
        result.push(p);
      }
    }

    return pools;
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

  public async getBlockInfos(blockHeader: BlockTransactionString, blockBeforeTimestamp: number) {
    const timeStamp = Number.parseInt(String(blockHeader.timestamp));
    const blockBeforeTimeStamp = blockBeforeTimestamp;
    const duration = timeStamp - blockBeforeTimeStamp;
    const transaction_count = blockHeader.transactions.length;
    const txs_per_sec = transaction_count / duration;
    const posdaoEpoch = await this.getEpoch(blockHeader.number);
    return { timeStamp, duration, transaction_count, txs_per_sec, posdaoEpoch };
  }

}
