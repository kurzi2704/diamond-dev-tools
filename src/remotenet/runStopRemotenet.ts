import * as child from 'child_process';
import { executeOnRemotes } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';

async function run() {
  // todo find better command, this kind of hard kills it.
  executeOnRemotes('screen -X -S node_test quit', await getNodesFromCliArgs());
}

run();
