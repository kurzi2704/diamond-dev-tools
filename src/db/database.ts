import createConnectionPool, { ConnectionPool } from '@databases/pg';

import tables, { WhereCondition, not } from '@databases/pg-typed';

import moment from 'moment';

import {
  AvailableEvent,
  AvailableEvent_InsertParameters,
  DelegateReward,
  DelegateStaker,
  Headers,
  Node,
  OrderedWithdrawal,
  OrderedWithdrawal_InsertParameters,
  PendingValidatorStateEvent,
  PendingValidatorStateEvent_InsertParameters,
  PosdaoEpoch,
  PosdaoEpochNode,
  StakeHistory,
  StakeHistory_InsertParameters
} from './schema';

import DatabaseSchema from './schema';

import { ConfigManager } from '../configManager';
import { sql } from "@databases/pg";
import { ContractManager, DelegateRewardData } from '../contractManager';
import BigNumber from 'bignumber.js';

/// manage database connection.
// export class Database {

//     private is_connected: boolean = false;

//     private connection?: Connection;

//     public open() {
//         if (this.is_connected) {
//             return;
//         }

//         connection = new Connection(

//         );

//         this.is_connected = true;
//     }

// }


// export {sql};

// const db = createConnectionPool();
// export default db;

// You can list whatever tables you actually have here:
const {
  headers,
  posdao_epoch,
  posdao_epoch_node,
  node,
  available_event,
  ordered_withdrawal,
  stake_history,
  delegate_reward,
  delegate_staker,
  pending_validator_state_event
} = tables<DatabaseSchema>({
  databaseSchema: require('./schema/schema.json'),
});

export { headers, posdao_epoch, posdao_epoch_node, node };

const TIMESTAMP_TYPE_ID = 1114;

// const {posdaoepoch} = tables<PosdaoEpoch>({
//   databaseSchema: require('./schema/schema.json'),
// });
// export posdaoepoch;


//export async function

/// Tables of the DB in the order of dependency reversed.
//export const DB_TABLES = ["delegate_reward", "posdao_epoch_node", "delegate_staker", "stake_history", "PendingValidatorStateEvent", "OrderedWithdrawal",  "posdao_epoch", "PendingValidatorState", "node", "headers" ];

export const DB_TABLES = [
  "delegate_reward",
  "posdao_epoch_node",
  "delegate_staker",
  "pending_validator_state_event",
  "ordered_withdrawal",
  "posdao_epoch",
  "stake_history",
  "available_event",
  "node",
  "headers"
];


export class DbManager {
  connectionPool: ConnectionPool

  public constructor() {
    this.connectionPool = getDBConnection();

    this.connectionPool.registerTypeParser(TIMESTAMP_TYPE_ID, str => new Date(moment.utc(str).format()));
  }

  public async deleteCurrentData() {
    let tablesToDelete = DB_TABLES;

    for (let table of tablesToDelete) {
      await this.connectionPool.query(sql`DELETE FROM public.${sql.ident(table)};`);
    }
  }

  public async insertHeader(
    number: number & { readonly __brand?: 'headers_block_number' },
    hash: string,
    duration: number,
    time: Date,
    extraData: string,
    transactionCount: number,
    posdaoEpoch: number,
    txsPerSec: number,
    reinsertPotValue: string,
    deltaPotValue: string,
    governanceValue: string,
    rewardContractTotalValue: string,
    unclaimedRewardsValue: string,
  ) {
    await headers(this.connectionPool).insert({
      block_hash: hash,
      block_duration: duration,
      block_number: number,
      block_time: time.toUTCString(),
      extra_data: extraData,
      transaction_count: transactionCount,
      txs_per_sec: txsPerSec,
      posdao_hbbft_epoch: posdaoEpoch,
      reinsert_pot: ethAmountToPostgresNumeric(reinsertPotValue),
      delta_pot: ethAmountToPostgresNumeric(deltaPotValue),
      governance_pot: ethAmountToPostgresNumeric(governanceValue),
      reward_contract_total: ethAmountToPostgresNumeric(rewardContractTotalValue),
      unclaimed_rewards: ethAmountToPostgresNumeric(unclaimedRewardsValue)
    });
  }

  public async getLastProcessedEpoch(): Promise<PosdaoEpoch | null> {

    let result = await this.connectionPool.query(sql`SELECT MAX(id) as id FROM posdao_epoch;`);

    let resultLine: any = -1;
    if (result.length == 1) {
      resultLine = result[0];
    } else {
      return null;
    }

    if (!resultLine) {
      return null;
    }

    return await posdao_epoch(this.connectionPool).findOne({ id: resultLine.id });
  }

  /// get the last block that was processed.
  public async getLastProcessedBlock(): Promise<Headers | null> {

    let result = await this.connectionPool.query(sql`SELECT MAX(block_number) as block_number FROM headers;`);

    let resultLine: any = -1;
    if (result.length == 1) {
      resultLine = result[0];
    } else {
      return null;
    }

    if (!resultLine) {
      return null;
    }

    return await headers(this.connectionPool).findOne({ block_number: resultLine.block_number });
  }


