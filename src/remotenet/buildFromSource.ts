import { ConfigManager } from '../configManager';




export function getBuildFromSourceCmd(checkout: boolean = false, copy: boolean = true) {
  const config = ConfigManager.getConfig();
  const installDir = ConfigManager.getNetworkConfig().installDir;
  const diamondNodeBranch = ConfigManager.getOpenEthereumBranch();
  
  //const x = ConfigManager.getNetworkConfig().
  const profile = config.openEthereumProfile; 

  const deadlockDetection = ConfigManager.getOpenEthereumDeadlockDetection();
  const dir = `~/${installDir}/diamond-node-git/`;

  let checkoutCMD = checkout ? `&& git checkout ${diamondNodeBranch} ` : '';
  let copyCMD = copy ? `&& cp target/${config.openEthereumProfile}/diamond-node ../diamond-node` : '';
  
  let features = deadlockDetection ? ' --features deadlock_detection' : '';
  return `cd ${dir} && rm -f target/${profile}/libparity_version.rlib && git pull ${checkoutCMD} && export RUSTFLAGS='-C target-cpu=native' &&  ~/.cargo/bin/cargo build ${features} --profile=${profile} --all -j 1 ${copyCMD}`;
}
