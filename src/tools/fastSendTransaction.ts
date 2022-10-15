

// a fast tx sender that can work in 3 stages to patch work transactions
// 1. signing
// 2. sending

import request from "request";
import { Dictionary } from "underscore";
import Web3 from "web3";
import { TransactionConfig } from "web3-eth";

// 3. waiting for receipt
export class FastTxSender {

  signedTransactions: string[] = [];
  transactionHashes: string[] = [];

  // holds the latest nonces for each used account.
  nonces: Dictionary<number> = {};

  public constructor(public web3: Web3, public support_tx_await: boolean) {

  }


  // slow function that looks up the wallet for signing.
  // avoid this and call signTransaction with a wallet parameter.
  public static async signTransaction(web3: Web3, txConfig: TransactionConfig) {
    if (!txConfig.from) {
      throw Error('txConfig.from is not set');
    }

    for (let i = 0 ; i < web3.eth.accounts.wallet.length; i++) {
      let wallet = web3.eth.accounts.wallet[i];
      if (wallet.address == txConfig.from) {
        return await web3.eth.accounts.signTransaction(txConfig, wallet.privateKey);
      }
    }

    throw Error(`wallet for ${txConfig.from} not found`);
  }

  public static async signTransaction(web3: Web3, txConfig: TransactionConfig) {
    
  }

  // add transaction to the pool of transactions being sent.
  public async addTransaction (txConfig: TransactionConfig) {
    // signes the transaction and adds it to the pool of transactions and the transaction hash for verification.

  }

  public async sendTxs() {

    let rpc_cmd =
    {
      method: 'eth_sendRawTransaction',
      params: [signed.rawTransaction],
      jsonrpc: "2.0",
      id: 666
    }


    // curl --data '{"method":"eth_sendRawTransaction","params":["0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675"],"id":1,"jsonrpc":"2.0"}' -H "Content-Type: application/json" -X POST localhost:8545
    var headersOpt = {
      "content-type": "application/json",
    };

    // todo: extend functionaly that it supports others than localhost.
    let  sendAddress = 'http://127.0.0.1:8540';

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
