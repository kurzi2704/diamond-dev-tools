import { ConfigManager } from '../configManager';
import { cmdR, cmdRemoteAsync } from '../remoteCommand';
import { getBuildFromSourceCmd } from './buildFromSource';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
  const nodes = await getNodesFromCliArgs();

  const config = ConfigManager.getConfig();
  const buildCmd = getBuildFromSourceCmd();
  // nohup sh -c 'wget "$0" && wget "$1"' "$url1" "$url2" > /dev/null &

  const promises = nodes.map((n) => cmdRemoteAsync(n.sshNodeName(), `cd ~/${config.installDir} && git pull && nohup sh -c '${buildCmd}'`));

  console.log('awaiting promises.');
  for (const p in promises) {
    await p;
    console.log('ok');
  }

  console.log('all work done - build might take 1 hour');
}

// todo find better command, this kind of hard kills it.
run();
