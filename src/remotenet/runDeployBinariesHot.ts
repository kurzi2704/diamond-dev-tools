import * as child from 'child_process';
import { removeAdditionalFormatting } from 'ts-command-line-args';
import { cmd, cmdR } from '../remoteCommand';
import { executeOnRemotes, transferFilesToRemote, transferFilesToRemotes, transferFileToRemote } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

function getSha1FromCmdResult(cmdResult: string) : string {
  return cmdResult.substring(0, 40);
}


async function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}


// TODO: somehow this command always results in an error when run 

// function isScreenRunning(nodeName: string) {

//   const command = 'screen -ls | grep node_test'
//   const result = cmdR(nodeName, command);

//   if (result.length === 0) {
//     return false;
//   }

//   console.log('screen node_test is running on ', nodeName);
//   console.log(result);
//   return true;
// }

async function run() {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());
  const args = parseRemotenetArgs();

  const nodes =  await getNodesFromCliArgs();

  const localBinary = `../openethereum/target/release/openethereum`;
  const sha1LocalCmdResult = cmd(`sha1sum ${localBinary}`);
  const sha1Local = getSha1FromCmdResult(sha1LocalCmdResult);

  for(const node of nodes) {
    
    const nodeName = `hbbft${node.nodeID}`;
    const sha1RemoteCmdResult = cmdR(nodeName, `sha1sum ~/dmdv4-testnet/openethereum`);
    const sha1Remote = getSha1FromCmdResult(sha1RemoteCmdResult);

    if (sha1Local == sha1Remote) {
      console.log(`${nodeName} already up to date, skipping binary update.`);
      continue;
    }

    //if (isScreenRunning(nodeName)) {
      console.log(`stopping ${nodeName}`);
      try {
        cmdR(nodeName, 'screen -X -S node_test quit');
      } catch (e) {
        console.log('error durring stopping. probably screen not running. ignoring problem.');
      }
    //}

    await sleep(2000);
    
    // if (isScreenRunning(nodeName)) {
    //   console.log(`wait until screen for ${nodeName} stopps.`)
    //   do {
    //     await sleep(333);
    //     process.stdout.write(".");
    //   } while(isScreenRunning(nodeName))
    // }
    
    console.log(`updating openethereum on ${nodeName}`);
    await transferFileToRemote(localBinary,nodeName);
    console.log(`starting node: ${nodeName}`);
    
    cmdR(nodeName, "screen -S node_test -d -m ~/dmdv4-testnet/start.sh");
  };
  //todo find better command, this kind of hard kills it.

  

}


run();