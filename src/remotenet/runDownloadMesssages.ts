import * as child from 'child_process';
import { ConfigManager } from '../configManager';
import { cmd, cmdR } from '../remoteCommand';
import { executeOnRemotes, transferFilesToRemote, transferFilesToRemotes, transferFileToRemote } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

function zipDir(nodeName: string, blockNumber: number) {
      

    try {
      //cmdR(nodeName, `scp ${nodeName}:~/hbbft_testnet/node/data/messages testnet/`);
      //tar -zcvf archive-name.tar.gz source-directory-name

      const remoteBackupFile = `~/hbbft_testnet/node/message-backup-${nodeName}-${blockNumber}.tar.gz`;

      cmdR(nodeName, `tar -zcf ${remoteBackupFile} -C ~/hbbft_testnet/node/data/messages/${blockNumber} .`);
      
      // cmd(`scp ${nodeName}:~/hbbft_testnet/node/message-backup-${blockNumber}.tar.gz testnet/testnet-analysis/${nodeName}-${blockNumber}.tar.gz`);


      const localCompressedFile = `testnet/testnet-analysis/messages/${nodeName}-${blockNumber}.tar.gz`;
      cmd(`scp ${nodeName}:${remoteBackupFile} ${localCompressedFile}`);


      const targetDirectory = `testnet/testnet-analysis/messages/${nodeName}/${blockNumber}`;
      cmd(`mkdir -p ${targetDirectory}`);

      cmd(`tar -xzf ${localCompressedFile} -C ${targetDirectory}`);

      //cmd(`scp ${nodeName}:~/hbbft_testnet/node/message-backup.tar.gz testnet/testnet-analysis/logs/${nodeName}`);
    } catch (e)
    {
      //ignore.
    }
} 



async function run() {

  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());
  const args = parseRemotenetArgs();

  const nodes =  await getNodesFromCliArgs();
  const web3 = ConfigManager.getWeb3();

  // we are interstet in the block that is about to get build.
  const blockToRetrieve = (await web3.eth.getBlockNumber()) + 1;

  for(let i = 0; i <nodes.length; i++) {
    const node = nodes[i];
    const nodeName = `hbbft${node.nodeID}`;
    
    
    zipDir(nodeName, blockToRetrieve);
    
  };
  //todo find better command, this kind of hard kills it.

  

}


run();