  public async insertStakingEpoch(epochNumber: number, blockStartNumber: number) {
    // todo...
    let result = await posdao_epoch(this.connectionPool).insert(
      {
        id: epochNumber,
        block_start: blockStartNumber
      }
    );

    return result;
  }

  public async updateValidatorReward(rewardedValidator: string, epoch: number, reward: string) {
    let validator = convertEthAddressToPostgresBuffer(rewardedValidator);

    let ownerReward = ethAmountToPostgresNumeric(reward);
    await posdao_epoch_node(this.connectionPool).update({ id_posdao_epoch: epoch, id_node: validator }, { owner_reward: ownerReward });
  }

  public async endStakingEpoch(epochToEnd: number, epochsLastBlockNumber: number) {
    await posdao_epoch(this.connectionPool).update({
      id: epochToEnd
    }, {
      block_end: epochsLastBlockNumber
    });
  }

  public async insertNode(poolAddress: string, miningAddress: string, miningPublicKey: string, addedBlock: number): Promise<Node> {
    let result = await node(this.connectionPool).insert({
      pool_address: convertEthAddressToPostgresBuffer(poolAddress),
      mining_address: convertEthAddressToPostgresBuffer(miningAddress),
      mining_public_key: convertEthAddressToPostgresBuffer(miningPublicKey),
      added_block: addedBlock
    });

    return result[0];
  }

  public async insertEpochNode(posdaoEpoch: number, validator: string, contractManager: ContractManager): Promise<PosdaoEpochNode> {
    let result = await posdao_epoch_node(this.connectionPool).insert({
      id_node: convertEthAddressToPostgresBuffer(validator),
      id_posdao_epoch: posdaoEpoch
    });

    return result[0];
  }

  public async getNodes(): Promise<Node[]> {

    let all = await node(this.connectionPool).find().all()
    all.sort((a, b) => { return a.pool_address.compare(b.pool_address) });
    return all;
  }

  public async insertAvailabilityEvent(params: AvailableEvent_InsertParameters): Promise<AvailableEvent> {
    const result = await available_event(this.connectionPool).insert(params);

    return result[0];
  }

  public async insertOrderWithdrawalEvent(params: OrderedWithdrawal_InsertParameters): Promise<OrderedWithdrawal> {
    const result = await ordered_withdrawal(this.connectionPool).insert(params);

    return result[0];
  }

  public async getOrderWithdrawalEvent(params: WhereCondition<OrderedWithdrawal>): Promise<OrderedWithdrawal | null> {
    return await ordered_withdrawal(this.connectionPool).findOne(params);
  }

  public async updateOrderWithdrawalEvent(where: WhereCondition<OrderedWithdrawal>, update: Partial<OrderedWithdrawal>): Promise<OrderedWithdrawal> {
    const result = await ordered_withdrawal(this.connectionPool).update(where, update);

    return result[0];
  }

  public async insertStakeHistoryRecord(params: StakeHistory_InsertParameters): Promise<StakeHistory> {
    const result = await stake_history(this.connectionPool).insert(params);

    return result[0];
  }

  public async getLastStakeHistoryRecord(poolAddress: string): Promise<StakeHistory | null> {
    const sqlPoolAddress = convertEthAddressToPostgresBuffer(poolAddress);

    const result = await this.connectionPool.query(sql`
      SELECT
        from_block, to_block, stake_amount, node
      FROM stake_history
      WHERE
        node = ${sqlPoolAddress}
        AND to_block = (
          SELECT MAX(to_block)
          FROM stake_history
          WHERE from_block = to_block AND node = ${sqlPoolAddress}
        )
    `);

    let resultLine: any = -1;
    if (result.length == 1) {
      resultLine = result[0];
    } else {
      return null;
    }

    if (!resultLine) {
      return null;
    }

    return await stake_history(this.connectionPool).findOne({
      from_block: resultLine.from_block,
      to_block: resultLine.to_block,
      stake_amount: resultLine.stake_amount,
      node: sqlPoolAddress
    });
  }

  public async updateStakeHistory(where: WhereCondition<StakeHistory>, update: Partial<StakeHistory>): Promise<StakeHistory> {
    const result = await stake_history(this.connectionPool).update(where, update);

    return result[0];
  }

  public async getDelegatorRewardRecord(pool: string, epoch: number, delegator: string): Promise<DelegateReward | null> {
    return await delegate_reward(this.connectionPool).findOne({
      id_delegator: convertEthAddressToPostgresBuffer(delegator),
      id_node: convertEthAddressToPostgresBuffer(pool),
      id_posdao_epoch: epoch
    });
  }

