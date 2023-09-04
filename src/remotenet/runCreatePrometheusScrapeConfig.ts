

import yaml from 'js-yaml';


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

    let targets = [];

    
    let target1 : any = {};


    scrape_configs.push(job);

    job.static_configs = static_configs;
    
    doc.scrape_configs = scrape_configs;

    let result = yaml.dump(doc);

    console.log(result);

}

createPrometheusScrapeConfig();