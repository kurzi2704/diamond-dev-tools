

import yaml from 'js-yaml';



function getTarget(ip: string, port: number, instanceName: string) : any {

    let target : any = {};
    target.targets = [`${ip}:${port}`];

    let labels : any = {};
    labels.location = 'Munich';
    labels.name = "hbbft1";

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

    let target1 : any = {};
    target1.targets = ['localhost:9100'];

    let labels1 : any = {};
    labels1.location = 'Munich';
    labels1.name = "hbbft1";


    target1.labels = labels1;
    //job.targets = targets;

    static_configs.push(target1);
    scrape_configs.push(job);

    job.static_configs = static_configs;
    
    doc.scrape_configs = scrape_configs;

    let result = yaml.dump(doc);

    console.log(result);

}

createPrometheusScrapeConfig();