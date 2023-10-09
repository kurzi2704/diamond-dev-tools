
import { NodeState } from '../net/nodeManager';
import { doBinaryUpdateFromGit } from './binaryUpdateFromGit';
import { getNodesFromCliArgs } from './remotenetArgs';



async function run() {
  const nodes = await getNodesFromCliArgs();

  for (const n of nodes) {
    await doBinaryUpdateFromGit(n);
  }
}

// todo find better command, this kind of hard kills it.
run();


