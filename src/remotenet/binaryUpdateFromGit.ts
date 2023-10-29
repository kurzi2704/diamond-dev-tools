import { ConfigManager } from '../configManager';
import { NodeState } from '../net/nodeManager';
import { cmdR } from '../remoteCommand';
import { getBuildFromSourceCmd } from './buildFromSource';

export async function doBinaryUpdateFromGit(n: NodeState): Promise<string> {

    let result = "";
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    const config = ConfigManager.getNetworkConfig();
    console.log(`pulling repo ${nodeName}`);
    // result += cmdR(nodeName, `cd ~/${config.installDir} && git checkout start.sh reserved-peers spec.json && git pull`);
    let remotes = cmdR(nodeName, `cd ~/${config.installDir}/diamond-node-git && git remote show`);
    console.log("remotes");
    result += remotes;

    console.log(remotes);
    if (!remotes.includes("surfingnerd")) {
        result += cmdR(nodeName, `cd ~/${config.installDir}/diamond-node-git && git remote add surfingnerd https://github.com/SurfingNerd/diamond-node.git`);
    }

    const diamondNodeBranch = ConfigManager.getOpenEthereumBranch();

    result += cmdR(nodeName, `cd ~/${config.installDir}/diamond-node-git &&  git fetch --all && git checkout ${diamondNodeBranch} && git pull`);

    try {
        console.log(`building ${nodeName}`);
        const buildCmd = getBuildFromSourceCmd(false, false);
        // cmdR(nodeName, buildCmd);
        result += cmdR(nodeName, buildCmd);
    } catch (e) {
        //result += e.toString();
        // compile results in non-zero exit code if there are warnings, so we ignore them.
    }


    console.log(`stopping node ${nodeName}`);

    try {
        cmdR(nodeName, `screen -X -S ${ConfigManager.getRemoteScreenName()} quit`);
    } catch (e) {
        console.log('ignored screen stop error.');
    }

    try {
        console.log(`copying diamond-node for ${nodeName}`);
        const dmdProfile = ConfigManager.getConfig().openEthereumProfile;
        const copyComand = `cp ~/${config.installDir}/diamond-node-git/target/${dmdProfile}/diamond-node ~/${config.installDir}/diamond-node`;
        // cmdR(nodeName, buildCmd);
        result += cmdR(nodeName, copyComand);

    } catch (e) {
        // compile results in non-zero exit code if there are warnings, so we ignore them.
    }

    n.startRemote();

    return result;

}