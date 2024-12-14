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

    // while (await web3.eth.getBlockNumber() < 21000 - 1) {
    //     await sleep(250);
    //     console.log(`${new Date(Date.now()).toLocaleString()}: waiting for block 21000. curent: `, await web3.eth.getBlockNumber());
    // }
    const rewardContract = await contractManager.getRewardHbbft();
    console.log('funding from account:', web3.eth.defaultAccount);
    
    const txConfig = { from: web3.eth.defaultAccount!, gasPrice: "1000000000",  value: web3.utils.toWei('1', 'ether')};
    const estimatedGas  = await rewardContract.methods.addToDeltaPot().estimateGas(txConfig);

    const totalDelta = await web3.eth.getBalance(web3.eth.defaultAccount!); 
    console.log('estimated gas:', estimatedGas);
    console.log('current delta:', totalDelta);

    const gasPrice = await web3.eth.getGasPrice();
    console.log('gas price:', totalDelta);

    const expectedCosts = new BigNumber(estimatedGas).multipliedBy(gasPrice);
    console.log(expectedCosts.toString());

    const amountToTransfer = new BigNumber(totalDelta).minus(expectedCosts);
    
    console.log('funding delta pot with:', amountToTransfer.toString(10));

    const addToDeltaResult = await rewardContract.methods.addToDeltaPot().send({ from: web3.eth.defaultAccount!, gasPrice: gasPrice.toString(), gas: estimatedGas, value: amountToTransfer.toString(10) });
    
    console.log('delta pot funded.', addToDeltaResult.transactionHash);
}

feedDelta();