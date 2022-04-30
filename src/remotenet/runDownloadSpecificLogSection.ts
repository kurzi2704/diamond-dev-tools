import { NodeState } from "../regression/nodeManager";
import { cmd, cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";
import fs from 'fs';

async function run() {

  //todo: work on configurability.
  //const date = '2021-09-03';
  const outputFileRemote = 'analyze_tx3e4f.log';
  const outputDirectory = 'testnet/testnet-analysis/log-slices/tx3e4f/';
  const remoteDirectory = '~/dmdv4-testnet/';

  //console.log(`creating filtered log file for ${date}`);
  console.log('ensuring output directory: ', outputDirectory);

  cmd('mkdir -p ' + outputDirectory);

  // const cmd_boring_connections = 'INFO parity_ws::io  Accepted a new tcp connection from';

  const tx = '0x3e4f45027c924f9b4a803162cee14f205a35ea4fc460a5fa3a28884f6f1b577f';

  //console.log(`creating filtered log file for tx ${date}`);
  const command = `cat ${remoteDirectory}parity.log | grep ${tx} | sed '/Accepted a new tcp connection from/d' > ${remoteDirectory}${outputFileRemote}`;

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
  for (const promise of promisses) {
    await promise;
  }
  console.log(`work finished.`);



}

run();