


export declare interface KeyPair {
  address: string,
  privateKey: string
}


export function generateAddressesFromSeed(mnemonic: string, count: number) : Array<KeyPair> {

  let bip39 = require("bip39");
  let ethereumjs = require("ethereumjs-wallet");
  let hdkey = ethereumjs.hdkey;
  let seed = bip39.mnemonicToSeedSync(mnemonic);
  let hdwallet = hdkey.fromMasterSeed(seed);
  let wallet_hdpath = "m/44'/60'/0'/0/";

  let accounts = [];
  for (let i = 0; i < count; i++) {
    let wallet = hdwallet.derivePath(wallet_hdpath + i).getWallet();
    let address = "0x" + wallet.getAddress().toString("hex");
    let privateKey = wallet.getPrivateKey().toString("hex");
    accounts.push({address: address, privateKey: privateKey});
  }

  return accounts;
}

export function generateNthAddressFromSeed(mnemonic: string, index: number) : KeyPair {
  let bip39 = require("bip39");
  let ethereumjs = require("ethereumjs-wallet");
  let hdkey = ethereumjs.hdkey;
  let seed = bip39.mnemonicToSeedSync(mnemonic);
  let hdwallet = hdkey.fromMasterSeed(seed);
  let wallet_hdpath = "m/44'/60'/0'/0/";

  let wallet = hdwallet.derivePath(wallet_hdpath + index).getWallet();
  let address = "0x" + wallet.getAddress().toString("hex");
  let privateKey = wallet.getPrivateKey().toString("hex");

  return {address: address, privateKey: privateKey};
}
