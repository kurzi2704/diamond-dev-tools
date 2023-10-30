import { ContractManager } from "../contractManager";
import BigNumber from 'bignumber.js';
import { sleep } from "../utils/time";

async function feedDelta() {

    const contractManager = ContractManager.get();
    const currentDelta = new BigNumber(await contractManager.getRewardDeltaPot('latest'));

    const web3 = contractManager.web3;

    console.log('current delta pot', currentDelta.toString());

    if (!currentDelta.isZero()) {
        console.log('delta pot is already filled. nothing to do.');
        return;
    }

    while (await web3.eth.getBlockNumber() < 21000 - 1) {
        await sleep(250);
        console.log(`${new Date(Date.now()).toLocaleString()}: waiting for block 21000. curent: `, await web3.eth.getBlockNumber());
    }
    const rewardContract = await contractManager.getRewardHbbft();
    console.log('funding from account:', web3.eth.defaultAccount);
    const result = await rewardContract.methods.addToDeltaPot().send({ from: web3.eth.defaultAccount!, gas: "100000", gasPrice: "1000000000",  value: web3.utils.toWei('608162', 'ether')  });

    console.log('delta pot funded.', result);
}


feedDelta();