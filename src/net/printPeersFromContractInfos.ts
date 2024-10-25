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

    let ip = await contractManager.getIPAddress(poolAddress);

    const publicKey = await stakingHbbft.methods.getPoolPublicKey(poolAddress).call();
    const enode = ip.toEnode(publicKey);
    //assert();
    // ip_BN.toArray("le");

    // console.log(`public key: ${publicKey}@${ip_string}:${port}`);
    // content += `enode://${nodeInfos.public_keys[index].substr(2)}@${ips[index]}:${30300 + index + 1}\n`;

    console.log(enode);
  }
}

run();
