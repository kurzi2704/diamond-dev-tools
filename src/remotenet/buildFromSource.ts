import { ConfigManager } from '../configManager';




export function getBuildFromSourceCmd(checkout: boolean = false) {
  const config = ConfigManager.getConfig();
  const installDir = ConfigManager.getNetworkConfig().installDir;

  const deadlockDetection = ConfigManager.getOpenEthereumDeadlockDetection();
  const dir = `~/${installDir}/diamond-node-git/`;

  let checkoutCMD = checkout ? `&& git checkout ${config.openEthereumBranch} ` : '';
  
  let features = deadlockDetection ? ' --features deadlock_detection' : '';
  return `cd ${dir} && git pull ${checkoutCMD} && export RUSTFLAGS='-C target-cpu=native' &&  ~/.cargo/bin/cargo build ${features} --profile=${config.openEthereumProfile} --all -j 1 && cp target/${config.openEthereumProfile}/diamond-node ../diamond-node`;
}
