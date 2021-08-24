import { transferFilesToRemotes } from "./executeOnRemotes";
import { getNodesFromCliArgs } from "./remotenetArgs";


async function run() {
  transferFilesToRemotes("testnet/nodes-patch", await getNodesFromCliArgs());
}


run();

