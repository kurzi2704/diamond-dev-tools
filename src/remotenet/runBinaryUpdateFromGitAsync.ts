import { ConfigManager } from '../configManager';
import { cmdR, cmdRemoteAsync } from '../remoteCommand';
import { getBuildFromSourceCmd } from './buildFromSource';
import { getNodesFromCliArgs } from './remotenetArgs';


async function build(nodeName: string) : Promise<string> {
  
    let result = await cmdRemoteAsync(nodeName, getBuildFromSourceCmd());
    console.log(result);
    return result;
}


async function run() {

  const nodes = await getNodesFromCliArgs();

  const gitClonePromises : Promise<string>[] = [];

  for (const n of nodes) {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    console.log(`stopping node ${nodeName}`);
    try {
      cmdR(nodeName, `screen -X -S ${ConfigManager.getRemoteScreenName()} quit`);
    } catch (e) {
      console.log('ignored error.');
    }

    const config = ConfigManager.getNetworkConfig();

    console.log(`pulling repo ${nodeName}`);
    gitClonePromises.push(cmdRemoteAsync(nodeName, `cd ~/${config.installDir} && git checkout start.sh && git pull`));

  }

  console.log('All repositories are being pulled. This may take a while.');
  await Promise.all(gitClonePromises);
  console.log('All repositories have been pulled.');

  const buildPromises : Promise<string>[] = [];

  for (const n of nodes) {
    //const buildCmd = 
    // cmdR(nodeName, buildCmd);
    let buildPromise : Promise<string> = build(n.sshNodeName());

    buildPromises.push(buildPromise);
  }


  console.log('waiting for build');


  let buildsComplete = 0;
  
  buildPromises.forEach(async (p, i) => { 
    p.then((result) => {

      buildsComplete++;
      console.log(`=== ${nodes[i].sshNodeName()} ===`);

      console.log(`END ${nodes[i].sshNodeName()} ===`);
      console.log(`Builds Complete ${buildsComplete}/${buildPromises.length} ${100 * buildsComplete/buildPromises.length}% }`);
      
    });
  });
  for (let i of buildPromises.keys()) { 
    
    const promise = buildPromises[i];
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
