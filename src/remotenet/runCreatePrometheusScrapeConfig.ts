

import yaml from 'js-yaml';
import { getNodesFromCliArgs, parseRemotenetArgs } from './remotenetArgs';
import { loadNodeInfosFromTestnetDirectory } from '../net/nodeInfo';
import { getIP } from './remotenetUtils';



function getTarget(ip: string, port: number, instanceName: string) : any {

    let target : any = {};
    target.targets = [`${ip}:${port}`];

    let labels : any = {};
    // labels.location = 'Munich';
    labels.name = instanceName;

    target.labels = labels;
    return target
}

async function createPrometheusScrapeConfig() {


//     - targets:
//     - localhost:9100
//     labels:
//       instance: 'node1'
//   - targets:
//     - localhost:9100
//   - labels:
//       instance: 'node1'

    let job : any = {};
    job.job_name = 'remote-net';
    let doc : any = {};
    let scrape_configs : any[] = [];

    let static_configs : any[] = [];

    let targets : any[] = [];

    const nodeInfos = loadNodeInfosFromTestnetDirectory();

    // function getIP(nodeID: number) : string | undefined {

    //     if (nodeInfos) {
    //         return nodeInfos.ip_addresses[nodeID -1];
    //     }

    //     return undefined;
    // }
    
    for (const node of await getNodesFromCliArgs()) {

        let ip = getIP(node.nodeID);
        
        let target1 = getTarget(ip, 48700 + node.nodeID, `node${node.nodeID}`);
        static_configs.push(target1);
    
    }

    // let target1 : any = {};
    // target1.targets = ['localhost:9100'];

    // let labels1 : any = {};
    // labels1.location = 'Munich';
    // labels1.name = "hbbft1";


    // target1.labels = labels1;
    // //job.targets = targets;

    
    scrape_configs.push(job);

    job.static_configs = static_configs;
    
    doc.scrape_configs = scrape_configs;

    let result = yaml.dump(doc);

    console.log(result);

}

createPrometheusScrapeConfig();

