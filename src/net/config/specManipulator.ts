import BigNumber from "bignumber.js";
import { ConfigManager } from "../../configManager";
import Web3 from "web3";


export class SpecManipulator {

    public constructor(public spec: any) {

    }

    public addOwnInitialAccountFunds(amount: string) : SpecManipulator{

        let web3 = ConfigManager.getWeb3();
        let defaultAccount = web3.eth.defaultAccount!;
        
        this.addInitialAccountFunds(amount, defaultAccount);

        return this;
    }

    public addInitialAccountFunds(amount: string, account: string) : SpecManipulator {

        this.spec.accounts[account] = amount;
        return this;
    }

}