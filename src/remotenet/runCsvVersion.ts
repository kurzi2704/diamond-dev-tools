import BigNumber from "bignumber.js";
import Web3 from "web3";
import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";

async function run() {

  const nodes = await getNodesFromCliArgs();
  const contracts = ContractManager.get();
  const block = await contracts.web3.eth.getBlockNumber();

  const minStake = await contracts.getMinStake(block);

  

  console.log(`min stake: ${minStake.toString(10)}`);
  const csvLines: Array<String> = [];
  for (const n of nodes) {

    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    let  versionVerbose = '';

    const config = ConfigManager.getConfig();
    try {
      versionVerbose = cmdR(nodeName, `~/${config.installDir}/diamond-node --version`);
    } catch (e) {
      versionVerbose = 'ERROR N/A';
    }
    
    // console.log(versionVerbose);
    const versionDetails = versionVerbose.split('\n');
    let version = '';
    if (versionDetails.length >= 2) {
      let v = versionDetails[1];
      v = v.replace('version', '').replace(' ', '');
      version = v;
    }

    let isAvailable = false;
    let isStaked = false;


    let totalStake = new BigNumber(0);
    let stakeString = "0";

    if (n.address) {
      isAvailable = await contracts.isValidatorAvailable(n.address, block);

      const poolAddress = await contracts.getAddressStakingByMining(n.address);
      totalStake = await contracts.getTotalStake(poolAddress);
      stakeString = totalStake.toString(10);
      console.log(`stake: ${stakeString}`);
      isStaked = totalStake.isGreaterThanOrEqualTo(minStake);
    }

    stakeString = totalStake.div(new BigNumber("1000000000000000000")).toString();
    
    csvLines.push(`"${n.sshNodeName()}";"${isAvailable}";"${isStaked}";"${stakeString}";"${n.address}";"${version}";`);
  }

  console.log('"node";"available";"staked";"stake";"address";"version";');
  csvLines.forEach(x => console.log(x));
}


run();