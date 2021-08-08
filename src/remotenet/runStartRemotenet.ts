


import * as child from 'child_process';

import { cmdR } from '../remoteCommand';

//var exec = require('child_process').exec, child;

import { NodeManager } from "../regression/nodeManager";


async function run() {

  const pwdResult = child.execSync("pwd");

  console.log('operating in: ' + pwdResult.toString());

  const nodeManager = NodeManager.get();

  const passedArgument = process.argv[2];
  let numberOfNodes = Number(passedArgument);

  if (isNaN(numberOfNodes)) {
    numberOfNodes = nodeManager.nodeStates.length;
  }


  const nodesSubdir = 'testnet/nodes';
  const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

  for(let i = 1; i <= numberOfNodes; i++) {
    
    const nodeName = `hbbft${i}`;
    
    console.log(`starting node ${i} in a screen`);
    cmdR(nodeName, `screen -S node_test -d -m ~/hbbft_testnet/node/start.sh`);

  }

}


run();