import { ConfigManager } from "../configManager";
import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";



async function run() {
    const nodes = await getNodesFromCliArgs();
    const installDir = ConfigManager.getInstallDir();
    nodes.forEach((n) => {
      const nodeName = `hbbft${n.nodeID}`;
      console.log(`=== ${nodeName} ===`);
      const cmd = `cd ${installDir} && git checkout reserved-peers &&  git checkout spec.json`;
      cmdR(nodeName,cmd);
    });
  }
  

  run();