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
    console.log("banDuration:", await validatorSet.methods.banDuration().call());
    console.log("keyGenHistoryContract:", await validatorSet.methods.keyGenHistoryContract().call());
    console.log("stakingContract:", await validatorSet.methods.stakingContract().call());
    console.log("randomContract:", await validatorSet.methods.randomContract().call());
    console.log("blockRewardContract:", await validatorSet.methods.blockRewardContract().call());
    console.log("validatorInactivityThreshold", await validatorSet.methods.validatorInactivityThreshold().call());
    // console.log("blockRewardContract:", await validatorSet.methods.perm blockRewardContract().call());



    let permission = contractManager.getContractPermission();
    let minGasPrice = permission.methods.minimumGasPrice().call();
    console.log("minGasPrice: ", await minGasPrice);

    let stakingContract = await contractManager.getStakingHbbft();
    let stakingEpochNum = await stakingContract.methods.stakingEpoch().call();

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