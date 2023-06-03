
import createConnectionPool, { Connection, ConnectionPool, Queryable } from '@databases/pg';


import tables from '@databases/pg-typed';
import DatabaseSchema, { Headers, PosdaoEpoch } from './schema';
import { ConfigManager } from '../configManager';
import { sql } from "@databases/pg";
import { ContractManager } from '../contractManager';
// import posdao_epoch from './schema/posdao_epoch';


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
const { headers, posdao_epoch, posdao_epoch_node } = tables<DatabaseSchema>({
  databaseSchema: require('./schema/schema.json'),
});

export { headers, posdao_epoch, posdao_epoch_node };

// const {posdaoepoch} = tables<PosdaoEpoch>({
//   databaseSchema: require('./schema/schema.json'),
// });
// export posdaoepoch;


//export async function 

export class DbManager {
  
  connectionPool: ConnectionPool

  public constructor() {
    this.connectionPool = getDBConnection();
  }

  public async insertHeader(
    number: number & { readonly __brand?: 'headers_block_number' },
    hash: string,
    duration: number,
    time: Date,
    extraData: string,
    transactionCount: number,
    txsPerSec: number) {
    //await users(db).insert({email, favorite_color: favoriteColor});

    await headers(this.connectionPool).insert({
      block_hash: hash,
      block_duration: duration,
      block_number: number,
      block_time: time,
      extra_data: extraData,
      transaction_count: transactionCount,
      txs_per_sec: txsPerSec
    });
    //await headers()
  }

  /// get the last block that was processed.
  public async getLastProcessedBlock() : Promise<Headers | null> {

    let result = await this.connectionPool.query(sql`SELECT MAX(block_number) as block_number FROM headers;`);

    let blockNumber = -1;
    if (result.length == 1) {
      blockNumber = result[0];
    } else {
      return null;
    }

    return await headers(this.connectionPool).findOne({block_number: blockNumber});
  }


  public async insertStakingEpoch(epochNumber: number, blockStartNumber: number) {

    // todo...

    await posdao_epoch(this.connectionPool).insert(
      {
        id: epochNumber,
        block_start: blockStartNumber
      }
    );

  
  
  }

  public async endStakingEpoch(epochToEnd: number, epochsLastBlockNumber: number) {
    await posdao_epoch(this.connectionPool).update( {
      id: epochToEnd
    }, {
      block_end: epochsLastBlockNumber
    });
  }

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