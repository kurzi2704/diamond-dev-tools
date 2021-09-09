import Web3 from "web3";
import { ContractManager } from "../contractManager";
import { NodeManager } from "../regression/nodeManager";
import fs from "fs";

import path from "path";

export class AnalyseReport {


  public results = new Map<string, NodeResult>();

  public proposalsPerValidator = new Map<string, number>();
  // public reportMessage(proposer: string, ) {

  // }

  private getNodeResult(node: string) : NodeResult {

    let nodeResult = this.results.get(node);

    if (!nodeResult) {
      nodeResult = new NodeResult(node);
      this.results.set(node, nodeResult);
    }

    return nodeResult;

  }

  public reportDecryptionShare(node: string, decryption_share_proposer: string) {

    const nodeResult = this.getNodeResult(node);
    if (nodeResult) {
      const currentNumber = nodeResult.decryptionShares.get(decryption_share_proposer); 

      if (currentNumber) {
        nodeResult.decryptionShares.set(decryption_share_proposer, currentNumber + 1);
      } else {
        nodeResult.decryptionShares.set(decryption_share_proposer, 1);
      }
    }

    const countResult = this.proposalsPerValidator.get(decryption_share_proposer);

    if (!countResult) {
      this.proposalsPerValidator.set(decryption_share_proposer, 1);
    } else {
      this.proposalsPerValidator.set(decryption_share_proposer, countResult + 1);
    }
  }

  reportReady(readyValue: number[], node: string) {

    const nodeResult = this.getNodeResult(node);
    const readyValueString = Web3.utils.bytesToHex(readyValue);
    const currentNumber = nodeResult.readyMessages.get(readyValueString);

    if (currentNumber) {
      nodeResult.readyMessages.set(readyValueString, currentNumber + 1);
    } else {
      nodeResult.readyMessages.set(readyValueString, 1);
    }

  }

  public consoleLogReport(nodeManager: NodeManager, expected_validators_public_key: string[] = []) {

    let totalUnexpectedMessages = 0;

    this.results.forEach((value, key) => {
      console.log(`=======================================`);
      console.log(`======= Node: ${value.nodename} =======`);
      console.log(`=======================================`);
      console.log(`= ${value.nodename} decryption shares received =`);
      let totalShares = 0;
      
      value.decryptionShares.forEach((gotShares, proposer) => {
        
        //let hdkey = require("ethereumjs-wallet/hdkey");

        //todo: use ENS like Registry in the future to get all names
        let nodeName = '';

        const node = nodeManager.getNodeByPublicKey(proposer);
        if (node) {
          nodeName = ` => hbbft${node.nodeID}`;
          
        }

        console.log(`${proposer} : ${gotShares} ${nodeName}`);
        totalShares++;


        
      });

      console.log(`${value.nodename} total shares: ${totalShares}`);

      console.log(`=== ${value.nodename}  ready messages ===`);
      value.readyMessages.forEach((numberOfReadyMessages, readyBinaries) => {
        console.log(`${readyBinaries} : ${numberOfReadyMessages}`);
      })

      
    });

    

    // if we know expected validators, 
    // we should also 
    if (expected_validators_public_key.length > 0) {

      console.log('=== Total Number of proposals received from each expected Validator ===');
      console.log('0  means that the validator did not send a single signature share.');

      for (let v = 0; v < expected_validators_public_key.length; v++) {
        
        const key = expected_validators_public_key[v];

        let nodeName = '';

        const node = nodeManager.getNodeByPublicKey(key);
        if (node) {
          nodeName = ` => hbbft${node.nodeID}`;
        }
        console.log(`${key} : ${this.proposalsPerValidator.get(key)??0}${nodeName}`);

      }

      //also show the unexpected messages:

      // console.log('=== Checking proposal number for each expected Validators ===');

      let unexpectedHintShown = false;

      this.proposalsPerValidator.forEach((value: number, key: string) => { 
        const countPerValidator = this.proposalsPerValidator.get(key)

        if (!countPerValidator) {
          if (!unexpectedHintShown) {
            console.log('==== Unexpected Messages: At least one Validator send decryption share even he is not part of the set. ====');
          }
          console.log(`${key}: ${value}`);
          totalUnexpectedMessages++;
        }
      });

      console.log('========');
      console.log(`Total count of unexpected messages: ${totalUnexpectedMessages}`);
    }
  }
}


// export class ProposerConfirmation {

  
//   public constructor (public confirmedOnNode: string, public confirmedBy : string) {
    
//   }
// }

// export class ProposerResult {

//   public decryptionShares : Map<string, number> = new  Map<string, number> ();

//   //public confirmations: Array<ProposerConfirmation> = [];

//   public proposerConfirmations : Map<string, ProposerConfirmation> = new  Map<string, ProposerConfirmation>();
  
//   public constructor( public proposer: string) {
    
//   }
// }


export class NodeResult {

  public decryptionShares : Map<string, number> = new  Map<string, number> ();

  public readyMessages : Map<string, number> = new Map<string, number>();

  public constructor( public nodename: string) {

  }
}



export async function analyseBlockMessages(blockNumber: number, web3: Web3 ) {

  console.log(`analysing block messages for block ${blockNumber}`);

  const contractManager = new ContractManager(web3);
  const validators = await contractManager.getValidators('latest');

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


  //gathering public keys from validators.

  let publicKeys = [];

  const stakingContract = await contractManager.getStakingHbbft();
  const vs = contractManager.getValidatorSetHbbft();

  for(let n = 0; n < validators.length; n++) {

    const miningAddress = validators[n];
    const stakingAddress = await vs.methods.stakingByMiningAddress(miningAddress).call();

    const publicKey = await stakingContract.methods.getPoolPublicKey(stakingAddress).call();
    publicKeys.push(publicKey);

    //stakingContract.methods.
  }

  analyzeReport.consoleLogReport(nodeManager, publicKeys);


}

function analyzeSingleMessage(analyzeReport: AnalyseReport, node: string,  message: any) {

  const content = message.content;

// Broadcast - Echo
// Broadcast - Value
// Agreement
// Decryption Share
// Broadcast - CanDecode
// Subset - Message (proposer)
// Broadcast - Ready
// SignatureShare
//


  //content":{"Broadcast":{"Ready":

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
    } else if (content.Subset) {

      if (content.Subset.content) {
        const broadcast = content.Subset.content.Broadcast; 
        if (broadcast) {
          if (broadcast.Ready) {
            const readyValue : number[] = broadcast.Ready;
            analyzeReport.reportReady(readyValue, node);
          }
        } else {
          // console.log('unknown message subset:', message);
        }
      } else {
        console.log('message with  subset but no content:', message);
      }

    } else {
      console.log('unknown message:', message);
    }
    
  } else {
    console.log('no content!.', message);
  }

}
