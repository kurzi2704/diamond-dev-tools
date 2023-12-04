/// rescues the lost coins.

import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { toNumber } from "../utils/numberUtils";

async function executeRescue() {


    let contracts = ContractManager.get();

    let web3 = contracts.web3;

    let staking = await contracts.getStakingHbbft();
    let validator = await contracts.getValidatorSetHbbft();

    let txOptions = {from: web3.eth.defaultAccount!, gas: 500000};
    //let estimatedgGas = await staking.methods.recoverAbandonedStakes().estimateGas(txOptions);

    // let estimatedgGas = await staking.methods.recoverAbandonedStakes().estimateGas(txOptions);

    let now = toNumber((await web3.eth.getBlock("latest")).timestamp);

    let treshold = toNumber(await validator.methods.validatorInactivityThreshold().call());
    console.log("now:", now);

    let poolsOverTreshold : Array<String> = [];

    for (let pool of await contracts.getPoolsInactive()) {
        console.log("Pool", pool);

        let mining = await contracts.getAddressMiningByStaking(pool);
        console.log("- mining", mining);

        // staking.methods.isPo
        let availableSince = await validator.methods.validatorAvailableSince(mining).call();
        console.log("- availableSince: ", availableSince);

        let availableSinceLastWrite = toNumber(await validator.methods.validatorAvailableSinceLastWrite(mining).call());
        console.log("- lastWrite: ", availableSinceLastWrite);

        let noWriteDuration = now - availableSinceLastWrite; 
        console.log("- noWrite Duration: ", noWriteDuration);

        console.log("- noWrite Duration days: ", noWriteDuration / (24 * 60 * 60));

        if (noWriteDuration > treshold) {
            poolsOverTreshold.push(pool);
        }
    }

    if (poolsOverTreshold.length == 0) {
        console.log("No inactive candidates with abandoned stakes found");
    } else {
        console.log("found inactive candidates with abandoned stakes", poolsOverTreshold);
    }


    // console.log("estimated gas:", estimatedgGas);
    //let txResult = await staking.methods.recoverAbandonedStakes().send(txOptions);
    //console.log("events: ", txResult.events);


}


executeRescue();