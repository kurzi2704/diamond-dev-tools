import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { executeOnAllRemotes, executeOnRemotesFromCliArgs } from './executeOnRemotes';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {

  const installDir = ConfigManager.getRemoteInstallDir();
  executeOnRemotesFromCliArgs(`cd ~/${installDir}/diamond-node-git && cargo clean`);

}

// todo find better command, this kind of hard kills it.
run();
