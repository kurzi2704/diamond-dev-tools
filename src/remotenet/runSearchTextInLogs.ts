
import { object } from 'underscore';
import { cmdR, cmdRemoteAsync } from '../remoteCommand';
import { getNodesFromCliArgs } from './remotenetArgs';

async function doSearch() {

  const nodes = await getNodesFromCliArgs();

  const results: { [name: number]: string } = {};

  await Promise.all( nodes.map(x=> {
    return new Promise(async () => {

      const filename = '~/dmdv4-testnet/log_backup_2022-03-28_10_34.log'; // parity.log
      const searchterm = '0xd3bf51874ee27c2231de0838e7887705116fd90503ee430d095c9ade56283af4';
      

      const result  = await cmdR(x.sshNodeName(), `grep '${searchterm}' ${filename} | cat`);
      // try {
        
      // }
      // catch (e) {
      //   // grep returns an error i
      // }
      

      console.log(x.sshNodeName());
      console.log("--------------");
      console.log(result);
      console.log("--------------");
      results[x.nodeID] = result;
    })
  }));

   
  for(let nodeName in Object.keys(results)) {


    const result = results[nodeName];
    console.log(nodeName);
    console.log("--------------");
    console.log(result);
    console.log("--------------");
  }
  
  // executeOnRemotesFromCliArgs("grep '0xe9d5ea9355c245af3950c0052b38beeb208ca29507983c1b5c8b3c3ab4435b87' ~/dmdv4-testnet/parity.log");
}


doSearch();



