import { ContractManager } from "../contractManager";
import BigNumber from 'bignumber.js';

async function feedDelta() {

    const contractManager = ContractManager.get();
    const currentDelta = new BigNumber(await contractManager.getRewardDeltaPot('latest'));

    const web3 = contractManager.web3;

    console.log('current delta pot', currentDelta.toString());

    if (!currentDelta.isZero()) {
        console.log('delta pot is already filled. nothing to do.');
        return;
    }

    const rewardContract = await contractManager.getRewardHbbft();
    //const result = await rewardContract.methods.addToDeltaPot().send({ from: web3.defaultAccount!, gas: "100000",  value: web3.utils.toWei('600000', 'ether')  });

    //console.log('delta pot funded.', result);
}


feedDelta();