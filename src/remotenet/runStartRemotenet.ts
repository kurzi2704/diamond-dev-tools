import * as child from 'child_process';
import { executeOnRemotes } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

async function run() {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  const nodesToExecute = await getNodesFromCliArgs();

  executeOnRemotes(`screen -S node_test -d -m ~/hbbft_testnet/node/start.sh`, nodesToExecute);

}

run();