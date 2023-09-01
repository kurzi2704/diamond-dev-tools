

import yaml from 'js-yaml';


async function createPrometheusScrapeConfig() {


    
    let job : any = {};

    job.job_name = 'remote-net';

    let doc : any = {};
    let scrape_configs : any[] = [];


    scrape_configs.push(job);


    doc.scrape_configs = scrape_configs;

}