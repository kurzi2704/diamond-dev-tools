/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: 2D0EmduPoq7tPViB8miHVQPiTBkAxJ0JeUFcxSze43SEUMsyftZ4n6YLXSQmzUsB43yxTaljSthrfSYjoXC3cQ==
 */

/* eslint-disable */
// tslint:disable

interface Headers {
  block_duration: number
  block_hash: string
  block_number: number & {readonly __brand?: 'headers_block_number'}
  block_time: Date
  delta_pot: (string) | null
  extra_data: string
  governance_pot: (string) | null
  posdao_hbbft_epoch: (number) | null
  reinsert_pot: (string) | null
  reward_contract_total: (string) | null
  transaction_count: number
  txs_per_sec: number
  unclaimed_rewards: (string) | null
}
export default Headers;

interface Headers_InsertParameters {
  block_duration: number
  block_hash: string
  block_number: number & {readonly __brand?: 'headers_block_number'}
  // block_time type was changed to string, because one of pg libraries uses local time instead of UTC
  // to write data in 'timestamp without timezone' column, causing timestamps with offset written in db
  block_time: string
  delta_pot?: (string) | null
  extra_data: string
  governance_pot?: (string) | null
  posdao_hbbft_epoch?: (number) | null
  reinsert_pot?: (string) | null
  reward_contract_total?: (string) | null
  transaction_count: number
  txs_per_sec: number
  unclaimed_rewards?: (string) | null
}
export type {Headers_InsertParameters}
