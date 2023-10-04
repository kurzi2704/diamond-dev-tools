import { ConfigManager } from '../configManager';
import { cmd, cmdR } from '../remoteCommand';

const { nodesDir } = ConfigManager.getNetworkConfig();

const realInstallDir = ConfigManager.getRpcLocalInstallDir();

const sshNode = ConfigManager.getRpcSSH();

try {
  cmdR(sshNode, `mkdir -p ~/${realInstallDir}`);
} catch (error) {

}

const nodesSubdir = `testnet/${nodesDir}`;
const nodesDirAbsolute = `${process.cwd()}/${nodesSubdir}`;

const scpRpcCommand = `scp -pr ${nodesDirAbsolute}/rpc_node/* ${sshNode}:~/${realInstallDir}`;
cmd(scpRpcCommand);
