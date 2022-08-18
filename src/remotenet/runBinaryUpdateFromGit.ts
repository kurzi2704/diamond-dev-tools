import { ConfigManager } from "../configManager";
import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";

async function run() {
  const nodes = await getNodesFromCliArgs();

  nodes.forEach(n => {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    console.log(`stopping node ${nodeName}`);
    try {
      cmdR(nodeName, `screen -X -S node_test quit`);
    } catch (e) {
      console.log('ignored error.');
    }

    const config = ConfigManager.getConfig();

    console.log(`pulling repo ${nodeName}`);
    cmdR(nodeName, `cd ~/${config.installDir} && git checkout start.sh && git pull`);

    try {
      console.log(`building ${nodeName}`);
      cmdR(nodeName, `cd ~/${config.installDir} && ~/${config.installDir}/build-from-source.sh`);

    } catch (e) {
      // compile results in non-zero exit code if there are warnings, so we ignore them.
    }

  });
}


//todo find better command, this kind of hard kills it.
run();