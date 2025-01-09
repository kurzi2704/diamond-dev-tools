

import { ConfigManager } from '../configManager';
import { ContractManager } from '../contractManager'

export class NetworkController {

  public constructor(
    public contracManager: ContractManager = new ContractManager(ConfigManager.getWeb3())
  ) {

  }

  private getDefaultOptions() {
    return {
      from: this.contracManager.web3.eth.defaultAccount!,
      gas: '100000',
    }
  }

  public async setMaxValidators(newNumber: number) {

    const validatorSet = this.contracManager.getValidatorSetHbbft();
    let currentMaxValidators = await validatorSet.methods.maxValidators().call();

    console.log(`switching max validators from ${currentMaxValidators} to ${newNumber}`);
    const options = {
      from: this.contracManager.web3.eth.defaultAccount!,
      gas: '100000',

    }
    console.log(`sending with options:`, options);


    await validatorSet.methods.setMaxValidators(newNumber).send(options);

    currentMaxValidators = await validatorSet.methods.maxValidators().call();
    console.log(`max validators now  ${currentMaxValidators}`);
  }

}