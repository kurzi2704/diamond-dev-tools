import { ContractManager } from "../contractManager"




async function run() {

    let contractManager = ContractManager.get();

    let validatorSet = contractManager.getValidatorSetHbbft();

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
    // console.log("blockRewardContract:", await validatorSet.methods.perm blockRewardContract().call());


    let permission = contractManager.getContractPermission();
    let minGasPrice = permission.methods.minimumGasPrice().call();
    console.log("minGasPrice: ", await minGasPrice);

}

run();