import { NodeState } from '../net/nodeManager';
import { doBinaryUpdateFromGit } from './binaryUpdateFromGit';
import { getNodesFromCliArgs } from './remotenetArgs';

async function doBinaryUpdateAsync(n: NodeState): Promise<string> {
  let result: Promise<string> = new Promise((resolve, reject) => {
    doBinaryUpdateFromGit(n).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });

  return result;
}

async function run() {

  const nodes = await getNodesFromCliArgs();
  const promises: Promise<string>[] = [];

  let finished = 0;
  let all = nodes.length;

  for (const n of nodes) {
    console.log("Started Update of node " + n.sshNodeName());
    let promise = doBinaryUpdateAsync(n);
    promise.then((result) => {
      console.log(`finished ${n.sshNodeName()}. ${finished}/${all} ${100 * finished / all}%`);
    });
    promises.push(promise);
  }

  for (let i of promises.keys()) {

    const promise = promises[i];
    const node = nodes[i];

    console.log(`=== awaitung ${node.nodeID} ===`);
    
    let result = await promise;

    console.log(`=== ${node.sshNodeName()} ===`);
    console.log(result);
    console.log(`= END = ${node.sshNodeName()} = END =`);
  }

  console.log('All nodes have been build and updated.');
}

run();

