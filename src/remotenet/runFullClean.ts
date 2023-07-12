


// var exec = require('child_process').exec, child;
import { ConfigManager } from '../configManager';
import { cmdR } from '../remoteCommand';
import { getNodesFromCliArgs } from './remotenetArgs';

async function run() {
    
    const config = ConfigManager.getConfig();
    const { openEthereumBranch, networkGitRepo, installDir } = config;

    console.log("Executes full clean of remote machine. (All Data: all logs, all databases, all keys, all configs, all github repos.)");
    const nodes = await getNodesFromCliArgs();


    for (const n of nodes) {
        console.log('Executing on Node: ', n.sshNodeName());

        const rmResult = cmdR(n.sshNodeName(), `rm ${installDir} -rf`);

        console.log(rmResult);
        
    }

  
}

run();