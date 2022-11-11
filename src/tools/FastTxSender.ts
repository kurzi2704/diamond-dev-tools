

import request from "request";
import { Dictionary } from "underscore";
import Web3 from "web3";
import { Account } from "web3-core";
import { TransactionConfig } from "web3-eth";
import { awaitTransactions } from "./awaitTransactions";



// a fast tx sender that can work in 3 stages to patch work transactions
// signing and sending are different steps to be able to make "fast send" performance tests.
// sending is done by the direct JSON RPC Interface instead of the slow Web3 Interface.
// 1. signing
// 2. sending
// 3. waiting for receipt
export class FastTxSender {

  rawTransactions: string[] = [];
  transactionHashes: string[] = [];

  // holds the latest nonces for each used account.
  nonces: Dictionary<number> = {};

  accounts_is_initialized = false;
  accounts: Dictionary<Account> = {};

  blockBeforeSent: number = Number.NaN;

  rpcJsonHttpEndpoint: string = 'http://localhost:8540';
  //rpcJsonHttpEndpoint: string = 'http://38.242.206.143:8540';
  public constructor(public web3: Web3) {

    // get rpcJsonHttpEndpoint from web3
    // if (web3.currentProvider && web3.currentProvider['host'] {
    //   this.rpcJsonHttpEndpoint = web3.currentProvider.host;
    // }
  }

  private ensureAccountsIsInitialized() {

    // 
    if (!this.accounts_is_initialized) {

      for (let i = 0; i < this.web3.eth.accounts.wallet.length; i++) {
        let wallet = this.web3.eth.accounts.wallet[i];
        this.accounts[wallet.address] = wallet;
      }
    }
  }

  // adds transaction to the pool of transactions being sent.
  // first call will initialize the account pool and might be slow for large wallets.
  public async addTransaction(txConfig: TransactionConfig) : Promise<string> {
    if (!txConfig.from) {
      throw Error('txConfig.from is not set');
    }

    this.ensureAccountsIsInitialized();

    if (!this.accounts[txConfig.from]) {
      throw Error('txConfig.from is not in the wallet');
    }

    if (typeof txConfig.from === 'number') {
      throw Error('number as from address not supported.');
    }

    let account = this.accounts[txConfig.from];

    let nextNonce = Number.NaN;

    if (txConfig.from in this.nonces) {
      // if we have a nonce stored in nonces, we continue from there.
      nextNonce = this.nonces[txConfig.from] + 1;
    }
    else {
      // if we don't have a nonce, we get it from the network.
      nextNonce = await this.web3.eth.getTransactionCount(txConfig.from);
    }

    this.nonces[txConfig.from] = nextNonce;

    txConfig.nonce = nextNonce;
    let signedTransaction = await account.signTransaction(txConfig);

    if (!signedTransaction.rawTransaction) {
      throw Error("rawTransaction not received.");
    }

    if (!signedTransaction.transactionHash) {
      throw Error("No transaction hash.");
    }

    this.transactionHashes.push(signedTransaction.transactionHash);
    this.rawTransactions.push(signedTransaction.rawTransaction);

    return signedTransaction.transactionHash;
  }


  // sends all stored transactions.
  public async sendTxs() {

    if (this.rawTransactions.length === 0) {
      throw Error("addTransaction must be called and awaited in preparation to sendTxs.");
    }

    this.blockBeforeSent = await this.web3.eth.getBlockNumber();



    for (let raw of this.rawTransactions) {

      let rpc_cmd =
      {
        method: 'eth_sendRawTransaction',
        params: [raw],
        jsonrpc: "2.0",
        id: 666
      }


      // curl --data '{"method":"eth_sendRawTransaction","params":["0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675"],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8545
      var headersOpt = {
        "content-type": "application/json",
      };

      // todo: extend functionaly that it supports others than localhost.
      let sendAddress = this.rpcJsonHttpEndpoint;

      request.post(
        sendAddress, // todo: distribute transactions here to different nodes.
        {
          json: rpc_cmd,
          headers: headersOpt
        },
        function (error, response, body) {
          if (error) {
            //Trying to close the socket (to prevent socket hang up errors)
            //**Doesn't help**
            console.log('got error:', error);
            return;
          }
          if (response) {
            // console.log('got reponse:', response.statusCode);
            // console.log('got reponse body:', response.body);
          }
        });
    }
  }

  // waits for completion for all added transaction. 
  public async awaitTxs() {

    if (Number.isNaN(this.blockBeforeSent)) {
      throw new Error("sendTxs() must be called before awaitTxs() can be called.");
    }

    await awaitTransactions(this.web3, this.blockBeforeSent, this.transactionHashes);

    // clean up this FastTxSender instance, so it can be reused.
    this.reset();
  }

  public reset(reset_accounts = false) {
    this.rawTransactions = [];
    this.transactionHashes = [];
    this.blockBeforeSent = Number.NaN;
    // reset nonces as well, it's not that expensive to get them again.
    this.nonces = {};

    // if no accounts get added, we do not need to reset them.
    // that is usually the case.
    if (reset_accounts) {
      this.accounts = {};
      this.accounts_is_initialized = false
    }
  }
}
