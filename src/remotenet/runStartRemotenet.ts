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
    let runOnThisNode = true;
    try {

      const runningScreens = cmdR(nodeName, `screen -ls`);

      if (runningScreens.includes('node_test')) {
        console.log('WARNING: node_test screen already running, not starting another one.!!');
        runOnThisNode = false;
      } else {
        
      }
      
    } catch (e) {
      // if no screen, we get an error - all good.
    }

    if (runOnThisNode) {
      cmdR(nodeName, `cd dmdv4-testnet && screen -S node_test -d -m ~/dmdv4-testnet/start.sh`);
    }

  }

}

run();