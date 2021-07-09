import Web3 from "web3";

import { BlockHeader } from "web3-eth";
import {Subscription} from 'web3-core-subscriptions';
import { ContractManager } from "./contractManager";



/**
 * Watches for state changes for the POSDAO Contracts
 * Also has a memory.
 */
export class Watchdog {

  public currentValidators : Array<string> = [];
  public pendingValidators : Array<string> = [];
  public numberOfAcksWritten : number = 0;
  public numberOfPartsWritten : number = 0;

  public latestKnownBlock: number = 0;


  public subscription?: Subscription<BlockHeader>;

  public constructor(public contractManager : ContractManager) {


  }

  public static deepEquals(a: any, b: any) : boolean {
    return JSON.stringify(a) ===  JSON.stringify(b);
  }

  public static createDiffgram<T>(before: Array<T>, after: Array<T>) :
  { added: Array<T>, removed: Array<T> } 
  {

    let removed = before.filter(x => !after.includes(x))
    let added = after.filter(x=> !before.includes(x));

    return {added, removed};

  }


  public startWatching() {

    //this.subscription =
    //this.contractManager.web3.eth.subscribe('newBlockHeaders',

    const functionCall = async () => {

      
      // if (error) {
      //   console.log(`error during newBlockHeaders: `, error);
      // }
      // else { //assume blockHeader always set if there is not error.

        const currentBlock = await this.contractManager.web3.eth.getBlockNumber();

        if (currentBlock == this.latestKnownBlock) {
          //try again in a few ms.
          setTimeout(functionCall, 100);
          return;
        }

        console.log(`processing block:`, this.latestKnownBlock );
        this.latestKnownBlock = currentBlock;

        const pendingValidators = await this.contractManager.getValidatorSetHbbft().methods.getPendingValidators().call();
        if (!Watchdog.deepEquals(pendingValidators, this.pendingValidators)) {
          console.log(`switched pending validators from - to`, this.pendingValidators, pendingValidators );
          console.log(`Difference: `, Watchdog.createDiffgram(this.pendingValidators, pendingValidators));
          this.pendingValidators = pendingValidators;
        }

        const currentValidators = await this.contractManager.getValidatorSetHbbft().methods.getValidators().call();
        if (!Watchdog.deepEquals(currentValidators, this.currentValidators)) {
          console.log(`switched currentValidators  from - to`, this.currentValidators, currentValidators);
          console.log(`Difference: `, Watchdog.createDiffgram(this.currentValidators, currentValidators));
          this.currentValidators = currentValidators;
        }

        const keyGenHistory = await this.contractManager.getKeyGenHistory();
        const numberOfFragmentsWritten = await keyGenHistory.methods.getNumberOfKeyFragmentsWritten().call();
        
        const numberOfPartsWritten = Number.parseInt(numberOfFragmentsWritten[0]);
        const numberOfAcksWritten = Number.parseInt(numberOfFragmentsWritten[1]);

        if (this.numberOfPartsWritten != numberOfPartsWritten) {
          console.log(`Number of Parts written changed from ${this.numberOfPartsWritten} to ${numberOfPartsWritten}`);
          
          this.numberOfPartsWritten =  numberOfPartsWritten;
        }


        if (this.numberOfAcksWritten != numberOfAcksWritten) {
          console.log(`Number of ACKS written changed from ${this.numberOfAcksWritten} to ${numberOfAcksWritten}`);
          this.numberOfAcksWritten =  numberOfAcksWritten;
        }

        // const currentValidators = await this.contractManager.getStakingHbbft() getValidatorSetHbbft().methods.getValidators().call();
        // if (!Watchdog.deepEquals(currentValidators, this.currentValidators)) {
        //   console.log(`switched currentValidators  from - to`, this.currentValidators, currentValidators);
        //   this.currentValidators = currentValidators;
        // }

        setTimeout(functionCall, 100);
      }

      functionCall();
  }



  public async stopWatching() {
    if (this.subscription) {
      await this.subscription.unsubscribe();
    }
  }

}
