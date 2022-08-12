import { ConfigManager } from "../configManager";
import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";


async function run() {
  const nodes = await getNodesFromCliArgs();
  const installDir = ConfigManager.getConfig().installDir;
  nodes.forEach(n => {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);
    cmdR(nodeName, `~/${installDir}/openethereum --version`);
    cmdR(nodeName, `sha1sum ~/${installDir}/openethereum`);
  });
}


//todo find better command, this kind of hard kills it.
run();