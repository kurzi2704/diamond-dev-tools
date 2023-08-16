import Web3 from 'web3';
import { ValidatorSetHbbft } from './abi/contracts/ValidatorSetHbbft';
import JsonValidatorSetHbbft from './abi/json/ValidatorSetHbbft.json';

import { StakingHbbft } from './abi/contracts/StakingHbbft';
import JsonStakingHbbft from './abi/json/StakingHbbft.json';

import { KeyGenHistory } from './abi/contracts/KeyGenHistory';
import JsonKeyGenHistory from './abi/json/KeyGenHistory.json';

import { BlockRewardHbbftBase } from './abi/contracts/BlockRewardHbbftBase';
import JsonBlockRewardHbbftBase from './abi/json/BlockRewardHbbftBase.json';

import { RandomHbbft } from './abi/contracts/RandomHbbft';
import JsonRandomHbbft from './abi/json/RandomHbbft.json';

import { Registry } from './abi/contracts/Registry';
import JsonRegistry from './abi/json/Registry.json';

import { ConfigManager } from './configManager';
import BigNumber from 'bignumber.js';
import { BlockType } from './abi/contracts/types';


import { BlockTransactionString } from 'web3-eth';
import {
  AvailabilityEvent,
  ClaimedOrderedWithdrawalEvent,
  GatherAbandonedStakesEvent,
  MovedStakeEvent,
  OrderedWithdrawalEvent,
  StakeChangedEvent
} from './eventsVisitor';


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

