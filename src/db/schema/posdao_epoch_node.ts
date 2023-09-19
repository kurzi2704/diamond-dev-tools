/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: 3n7rq/A6EKlmvIgAVcMQDKX6JYnBZ7Y/3M/fKPM1C5aN9SLK2XdpXWabp7XI+8CQiMSbLafvYFsyRDbyKhG8/w==
 */

/* eslint-disable */
// tslint:disable

import Node from './node'
import PosdaoEpoch from './posdao_epoch'

interface PosdaoEpochNode {
  epoch_apy: (string) | null
  id_node: Node['pool_address']
  id_posdao_epoch: PosdaoEpoch['id']
  /**
   * @default false
   */
  is_claimed: (boolean) | null
  owner_reward: (string) | null
}
export default PosdaoEpochNode;

interface PosdaoEpochNode_InsertParameters {
  epoch_apy?: (string) | null
  id_node: Node['pool_address']
  id_posdao_epoch: PosdaoEpoch['id']
  /**
   * @default false
   */
  is_claimed?: (boolean) | null
  owner_reward?: (string) | null
}
export type {PosdaoEpochNode_InsertParameters}
