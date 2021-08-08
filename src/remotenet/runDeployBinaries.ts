


import * as child from 'child_process';

import * as fs from "fs";
import { cmdR } from '../remoteCommand';

//var exec = require('child_process').exec, child;

import { NodeManager } from "../regression/nodeManager";


function cmd(command: string) : string {
  console.log(command);
  const result = child.execSync(command);
  const txt = result.toString();
  console.log(txt);
  return txt;
}

async function run() {


  const pwdResult = child.execSync("pwd");

  console.log('operating in: ' + pwdResult.toString());

  const nodeManager = NodeManager.get();

  let deleteExistingServers 
    : boolean | undefined = undefined;

  const passedArgument = process.argv[2];
  let numberOfNodes = Number(passedArgument);

  if (isNaN(numberOfNodes)) {
    numberOfNodes = nodeManager.nodeStates.length;
  }

  // todo: option for "failsafe script".
  const startCommand = './openethereum -c node.toml';

  const nodesSubdir = 'testnet/nodes';
  const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

  console.log('Looking up local nodes directory:', nodesDirAbsolute);

  for(let i = 1; i <= numberOfNodes; i++) {
    console.log(`=== Node ${i} ===`);

    const nodeName = `hbbft${i}`;
    console.log('deploying openethereum executable.');
    const scpCommandExe = `scp ../openethereum/target/release/openethereum ${nodeName}:~/hbbft_testnet/node`;
    cmd(scpCommandExe);

    console.log(`starting node ${i} in a screen`);
    cmdR(nodeName, `screen -S node_test -d -m "cd ~/hbbft_testnet/node && ./openethereum -c=node.toml"`);

  }

}


run();