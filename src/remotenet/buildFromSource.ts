import { ConfigManager } from '../configManager';




export function getBuildFromSourceCmd(checkout: boolean = false) {
  const config = ConfigManager.getConfig();
  const dir = `~/${config.installDir}/diamond-node-git/`;

  let checkoutCMD = checkout ? `&& git checkout ${config.openEthereumBranch} ` : '';
  
  return `cd ${dir} && git pull ${checkoutCMD} && export RUSTFLAGS='-C target-cpu=native' &&  ~/.cargo/bin/cargo build --profile=${config.openEthereumProfile} --all -j 1 && cp target/${config.openEthereumProfile}/diamond-node ../diamond-node`;
}
