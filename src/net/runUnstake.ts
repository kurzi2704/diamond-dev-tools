import BigNumber from "bignumber.js";
import { PromiEvent, TransactionReceipt } from "web3-core";
import { ContractManager } from "../contractManager";
import { getNodesFromCliArgs } from "../remotenet/remotenetArgs";



function logPromiEvent(tx: PromiEvent<TransactionReceipt>) {
  tx.on("transactionHash", (hash) => {
    console.log(`Hash: ${hash}`);
  });

  tx.on("sending", (payload) => {
    console.log(`sending:`, payload);
  });


  tx.on("receipt", (receipt) => {
    console.log(`receipt: ${receipt}`);
  });

  
}

export async function unstake(){


  const contractManager = ContractManager.get();
  const staking = await contractManager.getStakingHbbft();
  const validatoreSet = await contractManager.getValidatorSetHbbft();
  const pools = await staking.methods.getPools().call();

  const web3 = contractManager.web3;

  //const allValidators = (await contractManager.getValidators()).map(x=> x.toLowerCase());

  const nodes = await getNodesFromCliArgs();

  //console.log('available pools:', pools);
  //let amountToStake = amount ?? (await staking.methods.delegatorMinStake().call());

  console.log('running unstake for : ', nodes);

  for(let node of nodes) {
    
    if (!node.address) {
      console.log(`INFO: No Address for node: ${node.nodeID} ${node.address}`);
      continue;
    }
      //const available = await contractManager.isValidatorAvailable(node.address)
      
      // if (allValidators.includes(node.address)) {
      // console.log(`INFO: Skipping ${node.nodeID} ${node.address} because it is a current validator`);
      // }

      // if (!available) {

      // }
      // else {
      //   const isCurrent = contractManager.isValidatorCurrent(node.address);
      // }

    let nodeText =  `${node.nodeID} ${node.address}`;


    const stakingAddress = await contractManager.getAddressStakingByMining(node.address);
    const stakingAddressBN = new BigNumber(stakingAddress);

    if (stakingAddressBN.isZero()) {
      console.log(`INFO: Not a Pool: ${nodeText}`);
      continue;
    }

    const stakeAmount = new BigNumber(await staking.methods.stakeAmount(stakingAddress, stakingAddress).call());
    nodeText = `${node.nodeID} ${node.address} staking Address: ${stakingAddress}`;

    if (stakeAmount.isZero()) {
      console.log(`INFO: nothing at stake for: ${nodeText}`);
      continue;
    }

    

    // we keep a symbolik  stake so the pool does not get removed.

    const withdrawAmount = stakeAmount.minus(1.0).toString(10);
    console.log(`${nodeText} withdrawing ${withdrawAmount}`);
    const withdrawCall = staking.methods.withdraw(stakingAddress, withdrawAmount );
    // const callResult = await withdrawCall.call({ from: stakingAddress, gas: '100000000'  });
    const sendTx =  withdrawCall.send({ from: stakingAddress, gas: '100000',  gasPrice: '100000000000' });
    logPromiEvent(sendTx);

    const sendResult = await sendTx;
    console.log(`Executed withdraw for ${nodeText} tx: ${sendResult.transactionHash}`);
    
    
  }
  
}


unstake();