import { ContractManager } from '../contractManager';
import { ConfigManager } from '../configManager';
import Web3 from 'web3';

async function run() {

  const contractManager = ContractManager.get();
  // const validatorsSet = contractManager.getValidatorSetHbbft();
  const stakingHbbft = await contractManager.getStakingHbbft();

  const pools = await stakingHbbft.methods.getPools().call();

  for (let index = 0; index < pools.length; index++) {
    const poolAddress = pools[index];

    const publicKey = await stakingHbbft.methods.getPoolPublicKey(poolAddress).call();
    const internet_address_raw = await stakingHbbft.methods.getPoolInternetAddress(poolAddress).call();

    const ip_hex = internet_address_raw["0"];
    const ip_BN = contractManager.web3.utils.toBN(ip_hex);
    const ip_array = ip_BN.toArray("le");
    console.log("Got IP: ", ip_array);

    const getIPFragment = (index: number) => {
      return index < ip_array.length ? ip_array[index] : 0;
    }

    const ip_string = `${getIPFragment(3)}.${getIPFragment(2)}.${getIPFragment(1)}.${getIPFragment(0)}`;
    const port_hex = internet_address_raw["1"];
    const port = contractManager.web3.utils.toBN(port_hex).toNumber();
    //assert();
    // ip_BN.toArray("le");

    // console.log(`public key: ${publicKey}@${ip_string}:${port}`);
    // content += `enode://${nodeInfos.public_keys[index].substr(2)}@${ips[index]}:${30300 + index + 1}\n`;

    console.log(`enode://${publicKey}@${ip_string}:${port}`);
  }
}

run();
