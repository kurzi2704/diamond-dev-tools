import { doBinaryUpdateFromGit } from './binaryUpdateFromGit';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const nodes = await getNodesFromCliArgs();

  for (const n of nodes) {
    await doBinaryUpdateFromGit(n);
  }
}

run();


