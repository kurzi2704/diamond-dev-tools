import { ConfigManager } from '../configManager';
import { executeOnRemotesFromCliArgs } from './executeOnRemotes';

const config = ConfigManager.getNetworkConfig();

executeOnRemotesFromCliArgs(`rm -r ~/${config.installDir}/data/cache && rm -r ~/${config.installDir}/data/chains`);
