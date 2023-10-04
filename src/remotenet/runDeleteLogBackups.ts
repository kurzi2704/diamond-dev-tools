import { ConfigManager } from '../configManager';
import { executeOnRemotesFromCliArgs } from './executeOnRemotes';

const config = ConfigManager.getNetworkConfig();
executeOnRemotesFromCliArgs(`rm ~/${config.installDir}/log_backup_*`);
