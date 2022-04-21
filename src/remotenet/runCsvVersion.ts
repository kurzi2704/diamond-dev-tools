import { ContractManager } from "../contractManager";
import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";

async function run() {

  const nodes = await getNodesFromCliArgs();
  const contracts = ContractManager.get();
  const block = await contracts.web3.eth.getBlockNumber();

  const csvLines : Array<String> = [];
  for (const n of nodes) {
    
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);
    const versionVerbose = cmdR(nodeName, `~/dmdv4-testnet/openethereum --version`);
    // console.log(versionVerbose);
    const versionDetails = versionVerbose.split('\n');
    let version = '';
    if (versionDetails.length >= 2) {
      let v = versionDetails[1];
      v = v.replace('version', '').replace(' ', '');
      version = v;
    }

    let isAvailable = false;

    if (n.address) {
      isAvailable = await contracts.isValidatorAvailable(n.address, block);
    }

    csvLines.push(`"${n.sshNodeName()}";"${isAvailable}";"${n.address}";"${version}";`);
  }

  console.log('"node";"available";"address";"version";');
  csvLines.forEach(x => console.log(x));
}


//todo find better command, this kind of hard kills it.
run();