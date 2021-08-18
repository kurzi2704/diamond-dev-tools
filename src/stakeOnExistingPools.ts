import { ContractManager } from "./contractManager";



export async function stakeOnExistingPools(amount: string | undefined = undefined){


  const contractManager = ContractManager.get();
  const staking = await contractManager.getStakingHbbft();
  const pools = await staking.methods.getPools().call();

  console.log('available pools:', pools);
  let amountToStake = amount ?? (await staking.methods.delegatorMinStake().call());

  //pools.forEach(async (pool) => {
  for (let i = 2; i < pools.length; i++) {
    const pool = pools[i];
    console.log(`staking ${amountToStake} on ${pool}`);
    await staking.methods.stake(pool).send({ from: contractManager.web3.defaultAccount!, gas: '10000000', gasPrice: '4000000000',value: amountToStake});
  }
  
}