import { ForkedNetworkBuilder } from "./forkedNetworkBuilder";




async function run() {

    let builder = await ForkedNetworkBuilder.new();
    builder.create();
    
    
    
}


run();