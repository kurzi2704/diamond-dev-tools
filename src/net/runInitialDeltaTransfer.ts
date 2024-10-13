import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { generateNthAddressFromSeed } from "../utils";




async function transferDeltaToImmediateContract() {



    const web3 = ConfigManager.getWeb3();

    let config = ConfigManager.getConfig();

    // the first 30 accounts are used by this util, we transfer it to account 100
    // so we have plenty of space.
    const keyPair = generateNthAddressFromSeed(config.mnemonic, 100);
    web3.eth.accounts.wallet.add(keyPair);

    const balance = BigInt(await web3.eth.getBalance(web3.defaultAccount!));
    console.log("total wallets: ", web3.eth.accounts.wallet.length);
    console.log("current Balance: ", balance);

    const coinsToKeep = BigInt(await web3.utils.toWei("100", "ether"));
    const coinsToTransfer = balance - coinsToKeep;

    console.log("coinsToTransfer", coinsToTransfer);
    let coinsToTransferFormated = coinsToTransfer.toString(16);
    console.log("coinsToTransferFormated", coinsToTransferFormated);
    await web3.eth.sendTransaction({from: web3.eth.defaultAccount!, to: keyPair.address, value: "0x" + coinsToTransferFormated, gas: "21000"});

}


transferDeltaToImmediateContract();