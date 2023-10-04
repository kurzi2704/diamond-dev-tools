import * as child from 'child_process';
import { ConfigManager } from '../configManager';
import { ContractManager } from '../contractManager';
import { cmd, cmdR } from '../remoteCommand';
import { executeOnRemotes, transferFilesToRemote, transferFilesToRemotes, transferFileToRemote } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

function zipDir(nodeName: string, blockNumber: number): boolean {


  const installDir = ConfigManager.getNetworkConfig().installDir;

  try {
    
    const remoteBackupFile = `~/${installDir}/message-backup-${nodeName}-${blockNumber}.tar.gz`;

    cmdR(nodeName, `tar -zcf ${remoteBackupFile} -C ~/${installDir}/data/messages/${blockNumber} .`);

    const targetDirectory = `testnet/testnet-analysis/messages/${nodeName}/${blockNumber}`;
    cmd(`mkdir -p ${targetDirectory}`);

    const localCompressedFile = `testnet/testnet-analysis/messages/${nodeName}-${blockNumber}.tar.gz`;
    cmd(`scp ${nodeName}:${remoteBackupFile} ${localCompressedFile}`);

    cmd(`tar -xzf ${localCompressedFile} -C ${targetDirectory}`);

    cmd(`scp ${nodeName}:~/${installDir}/message-backup.tar.gz testnet/testnet-analysis/logs/${nodeName}`);

    return true;
  } catch (e) {
    return false;
  }
}



async function run() {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());
  const args = parseRemotenetArgs();

  const nodes = await getNodesFromCliArgs();
  const web3 = ConfigManager.getWeb3();

  // we are interstet in the block that is about to get build.
  const blockToRetrieve = (await web3.eth.getBlockNumber()) + 1;

  const contractManager = ContractManager.get();
  const validators = await contractManager.getValidators();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    let thisNodeIsValidator = false;

    if (node.address) {
      thisNodeIsValidator = validators.map(x => x.toLowerCase()).indexOf(node.address?.toLowerCase()) >= 0;
    }

    const nodeName = `hbbft${node.nodeID}`;

    zipDir(nodeName, blockToRetrieve);

  };
  //todo find better command, this kind of hard kills it.



}


run();