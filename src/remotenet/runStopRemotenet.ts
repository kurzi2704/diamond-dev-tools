import * as child from 'child_process';
import { executeOnRemotes } from './executeOnRemotes';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';
import { ConfigManager } from '../configManager';

async function run() {
  // todo find better command, this kind of hard kills it.
  executeOnRemotes(`screen -X -S ${ConfigManager.getRemoteScreenName()} quit`, await getNodesFromCliArgs());
}

run();
