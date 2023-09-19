import { ConfigManager } from '../configManager';
import { cmdR, cmdRemoteAsync } from '../remoteCommand';
import { getBuildFromSourceCmd } from './buildFromSource';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const nodes = await getNodesFromCliArgs();

  for (const n of nodes) {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    console.log(`stopping node ${nodeName}`);
    try {
      cmdR(nodeName, `screen -X -S ${ConfigManager.getRemoteScreenName()} quit`);
    } catch (e) {
      console.log('ignored error.');
    }

    const config = ConfigManager.getNetworkConfig();

    console.log(`pulling repo ${nodeName}`);
    cmdR(nodeName, `cd ~/${config.installDir} && git checkout start.sh reserved-peers spec.json && git pull`);

    let remotes = cmdR(nodeName, `cd ~/${config.installDir}/diamond-node-git && git remote show`);
    console.log("remotes");

    console.log(remotes);
    if (!remotes.includes("surfingnerd")) {
      cmdR(nodeName, `cd ~/${config.installDir}/diamond-node-git && git remote add surfingnerd https://github.com/SurfingNerd/diamond-node.git`);
    }

    cmdR(nodeName, `cd ~/${config.installDir}/diamond-node-git && git fetch --all`);
   
    
    // git remote add sn https://github.com/SurfingNerd/diamond-node.git
    // git fetch sn 
    cmdR(nodeName, `cd ~/${config.installDir}/diamond-node-git && git checkout ${config.openEthereumBranch} && git pull`);

    try {
      console.log(`building ${nodeName}`);
      const buildCmd = getBuildFromSourceCmd();
      // cmdR(nodeName, buildCmd);
      await cmdR(nodeName, buildCmd);
    } catch (e) {
      // compile results in non-zero exit code if there are warnings, so we ignore them.
    }


    try {
      console.log(`copying diamond-node for ${nodeName}`);
      const dmdProfile = ConfigManager.getConfig().openEthereumProfile;
      const copyComand = `cp ~/${config.installDir}/diamond-node-git/target/${dmdProfile}/diamond-node ~/${config.installDir}/diamond-node`;
      // cmdR(nodeName, buildCmd);
      await cmdR(nodeName, copyComand);

    } catch (e) {
      // compile results in non-zero exit code if there are warnings, so we ignore them.
    }

    n.startRemote();



  }
}

// todo find better command, this kind of hard kills it.
run();
