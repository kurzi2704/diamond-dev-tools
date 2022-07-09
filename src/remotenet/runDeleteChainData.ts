import { ConfigManager } from "../configManager";
import { executeOnRemotesFromCliArgs } from "./executeOnRemotes";


const config = ConfigManager.getConfig();

executeOnRemotesFromCliArgs(`rm -r ~/${config.installDir}/data/cache && rm -r ~/${config.installDir}/data/chains`);