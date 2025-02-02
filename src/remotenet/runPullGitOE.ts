import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const nodes = await getNodesFromCliArgs();

  const nodeBranch = ConfigManager.getNodeBranch();

  const installDir = ConfigManager.getRemoteInstallDir();
  nodes.forEach((n) => {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    const remoteAlias =  ConfigManager.getNodeRepoAlias();
    const remotes = cmdR(nodeName, `cd ~/${installDir}/diamond-node-git && git remote show`);

    if (remotes.indexOf(remoteAlias) === -1) {
      const url = ConfigManager.getNodeRepoUrl();
      console.log(`Adding remote ${remoteAlias}: ${url}`);

      cmdR(nodeName, `cd ~/${installDir}/diamond-node-git && git remote add ${remoteAlias} ${url}`);
    }

    cmdR(nodeName, `cd ~/${installDir}/diamond-node-git && git fetch ${remoteAlias} && git checkout ${nodeBranch} && git pull`);
  });
}

// todo find better command, this kind of hard kills it.
run();