  public async updateDelegatorRewardRecord(pool: string, epoch: number, delegator: string): Promise<DelegateReward> {
    const result = await delegate_reward(this.connectionPool).update({
      id_delegator: convertEthAddressToPostgresBuffer(delegator),
      id_node: convertEthAddressToPostgresBuffer(pool),
      id_posdao_epoch: epoch
    }, {
      is_claimed: true
    });

    return result[0];
  }

  public async insertDelegateStaker(delegators: string[]): Promise<DelegateStaker[]> {
    const insertData = delegators.map((x) => {
      return {
        id: convertEthAddressToPostgresBuffer(x)
      }
    });

    return await delegate_staker(this.connectionPool).insertOrIgnore(...insertData);
  }

  public async insertDelegateRewardsBulk(rewards: DelegateRewardData[]): Promise<DelegateReward[]> {
    const records = rewards.map((reward) => {
        return {
          id_delegator: convertEthAddressToPostgresBuffer(reward.delegatorAddress),
          id_node: convertEthAddressToPostgresBuffer(reward.poolAddress),
          id_posdao_epoch: reward.epoch,
          is_claimed: reward.isClaimed
        }
    });

    const result = await delegate_reward(this.connectionPool).bulkInsert({
      columnsToInsert: ['is_claimed'],
      records: records
    });

    return result;
  }

  public async getValidators(): Promise<PendingValidatorStateEvent[]> {
    return await pending_validator_state_event(this.connectionPool).find({
      on_exit_block_number: null
    }).all();
  }

  public async findValidator(node: string, state: string): Promise<PendingValidatorStateEvent | null> {
    return await pending_validator_state_event(this.connectionPool).findOne({
      node: convertEthAddressToPostgresBuffer(node),
      on_exit_block_number: null,
      state: state
    });
  }

  public async insertValidator(validator: PendingValidatorStateEvent_InsertParameters): Promise<PendingValidatorStateEvent> {
    const result = await pending_validator_state_event(this.connectionPool).insert(validator);

    return result[0];
  }

  public async updateOrIgnoreValidator(node: string, state: string, exitBlockNumber: number): Promise<PendingValidatorStateEvent | null> {
    const existingRecord = await pending_validator_state_event(this.connectionPool).findOne({
      node: convertEthAddressToPostgresBuffer(node),
      on_enter_block_number: not(exitBlockNumber),
      on_exit_block_number: null,
      state: state
    });

    if (!existingRecord) {
      return null;
    }

    const result = await pending_validator_state_event(this.connectionPool).update({
        node: convertEthAddressToPostgresBuffer(node),
        state: state,
        on_enter_block_number: existingRecord.on_enter_block_number,
    }, {
        on_exit_block_number: exitBlockNumber
    });

    return result[0];
  }
}

export function convertEthAddressToPostgresBuffer(ethAddress: string): Buffer {

  // convert ethAddress to a buffer.
  let hexString = ethAddress.toLowerCase().replace("0x", "");
  let buffer = Buffer.from(hexString, 'hex');
  return buffer;
}

export function convertEthAddressToPostgresBits(ethAddress: string): string {
  let hexString = ethAddress.toLowerCase().replace("0x", "");

  // we need to convert the hex string to a bit string.
  let bitString = "";
  for (let i = 0; i < hexString.length; i++) {
    let hexChar = hexString[i];
    let hexNumber = parseInt(hexChar, 16);
    let binaryString = hexNumber.toString(2);
    bitString += binaryString.padStart(4, '0');
  }

  return bitString;
}

export function convertPostgresBitsToEthAddress(ethAddress: string): string {

  // we have a string of 0 and 1 and we need to convert it to hex.

  let hexString = "";
  for (let i = 0; i < ethAddress.length; i += 4) {
    let bitString = ethAddress.substring(i, i + 4);
    let hexNumber = parseInt(bitString, 2);
    let hexChar = hexNumber.toString(16);
    hexString += hexChar;
  }

  return "0x" + hexString.toLowerCase();
}

export function convertBufferToEthAddress(buffer: Buffer) {
  return "0x" + buffer.toString('hex');
}

export function ethAmountToPostgresNumeric(ethAmount: string): string {
  // we need to convert ETH style number to postgres style numbers.

  let number = new BigNumber(ethAmount);
  BigNumber.set({ DECIMAL_PLACES: 18 });
  // BigNumber.set({ })

  number = number.dividedBy(1e18);


  let fmt = {
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 3,
    secondaryGroupSize: 2
  }

  return number.toFormat(18, fmt);
}

export function getDBConnection(): ConnectionPool {

  // let config = ConfigManager.getConfig();
  let networkConfig = ConfigManager.getNetworkConfig();


  const pw = process.env["DMD_DB_POSTGRES"];
  if (!pw || pw.length == 0) {
    let msg = "Environment variable DMD_DB_POSTGRES is not set.";
    console.log(msg);
    throw Error(msg);
  }
  let connectionString = `postgres://postgres:${pw}@${networkConfig.db}/postgres`;
  // console.log(connectionString);
  return createConnectionPool(connectionString);
}

