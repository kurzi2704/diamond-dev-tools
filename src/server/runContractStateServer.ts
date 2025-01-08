import express from 'express';
import { ConfigManager } from '../configManager';
import { NodeManager } from '../net/nodeManager';
import { ContractManager } from '../contractManager';
import { Watchdog } from '../watchdog';
import { LogToHtmlAdapter } from './LogToHtmlAdapter';
import { printContractDetails } from '../contracts/printContractDetails';
import { sleep } from '../utils/time';

async function startContractStateServer() {

    console.log( `initializing contract state server`);

    const log = console.log;
    // console.log = (...args: any[]) => {
    //     const message = args.join(' ');
    //     logs.push(message);
    //   };


    const web3 =  ConfigManager.getWeb3();
    const nodeManager = NodeManager.get();
    const contractManager = new ContractManager(web3);
    // const watchdog = new Watchdog(contractManager, nodeManager);
    
    //log("starting watchdog");

    const logAdapter = new LogToHtmlAdapter();
    logAdapter.inject();
    // watchdog.startWatching(true);

    const app = express();

    
    let latestBlock = 0;
    let latestBlockResult = "";
    let isFetching = false;

    app.get('/', async (req, res) => {
        // res.json(logs);
        //res.write(logs.join("\n"));
        //log(logs);

        while (isFetching) {
            await sleep(50);
        }

        isFetching = true;
        let currentBlock = await web3.eth.getBlockNumber();

        if (currentBlock > latestBlock) { 
            logAdapter.clear();
            await printContractDetails(contractManager, nodeManager);
            latestBlockResult = logAdapter.getLogsAsHTMLDocument(undefined);
        }
        res.send(latestBlockResult);
        isFetching = false;

    });
    
    const port = 8080;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`); 
    });

    log("Server started, waiting for requests...");
}



startContractStateServer();