export type ContractEvent = AvailabilityEvent
  | MovedStakeEvent
  | StakeChangedEvent
  | OrderedWithdrawalEvent
  | ClaimedOrderedWithdrawalEvent
  | GatherAbandonedStakesEvent;

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

  public constructor(public web3: Web3) { }

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

    return validatorSetContract;
  }

  public getRegistry(): Registry {
    const abi: any = JsonRegistry.abi;
    let result: any = new this.web3.eth.Contract(abi, '0x6000000000000000000000000000000000000000');
    return result;
  }

  public async getRewardContractAddress() {
    return await this.getValidatorSetHbbft().methods.blockRewardContract().call();
  }

  public async getRewardHbbft(): Promise<BlockRewardHbbftBase> {
    if (this.cachedRewardContract) {
      return this.cachedRewardContract;
    }

    const contractAddress = await this.getRewardContractAddress();

    const abi: any = JsonBlockRewardHbbftBase.abi;
    const result: any = new this.web3.eth.Contract(abi, contractAddress);
    this.cachedRewardContract = result;

    return this.cachedRewardContract!;
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

  public async getEpoch(blockNumber: BlockType): Promise<number> {
    return h2n(await (await this.getStakingHbbft()).methods.stakingEpoch().call({}, blockNumber));
  }

  public async getEpochStartBlock(blockNumber: BlockType = 'latest'): Promise<number> {
    return h2n(await (await this.getStakingHbbft()).methods.stakingEpochStartBlock().call({}, blockNumber));
  }

  public async getPlacedStakeEvents(fromBlockNumber: number, toBlockNumber: number): Promise<StakeChangedEvent[]> {
    let stakingContract = await this.getStakingHbbft();
    let eventsFilterOptions = { fromBlock: fromBlockNumber, toBlock: toBlockNumber }

    let pastEvents = await stakingContract.getPastEvents('PlacedStake', eventsFilterOptions);

    let result = new Array<StakeChangedEvent>();

    for (let event of pastEvents) {
      let blockNumber = event.blockNumber;
      let returnValues = event.returnValues;

      let blockTimestamp = (await this.web3.eth.getBlock(blockNumber)).timestamp;

      let poolAddress: string = returnValues.toPoolStakingAddress;
      let staker: string = returnValues.staker;
      let epoch: number = returnValues.stakingEpoch;
      let amount: BigNumber = returnValues.amount;

      result.push(new StakeChangedEvent(
        'PlacedStake',
        blockNumber,
        Number(blockTimestamp),
        returnValues.toPoolStakingAddress,
        returnValues.staker,
        returnValues.stakingEpoch,
        returnValues.amount
      ));

      console.log(`${amount} stake placed on Block ${blockNumber} during epoch ${epoch} from ${staker} on pool ${poolAddress}`);
    }

    return result;
  }

  public async getWithdrewStakeEvents(fromBlockNumber: number, toBlockNumber: number): Promise<StakeChangedEvent[]> {
    let stakingContract = await this.getStakingHbbft();
    let eventsFilterOptions = { fromBlock: fromBlockNumber, toBlock: toBlockNumber }

    let events = await stakingContract.getPastEvents('WithdrewStake', eventsFilterOptions);

    let result = new Array<StakeChangedEvent>();

    for (let event of events) {
      let values = event.returnValues;
      let blockTimestamp = (await this.web3.eth.getBlock(event.blockNumber)).timestamp;

      result.push(new StakeChangedEvent(
        'WithdrewStake',
        event.blockNumber,
        Number(blockTimestamp),
        values.fromPoolStakingAddress,
        values.staker,
        values.stakingEpoch,
        values.amount
      ));
    }

    return result;
  }

  public async getMovedStakeEvents(fromBlockNumber: number, toBlockNumber: number): Promise<MovedStakeEvent[]> {
    let stakingContract = await this.getStakingHbbft();
    let eventsFilterOptions = { fromBlock: fromBlockNumber, toBlock: toBlockNumber }

    let events = await stakingContract.getPastEvents('MovedStake', eventsFilterOptions);

    let result = new Array<MovedStakeEvent>();

    for (let event of events) {
      let values = event.returnValues;
      let blockTimestamp = (await this.web3.eth.getBlock(event.blockNumber)).timestamp;

      result.push(new MovedStakeEvent(
        'MovedStake',
        event.blockNumber,
        Number(blockTimestamp),
        values.fromPoolAddress,
        values.toPoolStakingAddress,
        values.staker,
        values.stakingEpoch,
        values.amount
      ));
    }

    return result;
  }

  public async getWithdrawalOrderEvents(
    fromBlockNumber: number,
    toBlockNumber: number
  ): Promise<(OrderedWithdrawalEvent | ClaimedOrderedWithdrawalEvent)[]> {
    let stakingContract = await this.getStakingHbbft();
    let eventsFilterOptions = { fromBlock: fromBlockNumber, toBlock: toBlockNumber }

    let result = new Array<OrderedWithdrawalEvent | ClaimedOrderedWithdrawalEvent>();

    let orderWithdrawalEvents = await stakingContract.getPastEvents('OrderedWithdrawal', eventsFilterOptions);

    for (let event of orderWithdrawalEvents) {
      let values = event.returnValues;
      let blockTimestamp = (await this.web3.eth.getBlock(event.blockNumber)).timestamp;

      result.push(new OrderedWithdrawalEvent(
        'OrderedWithdrawal',
        event.blockNumber,
        Number(blockTimestamp),
        values.fromPoolStakingAddress,
        values.staker,
        values.stakingEpoch,
        values.amount
      ));
    }

    let claimOrderedWithdrawalEvents = await stakingContract.getPastEvents('ClaimedOrderedWithdrawal', eventsFilterOptions);

    for (let event of claimOrderedWithdrawalEvents) {
      let values = event.returnValues;
      let blockTimestamp = (await this.web3.eth.getBlock(event.blockNumber)).timestamp;

      result.push(new ClaimedOrderedWithdrawalEvent(
        'ClaimedOrderedWithdrawal',
        event.blockNumber,
        Number(blockTimestamp),
        values.fromPoolStakingAddress,
        values.staker,
        values.stakingEpoch,
        values.amount
      ));
    }

    return result;
  }

  public async getAvailabilityEvents(fromBlockNumber: number, toBlockNumber: number): Promise<AvailabilityEvent[]> {
    // event ValidatorAvailable(msg.sender, timestamp)
    // event ValidatorUnavailable(miningAddress, block.timestamp);

    const blocksFilter = { fromBlock: fromBlockNumber, toBlock: toBlockNumber };
    const validatorSetContract = this.getValidatorSetHbbft();

    let result: AvailabilityEvent[] = new Array<AvailabilityEvent>();

    let becameAvailableEvents = await validatorSetContract.getPastEvents('ValidatorAvailable', blocksFilter);
    let becameUnavailableEvents = await validatorSetContract.getPastEvents('ValidatorUnavailable', blocksFilter);

    for (let event of becameAvailableEvents) {
      let blockNumber = event.blockNumber;
      let returnValues = event.returnValues;

      result.push(new AvailabilityEvent(
        'ValidatorAvailable',
        blockNumber,
        returnValues.timestamp,
        returnValues.validator,
        true
      ));
    }

    for (let event of becameUnavailableEvents) {
      let blockNumber = event.blockNumber;
      let returnValues = event.returnValues;

      result.push(new AvailabilityEvent(
        'ValidatorUnavailable',
        blockNumber,
        returnValues.timestamp,
        returnValues.validator,
        false
      ));
    }

    return result;
  }

  public async getGatherAbandonedStakesEvents(fromBlockNumber: number, toBlockNumber: number): Promise<GatherAbandonedStakesEvent[]> {
    let stakingContract = await this.getStakingHbbft();
    let eventsFilterOptions = { fromBlock: fromBlockNumber, toBlock: toBlockNumber }

    let events = await stakingContract.getPastEvents('GatherAbandonedStakes', eventsFilterOptions);

    let result = new Array<GatherAbandonedStakesEvent>();

    for (let event of events) {
      let values = event.returnValues;
      let blockTimestamp = (await this.web3.eth.getBlock(event.blockNumber)).timestamp;

      result.push(new GatherAbandonedStakesEvent(
        'GatherAbandonedStakes',
        event.blockNumber,
        Number(blockTimestamp),
        values.caller,
        values.stakingAddress,
        values.gatheredFunds
      ));
    }

    return result;
  }

  public async getStakeUpdateEvents(
    blockNumberFrom: number,
    blockNumberTo: number
  ): Promise<ContractEvent[]> {
    const stakeEvents = await this.getPlacedStakeEvents(blockNumberFrom, blockNumberTo);
    const withdrawalEvents = await this.getWithdrewStakeEvents(blockNumberFrom, blockNumberTo);
    const moveStakeEvents = await this.getMovedStakeEvents(blockNumberFrom, blockNumberTo);
    const orderWithdrawalEvents = await this.getWithdrawalOrderEvents(blockNumberFrom, blockNumberTo);
    const abandonedStakesEvents = await this.getGatherAbandonedStakesEvents(blockNumberFrom, blockNumberTo);

    let result: Array<ContractEvent> = [
      ...stakeEvents,
      ...withdrawalEvents,
      ...moveStakeEvents,
      ...orderWithdrawalEvents,
      ...abandonedStakesEvents
    ];

    result.sort((a, b) => a.blockNumber - b.blockNumber);

    return result;
  }

  public async getAllEvents(fromBlockNumber: number, toBlockNumber: number): Promise<ContractEvent[]> {

    const availabilityEvents = await this.getAvailabilityEvents(fromBlockNumber, toBlockNumber);
    const stakeUpdateEvents = await this.getStakeUpdateEvents(fromBlockNumber, toBlockNumber);

    let result: Array<ContractEvent> = [
      ...availabilityEvents,
      ...stakeUpdateEvents
    ];

    return result;
  }

  public async getAvailableSince(miningAddress: string) {
    let availableSince = await this.getValidatorSetHbbft().methods.validatorAvailableSince(miningAddress).call();

    return availableSince;
  }

  public async getReward(pool: string, staker: string, posdaoEpoch: number, block: number): Promise<string> {
    let contract = await this.getStakingHbbft();
    let result = await contract.methods.getRewardAmount([posdaoEpoch], pool, staker).call({}, block);

    return result;
  }

  public async isValidatorAvailable(miningAddress: string, blockNumber: BlockType = 'latest') {
    const validatorAvailableSince = new BigNumber(await (await this.getValidatorSetHbbft()).methods.validatorAvailableSince(miningAddress).call({}, blockNumber));
    return !validatorAvailableSince.isZero();
  }

  public async getTotalStake(address: string, blockNumber: BlockType = 'latest') {
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

  public async getPoolsInactive(blockNumber: BlockType = 'latest') {
    return await (await this.getStakingHbbft()).methods.getPoolsInactive().call({}, blockNumber);
  }

  public async getAllPools(blockNumber: BlockType = 'latest') {
    let pools = await this.getPools();
    let poolsInactive = await this.getPoolsInactive();

    let result = pools.concat(poolsInactive);
    return result;
  }

  public async getValidatorCandidates(blockNumber: BlockType = 'latest') {
    // todo: for performance reasons we could need a getValidatorCandidates on contract level,
    // to make it easier for ui's to get active pools only
    const pools = await this.getPools(blockNumber);
    const minStake = await this.getMinStake(blockNumber);

    const result: Array<string> = [];
    for (let p of pools) {
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

  public async getAddressMiningByStaking(stakingAddress: string, blockNumber: BlockType = 'latest') {
    return this.getValidatorSetHbbft().methods.miningByStakingAddress(stakingAddress).call({}, blockNumber);
  }

  public async getPublicKey(poolAddress: string, blockNumber: BlockType = 'latest') {
    return this.getValidatorSetHbbft().methods.publicKeyByStakingAddress(poolAddress).call({}, blockNumber);
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

  // public async getRewardsUnclaimed(blockNumber: number) {

  //   return "0";
  // }

  public async getRewardContractTotal(blockNumber: number) {
    const contractAddress = await this.getValidatorSetHbbft().methods.blockRewardContract().call({}, blockNumber);
    let balance = await this.web3.eth.getBalance(contractAddress, blockNumber);
    return balance;
  }

  public async getRewardReinsertPot(blockNumber: number) {
    let contract = await this.getRewardHbbft();
    return await contract.methods.reinsertPot().call({}, blockNumber);
  }

  public async getRewardDeltaPot(blockNumber: number) {
    let contract = await this.getRewardHbbft();
    return await contract.methods.deltaPot().call({}, blockNumber);
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
