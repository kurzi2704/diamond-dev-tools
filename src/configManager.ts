
import Web3 from 'web3';
import fs from 'fs';

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


//const mnemonic = "easy stone plastic alley faith duty away notice provide sponsor amount excuse grain scheme symbol";

const config = require('config') as TestConfig;
console.log('config: ', config);

export class ConfigManager {

    public static getConfig() : TestConfig{
        const result =  config;

        let mnemonic = config.mnemonic;

        if (!mnemonic) {
            // no mnemonic configured in config.
            // read mnemonic from .mnemonic file.
            const mnemonicFilename = '.mnemonic';

            if (!fs.existsSync(mnemonicFilename)) {
                throw Error('No mnemonic in config file found. No .mnemonic file found.');
            }

            const fileContent = fs.readFileSync(mnemonicFilename)
            result.mnemonic = fileContent.toString('utf8');
        }

        return result;
    }

    public static getWeb3() : Web3 {

        const web3Config  =  this.getConfig();
        const result = new Web3(config.networkUrl);
        result.eth.transactionConfirmationBlocks = 0;
        const addressPairs = generateAddressesFromSeed(web3Config.mnemonic, web3Config.mnemonicAccountIndex + 1);
        const addAddress = {
            address: addressPairs[config.mnemonicAccountIndex].address,
            privateKey: addressPairs[config.mnemonicAccountIndex].privateKey
        }

        const addedWalletAccount = result.eth.accounts.wallet.add(addAddress);
        result.eth.defaultAccount = addedWalletAccount.address;
        result.defaultAccount = addedWalletAccount.address;

        console.log('default account: ',  addedWalletAccount.address);

        return result;
    }



}


