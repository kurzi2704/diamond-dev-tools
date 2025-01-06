import { ConfigManager } from "./configManager";
import { ContractManager } from "./contractManager";
import { NodeManager } from "./net/nodeManager";
import { Watchdog } from "./watchdog";
import express from 'express';
import util from 'util';
import AnsiToHtml from 'ansi-to-html';

const log = console.log;

let logs: string[] = [];



function format(input: string) {

    log(input);
    let result = trim(input);
    
    while (result.modded) {
        result = trim(result.result);
    };
    
    return result.result;
    
}

/// removes unwanted characters at the beginning.
/// returns a boolean indicating if the string was modified
function trim(input: string) : {modded: boolean, result: string} {


    input = input.replace("'", "");
    input = input.replace("+\n", "<br>");


    return {modded: false, result: input};
    // if (input.startsWith(`'`)) {
    //     log("trimming start");
    //     return {modded: true, result: input.substring(1)};
        
    // }


    // if (input.endsWith(`'`)) {
    //     log("trimming end");
    //     return {modded: true, result: input.substring(0, input.length - 1)};
    // }

    return {modded: false, result: input};
}

/// removes unwanted characters ?
function formatArg(input: any) {

    if (typeof input === 'string') {

        let result = trim(input);

        while (result.modded) {
            result = trim(result.result);
        };
        
        return result.result;
    }

    // if (Array.isArray(input)) {
    //     return input.map(formatArg);
    // }

    // if (typeof input === 'object') {
    //     const result: any = {};
    //     for (const key in input) {
    //         result[key] = formatArg(input[key]);
    //     }
    //     return result;
    // }

    return input;
    
}


async function startWatchdogServer() {



    console.log( `inistializing watchdog server`);

    // console.log = (...args: any[]) => {
    //     const message = args.join(' ');
    //     logs.push(message);
    //   };

    const convert = new AnsiToHtml();

    
    console.log = (...args: any[]) => {
        let message = args.map(arg => format(formatArg(util.inspect(arg, { depth: null, colors: true })))).join(' ');
        message = format(message);
        logs.push(convert.toHtml(message));
    };


    const web3 = ConfigManager.getWeb3();
    const nodeManager = NodeManager.get();
    const contractManager = new ContractManager(web3);
    //const watchdog = new Watchdog(contractManager, nodeManager);
    
    log("starting watchdog");
    //watchdog.startWatching(true);

    console.log("starting server");
    console.log("hello world");
    console.warn("warning");
    console.error("Error");
    console.table([{a: 1, b: 2}, {a: 3, b: 4}]);

    const app = express();
    
    

    app.get('/', (req, res) => {
        // res.json(logs);
        //res.write(logs.join("\n"));
        log(logs);    
        res.send(`<pre>${logs.join('<br>')}</pre>`);
      });
    
    const port = 8080;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
        
    });

}



startWatchdogServer();

