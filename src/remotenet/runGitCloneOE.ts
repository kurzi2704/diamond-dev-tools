
import { ConfigManager } from '../configManager';
import { cmd, cmdR } from '../remoteCommand';

//var exec = require('child_process').exec, child;
import { getNodesFromCliArgs } from './remotenetArgs';


async function run() {

  const config = ConfigManager.getConfig();
  const { networkGitRepo, networkGitBranch, installDir} =  config;

  const nodes = await getNodesFromCliArgs();

  const dir = `~/${installDir}`;

  for(let n of nodes) {
    
    console.log('Executing on Node: ', n.sshNodeName());

    let alreadyExists = false;

    
    let lsResult = cmdR(n.sshNodeName(), `ls`);
    
    

    if (lsResult.includes(installDir)) {
      console.log('Directory already exists! no further actions on node', n.sshNodeName());
      continue;
    }

    console.log('Cloning git repo');

    const cloneResult = cmdR(n.sshNodeName(), `git clone ${networkGitRepo} ${installDir} --branch ${networkGitBranch}`);

    console.log(cloneResult);

    cmdR(n.sshNodeName(), `cd ${installDir} && ./setup-build-from-source.sh`);
  }
}

run();