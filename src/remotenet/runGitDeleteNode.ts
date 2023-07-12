import { ConfigManager } from "../configManager";
import { executeOnRemotesFromCliArgs } from "./executeOnRemotes";



async function run() {

    let config = ConfigManager.getConfig();
    
    executeOnRemotesFromCliArgs(`rm ~/${config.installDir}/-fr diamond-node-git`);
} 

run();