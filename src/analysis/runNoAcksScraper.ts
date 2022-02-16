import { BigNumber } from "bignumber.js";
import { ContractManager, KeyGenMode } from "../contractManager";


class KeyGenRoundResult {

  public KeyGenRound: number = 0;
  public Success: boolean = false;

  public StartBlock: number = 0;
  public EndBlock: number = 0;

  public AcksWritten: Array<String> = [];
  public AcksMissedOut: Array<String> = [];

  public PartsWritten: Array<String> = [];
  public PartsMissedOut: Array<String> = [];

  
}


class KeyGenEpochResult {

  public Epoch: number = 0;
  public EpochStartBlock: number = 0;
  public EpochEndBlock: number = 0;
  public KeyGenStart: number = 0;
  public KeyGenRounds: KeyGenRoundResult[] = [];
}



async function run() {


  console.log('scans the network and looks watches out for nodes');
  console.log('that got included, without having their ACK transaction mined.');

  const contractManager = ContractManager.get();
  const { web3 } = contractManager;

  // key gen history:
  // 
  const keyGenHistory = await contractManager.getKeyGenHistory();

  // only finished epochs can be analysed with this function, since we need a EpochEndBlock.
  // we process the epochs backwards, starting from the epoch end, towards the start of 
  // phase 2: Key Generation Phase.
  // Phase 1 can be completly skipped, since nothing interesting for the 
  // key generation happens here.
  async function processEpoch(epochNumber:number, epochEndBlock: number) : Promise<KeyGenEpochResult> {
    
    // only full processed epochs can be analysed.
    
    const result = new KeyGenEpochResult();
    result.EpochEndBlock = epochEndBlock;

    console.log(`processing epoch ${epochNumber}`);

    //const epochStartBlock = 1;
    //console.log(`epoch ${epochNumber} starts at ${epochStartBlock}`);

    
    const keyGenRoundCounter = 0;

    console.log(`epoch ${epochNumber} switch found at block %{} starts at ${1}`);

    // the last key gen round is the successfull one.
    let thisKeyGenRoundIsASuccess = true;

    let blockToProcess = epochEndBlock;

    // the last block is always the last Block in the key gen round.
    let isLastBlockInKeyGenRound = true;


    let keyGenRound = new KeyGenRoundResult();
    keyGenRound.Success = true;
    keyGenRound.EndBlock = epochEndBlock;

    let validators = await contractManager.getPendingValidators(blockToProcess);
    
    // contractManager.getKeyGenRound(blockToProcess);


    for (let validator of validators) {
      const parts = await contractManager.getKeyPARTBytesLength(validator, blockToProcess);
      const acks = await contractManager.getKeyACKSNumber(validator, blockToProcess);

      console.log(`got part for ${validator}`, parts);
      console.log(`got acks for ${validator}`, acks);

      // switch(state) {
      //   case KeyGenMode.NotAPendingValidator: 
      //     console.log('ERROR: unexpected state: should be a pending Validator.');
      //     break;
      //   case KeyGenMode.AllKeysDone: 
      //   case KeyGenMode.WaitForOtherAcks:
      //     keyGenRound.PartsWritten.push(validator);
      //     keyGenRound.AcksWritten.push(validator);
      //     break;
      //   case KeyGenMode.WaitForOtherParts: 
      //   case KeyGenMode.WaitForOtherAcks:
      //     keyGenRound.PartsWritten.push(validator);
      //     keyGenRound.AcksWritten.push(validator);
      //     break;
      //   case KeyGenMode.WritePart:
      //     keyGenRound.PartsMissedOut.push(validator);          
      //     keyGenRound.AcksMissedOut.push(validator);
      //     break;
      //   case 
    }
    //contractManager.getKeyGenState();



    
    // ... scanning until keygeneration phase found ....

    console.log(`key generation phase found with block start at`);
    
    return result;
  }


  let blockToAnalyze = await web3.eth.getBlockNumber();
  console.log('current block: ', blockToAnalyze);
  let epochNumber = await contractManager.getEpoch(blockToAnalyze);

  console.log('current epoch: ', epochNumber);

  let thisEpochStart = await contractManager.getEpochStartBlock();
  console.log('this epoch started with block ', thisEpochStart);

  const epochToAnalyze = epochNumber - 1;
  blockToAnalyze = blockToAnalyze - 1;

  processEpoch(epochToAnalyze, blockToAnalyze);
  
  

}

run();

