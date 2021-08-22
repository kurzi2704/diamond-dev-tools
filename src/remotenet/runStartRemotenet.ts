


import * as child from 'child_process';

import { cmdR } from '../remoteCommand';

//var exec = require('child_process').exec, child;

import { NodeManager } from "../regression/nodeManager";



import { parse } from 'ts-command-line-args';
import { executeOnAllRemotes } from './executeOnAllRemotes';

interface IRemotnetArgs {
  onlyunavailable: boolean;
  numberOfNodes?: number;
}




async function run() {

  const pwdResult = child.execSync("pwd");

  console.log('operating in: ' + pwdResult.toString());

  const nodeManager = NodeManager.get();


  const args = parse<IRemotnetArgs>({
    onlyunavailable: { type: Boolean, alias: 'u'},
    numberOfNodes: { type: Number, alias: 'n', optional: true }
    });
  
  

  executeOnAllRemotes(`screen -S node_test -d -m ~/hbbft_testnet/node/start.sh`,args.numberOfNodes, args.onlyunavailable);

}


run();