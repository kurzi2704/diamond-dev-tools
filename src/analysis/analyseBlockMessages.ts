import Web3 from "web3";
import { ContractManager } from "../contractManager";
import { NodeManager } from "../regression/nodeManager";
import fs from "fs";

import path from "path";

export class AnalyseReport {

  public results = new Map<string, NodeResult>();

  // public reportMessage(proposer: string, ) {

  // }

  public reportDecryptionShare(node: string, decryption_share_proposer: string) {

    let nodeResult = this.results.get(node);

    if (!nodeResult) {
      nodeResult = new NodeResult(node);
      this.results.set(node, nodeResult);
    }

    if (nodeResult) {
      const currentNumber = nodeResult.decryptionShares.get(decryption_share_proposer); 

      if (currentNumber) {
        nodeResult.decryptionShares.set(decryption_share_proposer, currentNumber + 1);
      } else {
        nodeResult.decryptionShares.set(decryption_share_proposer, 1);
      }
    }

  }

  public consoleLogReport(nodeManager: NodeManager) {

    const values = this.results.values();
    const entries = this.results.entries();
    // for (let r = 0; r < this.results.size; r++) {
    //   const result = values.next();
      
    // }

    this.results.forEach((value, key) => {
      console.log(`=== Node: ${value.nodename} ===`);

      let totalShares = 0;
      value.decryptionShares.forEach((gotShares, proposer) => {

        //let hdkey = require("ethereumjs-wallet/hdkey");

        //todo: use ENS like Registry in the future to get all names
        const nodeNames = nodeManager.nodeStates.filter(x=>x.publicKey == proposer);
        let nodeName = '';
        if (nodeNames.length === 1) {
          nodeName = ` => hbbft${nodeNames[0].nodeID}`;
          
        }


        console.log(`${proposer} : ${gotShares} ${nodeName}`);
        totalShares++;


        
      });
      console.log(`${value.nodename} total shares: ${totalShares}`);
    });
  }
  
}

export class NodeResult {

  public decryptionShares : Map<string, number> = new  Map<string, number> ();

  public constructor( public nodename: string) {

  }
}



export async function analyseBlockMessages(blockNumber: number, web3: Web3 ) {

  const contractManager = new ContractManager(web3);

  const validators = await contractManager.getValidators();


  const nodeManager = NodeManager.get();

  const stats = {
    notLocalValidator: new Array<String>() ,
    noMessageFilesFound: new Array<String>(),
    analyzsed: new Array<String>()
  }

  const analyzeReport = new AnalyseReport();

  for(let v = 0; v < validators.length; v++) {

    const validatorMiningKey = validators[v];
    const miners = nodeManager.nodeStates.filter(x=> x.address?.toLowerCase() == validatorMiningKey.toLowerCase());
    
    if (miners.length == 1) {

      const nodeInfo = miners[0];

      const nodeDir = `hbbft${nodeInfo.nodeID}`

      const dir = `testnet/testnet-analysis/messages/${nodeDir}/${blockNumber}`;

      if( fs.existsSync(dir) ) {
        console.log('found message directory. analyzing messages...');

        const files =  fs.readdirSync(dir);

        const messages = new Array<any>();

        for(let f = 0; f < files.length; f++) {
          const filename = files[f];

          if (filename.endsWith('.json')) {
            
            const fileContent = fs.readFileSync(path.join(dir, filename), { encoding: 'utf8'});
            const message = JSON.parse( fileContent );
            messages.push(message);
          }
        }

        console.log(`found ${messages.length} messages to analyze.`);


        stats.analyzsed.push(validatorMiningKey);

        for(let m = 0; m < messages.length; m++) {
          const message = messages[m];
          analyzeSingleMessage(analyzeReport, nodeDir, message);
        }

      } else {
        console.log();
        stats.noMessageFilesFound.push(validatorMiningKey);
      }

    } else {
      console.log(`${validatorMiningKey} is not a local available node. skipping.`);
      stats.notLocalValidator.push(validatorMiningKey);
    }
  }

  console.log('stats:', stats);
  analyzeReport.consoleLogReport(nodeManager);


}

function analyzeSingleMessage(analyzeReport: AnalyseReport, node: string,  message: any) {

  const content = message.content;

  if (content) {
    //console.log('found content!.', content);

    if (content.DecryptionShare) {
      //console.log('got decryption share');

      const proposer = content.DecryptionShare.proposer_id;

      if (proposer) {
        analyzeReport.reportDecryptionShare(node, proposer);
      }
      else {
        console.log('no decryption share found for proposer:', proposer);
      }
    }
    
  } else {
    console.log('no content!.', message);
  }

}
