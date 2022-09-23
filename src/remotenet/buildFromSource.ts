import { ConfigManager } from "../configManager";


export function getBuildFromSourceCmd() {
  const config = ConfigManager.getConfig();
  const dir = `~/${config.installDir}/openethereum-3.x/`;
  return `cd ${dir} && git pull && ~/.cargo/bin/cargo build --profile=${config.openEthereumProfile} --all -j 1 && cp target/${config.openEthereumProfile}/openethereum ../openethereum`;
}