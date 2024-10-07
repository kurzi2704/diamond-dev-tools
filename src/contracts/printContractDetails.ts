import { ContractManager } from "../contractManager"
import { toNumber } from "../utils/numberUtils";




async function run() {

    let contractManager = ContractManager.get();
    let validatorSet = contractManager.getValidatorSetHbbft();
    let rewardContract  =await contractManager.getRewardHbbft();
    // ValidatorSetHbbft

    // maxValidators
    // banDuration
    // keyGenHistoryContract
    // stakingContract
    // randomContract
    // blockRewardContract 

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
    const minGasPrice = permission.methods.minimumGasPrice().call();
    console.log("minGasPrice: ", await minGasPrice);

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
        const currentKeyGenMode = await validatorSet.methods.getPendingValidatorKeyGenerationMode(pendingValidator).call();
        console.log(`pending validator ${pendingValidator} key gen mode: `, currentKeyGenMode);
    }

    if (pendingValidators.length > 0) {

        const numberOfKeyFragmentsWritten = await keyGenHistoryContract.methods.getNumberOfKeyFragmentsWritten().call();
        console.log(`number of key fragments written:`, numberOfKeyFragmentsWritten);
    }

    //validatorSetContract.getPendingValidatorKeyGenerationMode(_sender)

    console.log(`likehilihood:`, await stakingContract.methods.getPoolsLikelihood().call());

    const pools = await stakingContract.methods.getPools().call();

    for (const pool of pools) {
        let miningAddress = await contractManager.getAddressMiningByStaking(pool);
        const callResult = await validatorSet.methods.validatorAvailableSince(miningAddress).call();
        console.log(`validator candidate ${pool} (node address:${miningAddress}) available since: ${callResult} ${new Date(Number.parseInt(callResult) * 1000).toUTCString()}`);
    }


    let timeframeLength = await stakingContract.methods.stakingTransitionTimeframeLength().call(); 
    console.log("timeframeLength: ", timeframeLength);


    let connectivityTracker = await contractManager.getContractConnectivityTrackerHbbft();
    console.log("early epoch treshold: ", await connectivityTracker.methods.earlyEpochEndThreshold().call());

    let earlyEpochEnd = await connectivityTracker.methods.isEarlyEpochEnd(stakingEpochNum).call();
    console.log("connectivity tracker: isEarlyEpochEnd", earlyEpochEnd);
    let earlyEpochEnd2 = await rewardContract.methods.earlyEpochEnd().call();
    console.log("is Early Epoch end: ", earlyEpochEnd2);


    let flaggedValidators = await connectivityTracker.methods.getFlaggedValidators().call();
    console.log("flagged validators:", flaggedValidators.length);


    for (let validator of flaggedValidators) {
        let score = await connectivityTracker.methods.getValidatorConnectivityScore(stakingEpochNum, validator).call();
        console.log("validator:", validator, "score:", score);
    }

    let  faultyValidatorsCount = toNumber(await connectivityTracker.methods.countFaultyValidators(stakingEpochNum).call());
    console.log("faultyValidatorsCount:", faultyValidatorsCount);
    

    let  minReportAgeBlocks = toNumber(await connectivityTracker.methods.minReportAgeBlocks().call());
     console.log("minReportAgeBlocks:", minReportAgeBlocks);
    // printScoreTable = true
    
    //let currentValidators = await validatorSet.methods.getValidators().call();  
  
    // connectivityTracker.getPastEvents("ReportMissingConnectivity", {fromBlock: 1}, (e, events) => {
    //     console.log("ReportMissingConnectivity_num", events.length);
    //     console.log("ReportMissingConnectivity", events);
    // });
}

run();