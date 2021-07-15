import Web3 from 'web3';
import { ValidatorSetHbbft } from './abi/contracts/ValidatorSetHbbft';
import JsonValidatorSetHbbft from './abi/json/ValidatorSetHbbft.json';

import { StakingHbbft } from './abi/contracts/StakingHbbft';
import JsonStakingHbbft from './abi/json/StakingHbbft.json';

import { KeyGenHistory } from './abi/contracts/KeyGenHistory';
import JsonKeyGenHistory from './abi/json/KeyGenHistory.json';


export interface ContractAddresses {
  validatorSetAddress: string
}

export class ContractManager {

  private cachedValidatorSetHbbft?: ValidatorSetHbbft;
  private cachedStakingHbbft?: StakingHbbft;
  private cachedKeyGenHistory?: KeyGenHistory;

  public constructor(public web3: Web3) {

  }

  public static getContractAddresses() : ContractAddresses {
    //todo: query other addresses ?!
    // more intelligent contract manager that queries lazy ?
    return { validatorSetAddress: '0x1000000000000000000000000000000000000001' }
  }

  public getValidatorSetHbbft() : ValidatorSetHbbft {

    if (this.cachedValidatorSetHbbft) {
      return this.cachedValidatorSetHbbft;
    }

    const contractAddresses = ContractManager.getContractAddresses();

    const abi : any = JsonValidatorSetHbbft.abi;
    const validatorSetContract : any = new this.web3.eth.Contract(abi, contractAddresses.validatorSetAddress);
    this.cachedValidatorSetHbbft = validatorSetContract;
    //const validatorSet : ValidatorSetHbbft = validatorSetContract;
    return validatorSetContract;
  }

  public async getStakingHbbft() : Promise<StakingHbbft> {
    
    if (this.cachedStakingHbbft) {
      return this.cachedStakingHbbft;
    }

    const contractAddress = await this.getValidatorSetHbbft().methods.stakingContract().call();
    
    const abi : any = JsonStakingHbbft.abi;
    const stakingContract : any = new this.web3.eth.Contract(abi, contractAddress);
    this.cachedStakingHbbft = stakingContract;
    return stakingContract;
  }

  public async getKeyGenHistory() : Promise<KeyGenHistory> {
    
    if (this.cachedKeyGenHistory) {
      return this.cachedKeyGenHistory;
    }

    const contractAddress = await this.getValidatorSetHbbft().methods.keyGenHistoryContract().call();
    console.log('KeyGenHistory address: ', contractAddress);

    const abi : any = JsonKeyGenHistory.abi;
    const contract : any = new this.web3.eth.Contract(abi, contractAddress);
    this.cachedKeyGenHistory = contract;
    return contract;
  }

 }
