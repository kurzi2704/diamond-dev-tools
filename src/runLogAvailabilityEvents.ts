
import { ConfigManager } from './configManager';
import { ValidatorSetHbbft } from  './abi/contracts/ValidatorSetHbbft'
import { AbiItem } from 'web3-utils';
import ValidatorSetJson from './abi/json/ValidatorSetHbbft.json';



async function logAvailabilityEvents() {

  const web3 = ConfigManager.getWeb3();
  const testConfig = ConfigManager.getConfig();
  const contractAddresses = ConfigManager.getContractAddresses();
  
  
  const validatorSet = new web3.eth.Contract(ValidatorSetJson.abi as AbiItem[], contractAddresses.validatorSetAddress);

  // const validatorSet : ValidatorSetHbbft = (new web3.eth.Contract(ValidatorSetJson.abi as AbiItem[], contractAddresses.validatorSetAddress)) as ValidatorSetHbbft;

  //const validatorAvailable = await validatorSet.events.ValidatorAvailable();
  //const validatorUnavailable = await validatorSet.events.ValidatorUnavailable();
  // const validatorSet = new web3.eth.Contract( ) 

  
   const unavailableEvents = await validatorSet.getPastEvents('ValidatorUnavailable');
   const availableEvents = await validatorSet.getPastEvents('ValidatorAvailable');

  console.log('unavailableEvents', unavailableEvents);

  console.log('availableEvents', availableEvents);

}

logAvailabilityEvents();