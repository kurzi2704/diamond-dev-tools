
import { ConfigManager } from './configManager';
import { ContractManager } from './contractManager'; 
import { ValidatorSetHbbft } from  './abi/contracts/ValidatorSetHbbft'
import { StakingHbbft } from  './abi/contracts/StakingHbbft'
import { AbiItem } from 'web3-utils';
import ValidatorSetJson from './abi/json/ValidatorSetHbbft.json';
import StakingJson from './abi/json/StakingHbbft.json';



async function logAvailabilityEvents() {

  const web3 = ConfigManager.getWeb3();
  const testConfig = ConfigManager.getConfig();
  const contractAddresses = ContractManager.getContractAddresses();
  
  
  
  const validatorSetContract = new web3.eth.Contract(ValidatorSetJson.abi as AbiItem[], contractAddresses.validatorSetAddress, {});


  let validatorSet: ValidatorSetHbbft = (validatorSetContract as any);
  
  
  // const validatorSet : ValidatorSetHbbft = (new web3.eth.Contract(ValidatorSetJson.abi as AbiItem[], contractAddresses.validatorSetAddress)) as ValidatorSetHbbft;

  //const validatorAvailable = await validatorSet.events.ValidatorAvailable();
  //const validatorUnavailable = await validatorSet.events.ValidatorUnavailable();
  // const validatorSet = new web3.eth.Contract( ) 

  
  const unavailableEvents = await validatorSet.getPastEvents('ValidatorUnavailable');
  const availableEvents = await validatorSet.getPastEvents('ValidatorAvailable');

  console.log('unavailableEvents', unavailableEvents);
  console.log('availableEvents', availableEvents);

  const stakingContractAddress = await validatorSet.methods.stakingContract().call();
  console.log('stakingcontract address', stakingContractAddress);

  const stakingContract : StakingHbbft  = (new web3.eth.Contract(StakingJson.abi as AbiItem[], stakingContractAddress, {})) as any;


  //StakingHbbft
  // stakingContract.events.PlacedStake().emit()

}

logAvailabilityEvents();