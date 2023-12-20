import { ContractManager } from "../contractManager"




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

    let timeframeLength = await (await contractManager.getStakingHbbft()).methods.stakingTransitionTimeframeLength().call();
    console.log("timeframeLength: ", timeframeLength);


    console.log("is Early Epoch end: ", await rewardContract.methods.earlyEpochEnd().call());
    
    let connectivityTracker = await contractManager.getContractConnectivityTrackerHbbft();
    console.log("early epoch treshold: ", await connectivityTracker.methods.earlyEpochEndThreshold().call())  ;
    

     
    connectivityTracker.getPastEvents("ReportMissingConnectivity", {fromBlock: 1}, (e, events) => {
        console.log("ReportMissingConnectivity_num", events.length);
        console.log("ReportMissingConnectivity", events);
    });
}

run();