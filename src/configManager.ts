

import Web3 from 'web3';

import { generateAddressesFromSeed } from './utils';


export interface TestConfig {

    networkUrl : string,
    continuousSenderIntervalMin: number,
    continuousSenderIntervalMax: number,
    testDurationMs : number,
    mnemonic: string,
    mnemonicAccountIndex: number,
    calcNonceEveryTurn: boolean,
    trackPerformance: boolean,
    logToTerminal: boolean | undefined,
    logToFile: boolean | undefined,
    maximumPoolSize: number | undefined
}

export interface ContractAddresses {
    validatorSetAddress: string
}


//const mnemonic = "easy stone plastic alley faith duty away notice provide sponsor amount excuse grain scheme symbol";

const config = require('config') as TestConfig;
console.log('config: ', config);

export class ConfigManager {

    public static getConfig() {
        return config;
    }

    public static getWeb3() {

        const result = new Web3(config.networkUrl);
        const addressPairs = generateAddressesFromSeed(config.mnemonic, config.mnemonicAccountIndex + 1);
        const addAddress = {
            address: addressPairs[config.mnemonicAccountIndex].address,
            privateKey: addressPairs[config.mnemonicAccountIndex].privateKey
        }

        const addedWalletAccount = result.eth.accounts.wallet.add(addAddress);
        
        result.eth.defaultAccount = addedWalletAccount.address;
        result.defaultAccount = addedWalletAccount.address;

        console.log('setting default account to: ',  addedWalletAccount.address);

        return result;
    }

    public static getContractAddresses(/*web3?: Web3 = undefined*/) : ContractAddresses {
        //todo: query other addresses ?!
        // more intelligent contract manager that queries lazy ?

        return { validatorSetAddress: '0x1000000000000000000000000000000000000001' }
    }


}


