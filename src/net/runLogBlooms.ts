import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { cmd, cmdR } from "../remoteCommand";

async function logBlooms() {

    const web3 = ConfigManager.getWeb3();
    


    // const contracts = ContractManager.get();

    // let bonusScoreSystem = contracts.getBonusScoreSystem();

    // //let topic = web3.utils.keccak256("ReportMissingConnectivity(address,address,uint256)")

    let topic = web3.utils.keccak256("ValidatorScoreChanged(address,uint8,uint256)");
    console.log(topic);
    
    // const topics = [
    //      topic
    // ];
    // const events = await web3.eth.getPastLogs({ fromBlock: 1, toBlock: "latest", address: bonusScoreSystem.options.address, topics});
    // // let events = await connectivityTracker.getPastEvents("ReportMissingConnectivity(address,address,indexed)");
    // console.log(events);

    // events.forEach((event) => { console.log(event.topics[2]); });
    // console.log("topic: ", topic);
    // console.log("count:", events.length);

    //const logs = await web3.eth.getPastLogs({ fromBlock: 0, address: connectivityTracker });
    // connectivityTracker.events.ReportMissingConnectivity({ fromBlock: 0 }); 
    //     console.log("ReportMissingConnectivity:");
    //     console.log(event);
    // }).on("data", (event) => {
    //     console.log("On ReportMissingConnectivity:");
    //     console.log(event);
    // });
   
    //console.log("latest block", latestBlock);


    // console.log(await web3.eth.getBlock(latestBlock));

    // // console.log(await web3.eth.getPastLogs({ fromBlock:}));
    // for (let i = latestBlock; latestBlock >= latestBlock - 100; i--) {
    //     const block = await web3.eth.getBlock(i);
    //     console.log(block.logsBloom);
        
    // }

    // let cmdBase = "curl -s --header 'Content-Type: application/json' http://185.205.246.232:54100 -X POST ";
    // let overallResult : any[] = [];

    const countToLog = 1000;

    const latestBlock = await web3.eth.getBlockNumber();
    let startBlock = latestBlock - countToLog > 0 ? latestBlock - countToLog : 0;
    console.log(latestBlock);
    
    for (let i = startBlock; i < latestBlock; i++) {

        const block = await web3.eth.getBlock(i);
        console.log("Block: ", i, "blooms: ", block.logsBloom);
        

        // let data = ` --data '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"topics":[]}],"id":${i}}'`;  
        // let result = cmd(cmdBase + data);
        // if (result.success) {
        //     let obj = JSON.parse(result.output);
                
        //     obj.result.forEach((log: any) => {
        //         //if (!log.transactionHash) {
        //             overallResult.push(log);
        //         //} 
        //     });
        // }    
    }
    

    // console.log("finished, found logs: ", overallResult.length);
    // overallResult.forEach((log: any) => { console.log(log) });

    // curl --header 'Content-Type: application/json' http://185.205.246.232:54100 -X POST --data '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"topics":[]}],"id":70912}'"
    // curl --header 'Content-Type: application/json' http://185.205.246.232:54100 -X POST --data '{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"topics":[]}],"id":70912}'"

}

logBlooms();