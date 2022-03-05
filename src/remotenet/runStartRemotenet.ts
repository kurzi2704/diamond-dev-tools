import * as child from 'child_process';
import { executeOnRemotes } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

async function run() {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());

  const nodesToExecute = await getNodesFromCliArgs();

  executeOnRemotes(`cd dmdv4-testnet && screen -S node_test -d -m ~/dmdv4-testnet/start.sh`, nodesToExecute);

}

run();