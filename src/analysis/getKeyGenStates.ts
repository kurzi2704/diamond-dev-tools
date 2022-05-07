import deepEqual from "deep-equal";
import { ContractManager, KeyGenMode } from "../contractManager";
import { Transaction } from 'web3-core';
import { blockTimeAsUTC } from "../utils/dateUtils";
import { BlockType } from "../abi/contracts/types";


function prettyPrint(roundResult: KeyGenRoundResult) {
  return `epoch: ${roundResult.Epoch}(Block:${roundResult.RoundStartBlock} - ${roundResult.RoundEndBlock}) Success: ${roundResult.Success}  key gen round:  ${roundResult.KeyGenRound} missed Parts: ${roundResult.PartsMissedOut.length} missed Acks ${roundResult.AcksMissedOut.length}`;
}

export class KeyGenRoundResult {

  public Epoch: number = 0;
  public KeyGenRound: number = 0;


  public EpochStartBlock: number = 0;
  public EpochEndBlock: number = 0;

  public RoundStartBlock: number = 0;
  public RoundEndBlock: number = 0;

  public RoundStartTime: Date = new Date(0);
  public RoundEndTime: Date = new Date(0);

  public AcksWritten: Array<String> = [];
  public AcksMissedOut: Array<String> = [];

  public PartsWritten: Array<String> = [];
  public PartsMissedOut: Array<String> = [];

  public FoundACKTXInFinalBlock: Transaction[] = [];
  public FoundACKTXInFinalBlockValidators: string[] = [];

  public get Success(): boolean {

    return this.AcksMissedOut.length === 0 && this.PartsMissedOut.length === 0
  };

  public prettyPrint() {

    return prettyPrint(this);
  }

  public printCSV() {
    return `${this.Epoch};${this.KeyGenRound};${this.Success};${this.RoundStartBlock};${this.RoundStartTime.toISOString()};${this.RoundEndBlock};${this.RoundEndTime.toISOString()};${this.AcksWritten.length};${this.AcksMissedOut.length};${this.PartsWritten.length};${this.PartsMissedOut.length};${this.RoundEndBlock - this.RoundStartBlock}`;
  }

  public static printCSVHeader() {
    return `"Epoch";"KeyGenRound";"Success";"RoundStartBlock";"RoundStartTime";"RoundEndBlock";"AcksWritten";"AcksMissedOut";"PartsWritten";"PartsMissedOut";"BlockLengthOfRound"`;
  }

}

export class KeyGenEpochResult {

  public Epoch: number = 0;
  public EpochStartBlock: number = 0;
  public EpochEndBlock: number = 0;
  public KeyGenStart: number = 0;
  public KeyGenRounds: KeyGenRoundResult[] = [];
  public NumValidatorsAtFirstTry: number = 0;
  public NumValidatorsAtSuccess: number = 0;


