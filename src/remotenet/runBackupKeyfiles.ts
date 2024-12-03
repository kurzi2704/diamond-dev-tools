import { ConfigManager } from "../configManager";
import { NodeManager } from "../net/nodeManager";
import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";


async function runBackup() {

    const config = ConfigManager.getConfig();
    const networkConfig = ConfigManager.getNetworkConfig();

    //const backupPath = "testnet/backups-" + networkConfig.name;

    const backupDir = "backup-" + networkConfig.name;
    //cmdR( "mkdir " + backupDir);

    const nodeManager = NodeManager.get();
    const nodes = await getNodesFromCliArgs();

    const installDir = ConfigManager.getRemoteInstallDir();

    for(const n of nodes) {

        cmdR(n.sshNodeName(), "mkdir " + backupDir);
        cmdR(n.sshNodeName(), "mkdir " + backupDir + "/data");
        cmdR(n.sshNodeName(), `cp -r  ${installDir}/data/keys ${backupDir}/data`);
        cmdR(n.sshNodeName(), `cp -r  ${installDir}/data/network ${backupDir}/data`);

        cmdR(n.sshNodeName(), `cp -r  ${installDir}/*.toml ${backupDir}`);
        cmdR(n.sshNodeName(), `cp -r  ${installDir}/diamond-node ${backupDir}`);
    }
}

runBackup();