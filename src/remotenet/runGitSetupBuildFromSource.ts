import { ConfigManager } from "../configManager";
import { executeOnRemotesFromCliArgs } from "./executeOnRemotes";



async function run() {

    let config = ConfigManager.getNetworkConfig();
    
    executeOnRemotesFromCliArgs(`cd ~/${config.installDir} && ./setup-build-from-source.sh`);
} 

run();