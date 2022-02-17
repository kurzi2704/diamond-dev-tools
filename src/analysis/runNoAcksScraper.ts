import { BigNumber } from "bignumber.js";
import { ContinuousTransactionsSender } from "../continuousTransactionsSender";
import { ContractManager, KeyGenMode } from "../contractManager";


class KeyGenRoundResult {

  public Epoch: number = 0;
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

    console.log(`processing end of epoch ${epochNumber}, starting with block ${epochEndBlock} iterating backward.`);

    //const epochStartBlock = 1;
    //console.log(`epoch ${epochNumber} starts at ${epochStartBlock}`);

    
    //const keyGenRoundCounter = 0;

    //console.log(`epoch ${epochNumber} switch found at block ${} starts at ${1}`);

    // the last key gen round is the successfull one.
    let thisKeyGenRoundIsASuccess = true;

    let blockToProcess = epochEndBlock;

    // the last block is always the last Block in the key gen round.
    let isLastBlockInKeyGenRound = true;


    let roundResult = new KeyGenRoundResult();
    roundResult.Epoch = epochNumber;
    roundResult.Success = true;
    roundResult.EndBlock = epochEndBlock;


    console.log(`processing block:  ${blockToProcess}`);

    let pendingValidators = await contractManager.getPendingValidators(blockToProcess);
    
    let keyGenRound = await contractManager.getKeyGenRound(blockToProcess);

    roundResult.KeyGenRound = keyGenRound;

    // contractManager.getKeyGenRound(blockToProcess);
    console.log(`Epoch ${roundResult.Epoch} KeyGenRound ${keyGenRound} success: ${roundResult.Success}`, );
    

    for (let validator of pendingValidators) {
      const parts = await contractManager.getKeyPARTBytesLength(validator, blockToProcess);
      const acks = await contractManager.getKeyACKSNumber(validator, blockToProcess);

      console.log(`got part for ${validator}`, parts);
      console.log(`got acks for ${validator}`, acks);
    }
    //contractManager.getKeyGenState();



    
    // ... scanning until keygeneration phase found ....

    // console.log(`key generation phase found with block start at`);
    
    return result;
  }


  let blockToAnalyze = await web3.eth.getBlockNumber();
  console.log('current block: ', blockToAnalyze);
  let epochNumber = await contractManager.getEpoch(blockToAnalyze);

  console.log('current epoch: ', epochNumber);

  let thisEpochStart = await contractManager.getEpochStartBlock();
  console.log('this epoch started with block ', thisEpochStart);

  const epochToAnalyze = epochNumber - 1;
  blockToAnalyze = thisEpochStart - 1;

  console.log(`The analysis starts one epoch earlier ${epochToAnalyze} with block ${blockToAnalyze}`, thisEpochStart);
  processEpoch(epochToAnalyze, blockToAnalyze);
  
  

}

run();

