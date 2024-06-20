import { ConfigManager } from "../configManager";
import { ForkedNetworkBuilder } from "./forkedNetworkBuilder";




async function run() {


    let targetDir = ConfigManager.getLocalTargetNetworkFSDir();

    console.log("targetDir: ",targetDir);

    let builder = new ForkedNetworkBuilder(targetDir);
    builder.createFreshNetworkWithFork(4, 4, 15, true);
    
    
    
}


run();