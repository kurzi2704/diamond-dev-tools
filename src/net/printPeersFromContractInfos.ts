import { ContractManager } from '../contractManager';
import { ConfigManager } from '../configManager';

async function run() {

  const contractManager = ContractManager.get();

  //const validatorsSet = contractManager.getValidatorSetHbbft();
  const stakingHbbft = await contractManager.getStakingHbbft();

  const pools = await stakingHbbft.methods.getPools().call();

  for (let index = 0; index < pools.length; index++) {
    const poolAddress = pools[index];
    
    const publicKey = await stakingHbbft.methods.getPoolPublicKey(poolAddress).call();
    const ip = await stakingHbbft.methods.getPoolInternetAddress(poolAddress).call();

    console.log(`pk: ${publicKey} ${ip}`);
    //content += `enode://${nodeInfos.public_keys[index].substr(2)}@${ips[index]}:${30300 + index + 1}\n`;

    console.log(`enode://${publicKey}@${ip}:40301`);
  }

}


run();