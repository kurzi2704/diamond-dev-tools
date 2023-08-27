
import Web3 from 'web3';
import fs from 'fs';

import { generateAddressesFromSeed } from './utils';
import { ContinuousTransactionsSender } from './continuousTransactionsSender';
import { Account, AddedAccount } from 'web3-core';


// "name": "local",
// "rpc": "http://127.0.0.1:8540",
// "blockscout": "http://127.0.0.1:8540",
// "db" : "http://127.0.0.1:5432"
export interface Network {
    name: string,
    rpc: string,
    blockscout: string,
    db: string,
    nodesDir: string,
    installDir: string
}

export interface TestConfig {

    network: string,
    networkGitRepo: string,
    networkGitRepoBranch: string,
    openEthereumProfile: string,
    openEthereumBranch: string,
    blockscoutInstance: string,
    continuousSenderIntervalMin: number,
    continuousSenderIntervalMax: number,
    testDurationMs: number,
    mnemonic: string,
    mnemonicAccountIndex: number,
    calcNonceEveryTurn: boolean,
    trackPerformance: boolean,
    logToTerminal: boolean | undefined,
    logToFile: boolean | undefined,
    maximumPoolSize: number | undefined
    networks: Array<Network>
}


//const mnemonic = "easy stone plastic alley faith duty away notice provide sponsor amount excuse grain scheme symbol";

const config = require('config') as TestConfig;
console.log('config: ', config);



function verifyExists(value: string) {
    if (value.length == 0) {
        throw new Error('This value must be set.');
    }
}
export class ConfigManager {
    static getNodesDir(): string {
      
        const network = this.getNetworkConfig();
        return network.nodesDir;
    }

    static getInstallDir(): string {

        const network = this.getNetworkConfig();
        return network.installDir;
     }


    public static getNetworkConfig(): Network 
    {   
        let config = ConfigManager.getConfig();

        for (let network of config.networks) { 
            // console.log('network: ', network);
            if (network.name == config.network) {
                //console.log('network found!!: ', network);
                return network;
            }
        }

        throw new Error(`Network ${config.network} not found in config file.`);

    }


    public static getConfig(): TestConfig {
        
        const result = config;

        let mnemonic = config.mnemonic;

        // verifyExists(config.installDir);

        if (!mnemonic) {
            // no mnemonic configured in config.
            // read mnemonic from .mnemonic file.
            const mnemonicFilename = '.mnemonic';

            if (!fs.existsSync(mnemonicFilename)) {
                console.log('WARNING: No mnemonic in config file found. No .mnemonic file found.');
                return result;
            }

            const fileContent = fs.readFileSync(mnemonicFilename)
            result.mnemonic = fileContent.toString('utf8');
        }

        

        return result;
    }

    public static getWeb3(): Web3 {

        const web3Config = this.getConfig();
        const networkConfig = this.getNetworkConfig();
        const result = new Web3(networkConfig.rpc);
        result.eth.transactionConfirmationBlocks = 0;
        const addressPairs = generateAddressesFromSeed(web3Config.mnemonic, web3Config.mnemonicAccountIndex + 1);
        const addAddress = {
            address: addressPairs[config.mnemonicAccountIndex].address,
            privateKey: addressPairs[config.mnemonicAccountIndex].privateKey
        }

        const addedWalletAccount = result.eth.accounts.wallet.add(addAddress);
        result.eth.defaultAccount = addedWalletAccount.address;
        result.defaultAccount = addedWalletAccount.address;

        // console.log('default account: ', addedWalletAccount.address);

        return result;
    }

    public static insertWallets(web3: Web3, count = 30) : Array<AddedAccount> {

        const addressPairs = generateAddressesFromSeed(config.mnemonic, count);
        let result = Array<AddedAccount>();

        console.log('calculated pairs: ', addressPairs.length);
        // web3.eth.accounts.wallet.add
        // web3.eth.accounts.wallet.add(addAddress);

        let wallets: Account[] = [];
        for (let i = 0; i < web3.eth.accounts.wallet.length; i++) {
            wallets.push(web3.eth.accounts.wallet[i]);
        }

        console.log("wallets:", wallets.length);

        for (let i = 0; i < count; i++) {

            console.log('inserting wallet: ', i);
            const pair = addressPairs[i];
            

            if (wallets.map(x => x.address).indexOf(pair.address) >= 0) {
                console.log('already found: ', pair.address);
                continue;
            }

            const addedWalletAccount = web3.eth.accounts.wallet.add(pair);
            result.push(addedWalletAccount);
            console.log(`added wallet: `, addedWalletAccount.address);

        }

        return result;
    }
}