import { ConfigManager } from "./configManager";
import { ContractManager } from "./contractManager";
import { NodeManager } from "./net/nodeManager";
import { Watchdog } from "./watchdog";
import express from 'express';
import util from 'util';
import AnsiToHtml from 'ansi-to-html';
import { nowFormatted } from "./utils/dateUtils";

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

        // console.log(input);
        log(input);
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


function formatTable(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]));

    let tableHtml = '<table border="0" style="color:#ffffff"><thead><tr>';
    headers.forEach(header => {
        tableHtml += `<th>${header}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    rows.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
            tableHtml += `<td>${cell}</td>`;
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    return tableHtml;
}



async function startWatchdogServer() {



    console.log( `inistializing watchdog server`);

    // console.log = (...args: any[]) => {
    //     const message = args.join(' ');
    //     logs.push(message);
    //   };

    const convert = new AnsiToHtml();

    const argsToLog = (...args: any[]) => { 
        return args.map(arg => format(formatArg(util.inspect(arg, { depth: null, colors: true })))).join(' ');
    }

    const nowPrefix = () =>  {
        const now = new Date(Date.now());
        return now.toISOString().split('T')[0] + " "  + now.toTimeString().split(" ")[0] +  ": ";
    }
    
    const logReplacement = (...args: any[]) => {

        const message = format(nowPrefix() + argsToLog(...args));
        logs.push(convert.toHtml(message));
    };


    console.log = (...args: any[]) => {

        //const moment = moment();
        const now = new Date(Date.now());
        let message = now.toISOString().split('T')[0] + " "  + now.toTimeString().split(" ")[0] +  ": " + args.map(arg => format(formatArg(util.inspect(arg, { depth: null, colors: true })))).join(' ');
        message = format(message);
        logs.push(convert.toHtml(message));
    };

    //console.log = logReplacement;

    console.warn = (...args: any[]) =>  {

        let warn = "\u001b[1;33mWARN\u001b[0m'";
        // let warn = "WARN:";
        //let message = now.toISOString().split('T')[0] + " "  + now.toTimeString().split(" ")[0] +  ": " + warn + argsToLog(args);
        let message = format(nowPrefix() + warn + argsToLog(...args));
        logs.push(convert.toHtml(message));

    };

    console.error = (...args: any[]) =>  {

        let error = "\u001b[1;31mERROR\u001b[0m'";
        //let error = "ERROR:";
        let message = format(nowPrefix() + error + argsToLog(...args));
        logs.push(convert.toHtml(message));
    
    };

    console.table = (data: any[]) => {
    
        const tableHtml = formatTable(data);
        logs.push(tableHtml);
        // originalTable.apply(console, [data]);
    };

    const web3 = ConfigManager.getWeb3();
    const nodeManager = NodeManager.get();
    const contractManager = new ContractManager(web3);
    const watchdog = new Watchdog(contractManager, nodeManager);
    
    log("starting watchdog");
    watchdog.startWatching(true);

    const app = express();
    
    const htmlHeader = 
`<!DOCTYPE html>
<html>
<head>
  <title>bit.diamond Network Status</title>
  <style type="text/css">
  body {
    color: #FFFFFF;
    background-color: #000000 }
  table, th, td {
        border: 1px solid white;
        border-collapse: collapse;
      }  
  </style>  
</head>
<body>`;


    const htmlFooter = `</body></html>`;

    app.get('/', (req, res) => {
        // res.json(logs);
        //res.write(logs.join("\n"));
        //log(logs);
        let logsToPrint = logs.length < 1000 ? logs : logs.slice(logs.length - 1000);   
        res.send(htmlHeader +  `<pre>${logsToPrint.join('<br>')}</pre>` + htmlFooter);
      });



    app.get('/full', (req, res) => {
        // res.json(logs);
        //res.write(logs.join("\n"));
        log(logs);    
        res.send(htmlHeader +  `<pre>${logs.join('<br>')}</pre>` + htmlFooter);
      });
    
    const port = 8080;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`); 
    });
}



startWatchdogServer();

