import { ContractManager } from "../contractManager"
import { NodeManager } from "../net/nodeManager";
import { toDate, toNumber } from "../utils/numberUtils";




async function run() {

    const contractManager = ContractManager.get();
    const nodeManager = NodeManager.get();
    const validatorSet = contractManager.getValidatorSetHbbft();
    const rewardContract  =await contractManager.getRewardHbbft();
    const web3 = contractManager.web3;
    
    // ValidatorSetHbbft

    // maxValidators
    // banDuration
    // keyGenHistoryContract
    // stakingContract
    // randomContract
    // blockRewardContract 

    const latestBlock = await web3.eth.getBlock("latest");
    console.log("latest block:", latestBlock.number);
    console.log("timestamp:", toDate(latestBlock.timestamp).toUTCString());
    console.log("gas limit:", latestBlock.gasLimit);
    
    console.log("maxValidators:", await validatorSet.methods.maxValidators().call());
    // console.log("banDuration:", await validatorSet.methods.banDuration().call());
    console.log("keyGenHistoryContract:", await validatorSet.methods.keyGenHistoryContract().call());
    console.log("stakingContract:", await validatorSet.methods.stakingContract().call());
    console.log("randomContract:", await validatorSet.methods.randomContract().call());
    console.log("blockRewardContract:", await validatorSet.methods.blockRewardContract().call());
    console.log("validatorInactivityThreshold", await validatorSet.methods.validatorInactivityThreshold().call());
    // console.log("blockRewardContract:", await validatorSet.methods.perm blockRewardContract().call());

    const keyGenHistoryContract = await contractManager.getKeyGenHistory();

    //let latestBlock = contractManager.web3.eth.getBlock("latest");

    const keyGenRound = await contractManager.getKeyGenRound();
    console.log("keyGenRound:", keyGenRound); 

    const permission = contractManager.getContractPermission();
    const minGasPrice = await permission.methods.minimumGasPrice().call();
    console.log("minGasPrice: ", minGasPrice);

    const blockGasLimit = await permission.methods.blockGasLimit().call();
    console.log("blockGasLimit: ", blockGasLimit);

    const stakingContract = await contractManager.getStakingHbbft();
    const stakingEpochNum = await stakingContract.methods.stakingEpoch().call();

    const epochStartTime = new Date(Number.parseInt(await stakingContract.methods.stakingEpochStartTime().call()) * 1000);
    const phaseTransition = new Date(Number.parseInt(await stakingContract.methods.startTimeOfNextPhaseTransition().call()) * 1000);
    const epochEndTime = new Date(Number.parseInt(await stakingContract.methods.stakingFixedEpochEndTime().call()) * 1000);

    console.log(`epoch start time UTC: ${epochStartTime.toUTCString()}`);
    console.log(`next Phase Transition UTC: ${phaseTransition.toUTCString()}`);
    console.log(`Epoch End Time: UTC: ${epochEndTime.toUTCString()}`);


    const pendingValidators = await validatorSet.methods.getPendingValidators().call()
    console.log(`pending validators:`, pendingValidators);

    
    for (let i = 0; i < pendingValidators.length; i++) {
        const pendingValidator = pendingValidators[i];
        const currentKeyGenMode = await contractManager.getPendingValidatorStateFormatted(pendingValidator);
        
        console.log(`pending validator ${await nodeManager.formatNodeName(pendingValidator)} key gen mode: `, currentKeyGenMode);
    }

    if (pendingValidators.length > 0) {

        const numberOfKeyFragmentsWritten = await keyGenHistoryContract.methods.getNumberOfKeyFragmentsWritten().call();
        console.log(`number of key fragments written:`, numberOfKeyFragmentsWritten);
    }

    const currentValidators = await contractManager.getValidators();
    console.log(`current validators:`, currentValidators);

    console.log(`Key state:`);
    for (const validator of currentValidators) {
        const partByteLength = await contractManager.getKeyPARTBytesLength(validator);
        const acks = await contractManager.getKeyACKSNumber(validator);

        console.log(`${await nodeManager.formatNodeName(validator)} partByteLength: ${partByteLength} acks: ${acks}`);        
    }
    //validatorSetContract.getPendingValidatorKeyGenerationMode(_sender)

    console.log(`likehilihood:`, await stakingContract.methods.getPoolsLikelihood().call());
    const pools = await stakingContract.methods.getPools().call();
    

    for (const pool of pools) {
        let miningAddress = await contractManager.getAddressMiningByStaking(pool);
        const callResult = await validatorSet.methods.validatorAvailableSince(miningAddress).call();
        let miningAddressText = await nodeManager.formatNodeName(miningAddress); 
        let ipAddress = await contractManager.getIPAddress(pool);
        console.log(`validator candidate ${pool} (node address:${miningAddressText}) IP: ${ipAddress} available since: ${callResult} ${new Date(Number.parseInt(callResult) * 1000).toUTCString()}`);
    }

    let timeframeLength = await stakingContract.methods.stakingTransitionTimeframeLength().call(); 
    console.log("transition timeframeLength: ", timeframeLength);


    let connectivityTracker = await contractManager.getContractConnectivityTrackerHbbft();
    console.log("early epoch treshold: ", await connectivityTracker.methods.earlyEpochEndThreshold().call());

    let earlyEpochEnd = await connectivityTracker.methods.isEarlyEpochEnd(stakingEpochNum).call();
    console.log("connectivity tracker: isEarlyEpochEnd", earlyEpochEnd);
    let earlyEpochEnd2 = await rewardContract.methods.earlyEpochEnd().call();
    console.log("is Early Epoch end: ", earlyEpochEnd2);


    let flaggedValidators = await connectivityTracker.methods.getFlaggedValidators().call();
    console.log("flagged validators:", flaggedValidators.length);


    for (let validator of currentValidators) {
        let score = await connectivityTracker.methods.getValidatorConnectivityScore(stakingEpochNum, validator).call();
        const flaggedInfo = flaggedValidators.find((v) => v === validator) ? " (flagged)" : "";
        console.log("validator:", validator, "connectivity score:", score, flaggedInfo);
    }

    let  faultyValidatorsCount = toNumber(await connectivityTracker.methods.countFaultyValidators(stakingEpochNum).call());
    console.log("faultyValidatorsCount:", faultyValidatorsCount);
    

    // let  minReportAgeBlocks = toNumber(await connectivityTracker.methods.minReportAgeBlocks().call());
    //  console.log("minReportAgeBlocks:", minReportAgeBlocks);
    // printScoreTable = true
    
    //let currentValidators = await validatorSet.methods.getValidators().call();  
  
    // connectivityTracker.getPastEvents("ReportMissingConnectivity", {fromBlock: 1}, (e, events) => {
    //     console.log("ReportMissingConnectivity_num", events.length);
    //     console.log("ReportMissingConnectivity", events);
    // });

    // console.log("code: ", await web3.eth.getCode("0xD76b5A1C3D46F397305aC3Bf059000CC21E2a73B"));
}

run();