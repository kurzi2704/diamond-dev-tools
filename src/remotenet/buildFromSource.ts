import { ConfigManager } from '../configManager';

export function getBuildFromSourceCmd() {
  const config = ConfigManager.getConfig();
  const dir = `~/${config.installDir}/diamond-node/`;
  return `cd ${dir} && git pull && export RUSTFLAGS='-C target-cpu=native' &&  ~/.cargo/bin/cargo build --profile=${config.openEthereumProfile} --all -j 1 && cp target/${config.openEthereumProfile}/diamond-node ../diamond-node && echo diamond-node binary was copied`;
}
