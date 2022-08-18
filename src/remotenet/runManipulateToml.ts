import { findSeries } from "async";
import { ConfigManager } from "../configManager";
import { cmd, cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";
import fs from "fs";

async function runAdd() {

  const nodes = await getNodesFromCliArgs();

  const config = ConfigManager.getConfig();

  
  for (const n of nodes) {

    const pathToToml = `~/${config.installDir}/validator_node.toml`;
    const result = cmdR(n.sshNodeName(), 'cat ' + pathToToml, false);
    //console.log(result);

    const valueToAdd = "tx_queue_per_sender = 2000";
    const addAfter = "reseal_on_txs = \"none\"";

    if (result.includes(valueToAdd)) {
      console.log('Skipping ' + n.sshNodeName() + ' value already exists in toml');
      continue;
    }

    const newResult = result.replace(addAfter, `${addAfter}\n${valueToAdd}`);

    const tempFile = "/tmp/honey-badger-testing-manipulate.toml";
    fs.writeFileSync(tempFile, newResult);

    cmd(`scp ${tempFile} ${n.sshNodeName()}:${pathToToml}`);

  }
}

async function runReplace() {

  const nodes = await getNodesFromCliArgs();

  const config = ConfigManager.getConfig();

  
  for (const n of nodes) {

    const pathToToml = `~/${config.installDir}/validator_node.toml`;
    const result = cmdR(n.sshNodeName(), 'cat ' + pathToToml, false);
    //console.log(result);

    const valueOld = "reseal_on_txs = \"none\"\"";
    const valueNew = "reseal_on_txs = \"none\"";

    if (!result.includes(valueOld)) {
      console.log('Skipping ' + n.sshNodeName() + 'nothing to do.');
      continue;
    }

    const newResult = result.replace(valueOld, valueNew);
    const tempFile = "/tmp/honey-badger-testing-manipulate.toml";
    fs.writeFileSync(tempFile, newResult);

    cmd(`scp ${tempFile} ${n.sshNodeName()}:${pathToToml}`);

  }
}




runReplace();