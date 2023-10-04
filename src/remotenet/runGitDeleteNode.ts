import { ConfigManager } from "../configManager";
import { executeOnRemotesFromCliArgs } from "./executeOnRemotes";



async function run() {

    let config = ConfigManager.getNetworkConfig();
    
    executeOnRemotesFromCliArgs(`rm ~/${config.installDir}/-fr diamond-node-git`);
} 

run();