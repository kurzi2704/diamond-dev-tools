import { ConfigManager } from '../configManager';
import { NodeState } from '../net/nodeManager';
import { cmdR, cmdRemoteAsync } from '../remoteCommand';
import { doBinaryUpdateFromGit } from './binaryUpdateFromGit';
import { getBuildFromSourceCmd } from './buildFromSource';
import { getNodesFromCliArgs } from './remotenetArgs';


async function build(nodeName: string) : Promise<string> {
  
    let result = await cmdRemoteAsync(nodeName, getBuildFromSourceCmd());
    console.log(result);
    return result;
}


async function run() {

  const nodes = await getNodesFromCliArgs();

  const promises : Promise<string>[] = [];

  let finished = 0;
  let all = nodes.length;

  for (const n of nodes) {
    
    let promise = doBinaryUpdateFromGit(n);
    promise.then((result) => { 
      console.log(`finished ${n.sshNodeName()}. ${finished}/${all} ${100 * finished/all}%`);
    } );
    promises.push(promise);
  }

  for (let i of promises.keys()) { 
    
    const promise = promises[i];
    const node = nodes[i];

    let result = await promise;

    console.log(`=== ${node.sshNodeName()} ===`);
    console.log(result);
    console.log(`= END = ${node.sshNodeName()} = END =`);
  }


  console.log('All nodes have been build and updated.');

}

// todo find better command, this kind of hard kills it.
run();

