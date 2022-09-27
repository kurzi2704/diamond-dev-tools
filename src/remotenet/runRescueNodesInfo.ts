import { cmdR } from '../remoteCommand';
import { ConfigManager } from '../configManager';
import { NodeInfos } from '../net/nodeInfo';

export function rescueNodeInfoFromRemotenet() {

  console.log("rescuing nodes_info.json out of existing configuration. This can help to run this toolset again one the local files are lost.");
  console.log("The tool does not ");

  // todo: get as CLI argument or ENV variable.
  const remotenet_size = 27;
  const config = ConfigManager.getConfig();
  const addresses: Array<string> = [];
  const public_keys: string[] = [];
  const ip_addresses: string[] = [];
  for (let n = 1; n <= remotenet_size; n++) {
    
    const address_result = cmdR(`hbbft${n}`, `cat ~/${config.installDir}/address.txt`);
    addresses.push(address_result);
    public_keys.push(cmdR(`hbbft${n}`, `cat ~/${config.installDir}/address.txt`));
    ip_addresses.push(cmdR(`hbbft${n}`, `dig @resolver3.opendns.com myip.opendns.com +short`));
  }
  
  const result : NodeInfos = {
    acks: [],
    parts: [],
    ip_addresses: ip_addresses,
    public_keys: public_keys,
    staking_addresses: [],
    validators: addresses
  }

  console.log("Json data to write into the node_info.json");
  console.log(JSON.stringify(result));

  return result;
  
}

rescueNodeInfoFromRemotenet();