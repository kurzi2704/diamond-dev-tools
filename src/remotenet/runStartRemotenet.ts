import * as child from 'child_process';
import { cmdR } from '../remoteCommand';
import { executeOnRemotes } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

async function run() {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  const nodesToExecute = await getNodesFromCliArgs();

  for (const n of nodesToExecute) {

    const nodeName = `hbbft${n.nodeID}`;
    try {

      console.log(`=== ${nodeName} ===`);

      const runningScreens = cmdR(nodeName, `screen -ls`);

      if (runningScreens.includes('node_test')) {
        console.log('WARNING: node_test screen already running!!');
      } else {
        cmdR(nodeName, `cd dmdv4-testnet && screen -S node_test -d -m ~/dmdv4-testnet/start.sh`);
      }

      
    } catch (e) {
      console.log(`ignoring error on ${nodeName}`);
    }
  }

  executeOnRemotes(`cd dmdv4-testnet && screen -S node_test -d -m ~/dmdv4-testnet/start.sh`, nodesToExecute);

}

run();