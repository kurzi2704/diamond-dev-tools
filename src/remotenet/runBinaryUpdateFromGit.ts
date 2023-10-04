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

    try {
      console.log(`building ${nodeName}`);
      const buildCmd = getBuildFromSourceCmd();
      // cmdR(nodeName, buildCmd);
      await cmdR(nodeName, buildCmd);
    } catch (e) {
      // compile results in non-zero exit code if there are warnings, so we ignore them.
    }
  }
}

// todo find better command, this kind of hard kills it.
run();
