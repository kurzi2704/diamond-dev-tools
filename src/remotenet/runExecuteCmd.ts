import { executeOnRemotes } from './executeOnRemotes';
import { getNodesFromCliArgs, } from './remotenetArgs';

async function run() {

  const nodesToExecute = await getNodesFromCliArgs();
  executeOnRemotes(`screen -wipe`, nodesToExecute);
}

run();