  // list of validators that got removed.
  public ValidatorDropOuts: string[] = [];

}


  // only finished epochs can be analysed with this function, since we need a EpochEndBlock.
  // we process the epochs backwards, starting from the epoch end, towards the start of 
  // phase 2: Key Generation Phase.
  // Phase 1 can be completly skipped, since nothing interesting for the 
  // key generation happens here.
  async function processEpoch(contractManager: ContractManager,  epochNumber: number, epochEndBlock: number):  Promise<KeyGenEpochResult> {

    const { web3 } = contractManager;

    // only full processed epochs can be analysed.
    let result = new KeyGenEpochResult();

    //result.Epoch;
    result.EpochEndBlock = epochEndBlock;
    console.log(`processing end of epoch ${epochNumber}, starting with block ${epochEndBlock} iterating backward.`);
    result.EpochStartBlock = await contractManager.getEpochStartBlock(epochEndBlock);

    let blockToProcess = epochEndBlock;

    let roundResult = new KeyGenRoundResult();

    // we know that the last round is the successful one.
    roundResult.Epoch = epochNumber
    roundResult.KeyGenRound = Number.MAX_SAFE_INTEGER;
    roundResult.RoundEndBlock = blockToProcess;
    //result.KeyGenRounds.push(roundResult);

    let pendingValidators = await contractManager.getPendingValidators(blockToProcess);

    do {

      let keyGenRound = await contractManager.getKeyGenRound(blockToProcess);

      const newPendingValidators = await contractManager.getPendingValidators(blockToProcess);
      const isSwitchInValidatorSet = !deepEqual(pendingValidators, newPendingValidators);


      if (isSwitchInValidatorSet) {
        console.log(`detected validator set switch in block: ${blockToProcess}`);
      }

      pendingValidators = newPendingValidators;

      // have we already iterated backward to the next key gen round ?
      if (keyGenRound < roundResult.KeyGenRound) {

        if (roundResult.KeyGenRound == Number.MAX_SAFE_INTEGER) {
          roundResult.KeyGenRound = keyGenRound;
        }

        roundResult.RoundStartBlock = blockToProcess;
        const roundStartBlockInfo = await web3.eth.getBlock(blockToProcess);
        roundResult.RoundStartTime = blockTimeAsUTC(roundStartBlockInfo.timestamp);
        console.log(`processing block:  ${blockToProcess}`);

        pendingValidators = await contractManager.getPendingValidators(blockToProcess);



        roundResult = new KeyGenRoundResult();
        roundResult.KeyGenRound = keyGenRound;
        roundResult.RoundEndBlock = blockToProcess;
        roundResult.RoundEndTime = blockTimeAsUTC(await (await web3.eth.getBlock(blockToProcess)).timestamp);
        roundResult.Epoch = epochNumber;

        result.KeyGenRounds.push(roundResult);
        //console.log('');
        console.log('Fetching additional write ACK transaction that did not get processed in this block.');

        const block = await web3.eth.getBlock(blockToProcess);

        const txs: Transaction[] = [];

        for (const txHash of block.transactions) {
          const tx = await web3.eth.getTransaction(txHash)
          // console.log(`found Transaction from ${tx.from} in block ${blockToProcess}: ${txHash} | ${tx.input}}`);
          txs.push(tx);
        }

        for (const validator of pendingValidators) {

          const state = await contractManager.getPendingValidatorState(validator, blockToProcess);

          switch (state) {
            case KeyGenMode.NotAPendingValidator:
              console.log('ERROR: unexpected state: should be a pending Validator.');
              break;
            case KeyGenMode.AllKeysDone:
            case KeyGenMode.WaitForOtherAcks:
              roundResult.PartsWritten.push(validator);
              roundResult.AcksWritten.push(validator);
              break;
            case KeyGenMode.WaitForOtherParts:
            case KeyGenMode.WaitForOtherAcks:
              roundResult.PartsWritten.push(validator);
              break;
            case KeyGenMode.WritePart:
              roundResult.PartsMissedOut.push(validator);
              roundResult.AcksMissedOut.push(validator);
              break;
            case KeyGenMode.WriteAck:
              roundResult.PartsWritten.push(validator);

              let foundInTransactions: Transaction | undefined = undefined;;
              // we try to detect nodes that did write their acks,
              // but those acks have not been included.
              for (const tx of txs) {
                if (tx.from === validator) {
                  let additionalData = '';
                  if (tx.input.startsWith('0x5623208e')) {
                    additionalData = 'THIS IS A WRITE ACKS TRANSACTION!! '
                    console.log(`transaction found for validator ${validator} ${additionalData} ${tx.input}`);
                    roundResult.AcksWritten.push(validator);
                    foundInTransactions = tx;
                    break;
                  }
                }
              }
              if (foundInTransactions) {
                console.log('Transaction Found but not included:', validator);
                roundResult.FoundACKTXInFinalBlockValidators.push(validator);
                roundResult.FoundACKTXInFinalBlock.push(foundInTransactions);
              }
              else {
                console.log('acks missed out: ', validator);
                roundResult.AcksMissedOut.push(validator);
              }
              break;
            default:
              throw Error(`unexpected ${state}`);
          }
        }

        console.log(blockToProcess, roundResult.prettyPrint());
      } else if (pendingValidators.length === 0) {
        //result.EpochStartBlock =  ;
        roundResult.RoundStartBlock = blockToProcess + 1;
        const roundStartBlockInfo = await web3.eth.getBlock(blockToProcess);
        roundResult.RoundStartTime = blockTimeAsUTC(roundStartBlockInfo.timestamp);
        // console.log(`${blockToProcess} no pending validators anymore`);
      } else {
        // console.log(`${blockToProcess}.`);
      }

      blockToProcess--;

      // we iterate forward until we reach phase 1.
    } while (pendingValidators.length > 0)

    //contractManager.getKeyGenState();
    // ... scanning until keygeneration phase found ....

    // console.log(`key generation phase found with block start at`);


    //console.log(result);
    //console.log(``);

    return result;
  }


  export async function getKeyGenStates(contractManager: ContractManager, countOfEpochsToAnalyze: number = 100, blockToAnalyze: BlockType = 'latest') {



  
  console.log('current block: ', blockToAnalyze);
  let epochNumber = await contractManager.getEpoch(blockToAnalyze);

  console.log('current epoch: ', epochNumber);

  let thisEpochStart = await contractManager.getEpochStartBlock(blockToAnalyze);
  console.log('this epoch started with block ', thisEpochStart);

  let epochToAnalyze = epochNumber - 1;
  blockToAnalyze = thisEpochStart - 1;

  console.log(`The analysis starts one epoch earlier ${epochToAnalyze} with block ${blockToAnalyze}`, thisEpochStart);

  const epochResults = [];
  const roundResults = [];

  const stopAtEpoch = epochToAnalyze - countOfEpochsToAnalyze;
  do {
    const epochResult : KeyGenEpochResult = await processEpoch(contractManager, epochToAnalyze, blockToAnalyze);
    epochResults.push(epochResult);
    roundResults.push(...epochResult.KeyGenRounds);

    epochToAnalyze = epochToAnalyze - 1;
    blockToAnalyze = epochResult.EpochStartBlock - 1;
  } while (epochToAnalyze > stopAtEpoch)

  return {epochResults, roundResults};

}