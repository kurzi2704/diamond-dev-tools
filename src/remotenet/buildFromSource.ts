import { ConfigManager } from '../configManager';




export function getBuildFromSourceCmd() {
  const config = ConfigManager.getConfig();
  const dir = `~/${config.installDir}/diamond-node-git/`;

  
  return `cd ${dir} && git pull && git checkout ${config.openEthereumBranch} && export RUSTFLAGS='-C target-cpu=native' &&  ~/.cargo/bin/cargo build --profile=${config.openEthereumProfile} --all -j 1 && cp target/${config.openEthereumProfile}/diamond-node ../diamond-node`;
}
