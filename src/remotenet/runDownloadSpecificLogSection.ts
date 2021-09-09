import { NodeState } from "../regression/nodeManager";
import { cmd, cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";
import fs from 'fs';

async function run() {

  //todo: work on configurability.
  const date = '2021-09-03';
  const outputFileRemote = 'analyze_block_16958_error.log';
  const outputDirectory = 'testnet/testnet-analysis/log-slices/block_16958/';
  const remoteDirectory = '~/hbbft_testnet/node/';

  console.log(`creating filtered log file for ${date}`);
  console.log('ensuring output directory: ', outputDirectory);

  cmd('mkdir -p ' + outputDirectory);

  // const cmd_boring_connections = 'INFO parity_ws::io  Accepted a new tcp connection from';
  

  const command  = `cat ${remoteDirectory}parity.log | grep '${date}' | sed '/Rejecting recently rejected/d' > ${remoteDirectory}analyze_block_16958_error.log`;
  const nodes = await getNodesFromCliArgs();
  


  async function workNodeAsync(node: NodeState) {

    const sshName = node.sshNodeName();
    const remoteFileFullPath = remoteDirectory + outputFileRemote;
    const targetFileFullPath = `${outputDirectory}/${sshName}.log`;
    
    if (fs.existsSync(targetFileFullPath)) {
      console.log(`target file already found. skipping node ${sshName} - delete file if you want to execute operation again.`);
      return;
    }

    console.log(`${sshName} creating on ${outputFileRemote}`);
    console.log(`${sshName} deleting current file if available:  ${outputFileRemote}`);

    try {
      cmdR(sshName, `rm ${remoteFileFullPath}`);
    } catch {
      //just ignore file not found.
    }

    console.log(`${sshName} creating log file....`);
    cmdR(sshName, command);
    console.log(`${sshName} downloading created file log slice.`);
    
    cmd(`scp ${sshName}:${remoteFileFullPath} ${outputDirectory}/${sshName}.log`);
  }

  //async.each(nodes, workNodeAsync);


  const promisses = new Array<Promise<any>>();

  console.log(`working all ${nodes.length} in parallel.`);

  nodes.forEach(async (node) => {
    const promise = new Promise(() => workNodeAsync(node));
    promisses.push(promise);
  });

  console.log(`awaiting work.`);
  for(const promise of promisses) {
    await promise;
  }
  console.log(`work finished.`);

  
  
}

run();