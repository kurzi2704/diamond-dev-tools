import { ContractManager } from "../contractManager";


async function run() {

  
  const contractManager = ContractManager.get();
  const toBN = contractManager.web3.utils.toBN;
  const rngContract = await contractManager.getRandomHbbft();
  const validatorSetContractAddress = await rngContract.methods.validatorSetContract().call();
  console.log(`validatorSetContract: ${validatorSetContractAddress}`);

  const targetValidatorSetContractAddress = '0x1000000000000000000000000000000000000001'
  if (!toBN(validatorSetContractAddress).eq(toBN(targetValidatorSetContractAddress))) {
    console.log('ValidatorSetContract address required to get updated..');
    //await rngContract.methods.initialize(targetValidatorSetContractAddress).send({from: contractManager.web3.defaultAccount! , gasPrice: 1000000000, gas: 1000000});
    //console.log('Validator set contract was updated.');
  }
}


run();