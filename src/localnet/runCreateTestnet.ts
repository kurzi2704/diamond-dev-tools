import { LocalnetBuilder } from "./localnet-builder";








function printHelp(): void {
    console.log('help:');
    console.log('requires 1 or 2 arguments:');
    console.log('1: number of initial validator nodes to create');
    console.log('2: (optional): number of total nodes to create. Must be bigger than or equal to argument 1');
}




async function run() {

    console.log('args:', process.argv);


    let localnetBuilder = new LocalnetBuilder("testnet/builder_test", 1, 4);

    localnetBuilder.build();
    // if (process.argv.length === 2) {
    //     printHelp();
    //     process.exit(1);
    // }

    // if (process.argv.length > 4) {
    //     printHelp();
    //     process.exit(1);
    // }

    // const numInitialValidators = parseInt(process.argv[2], 10);
    // let numNodes = numInitialValidators;

    // if (process.argv.length === 4) {
    //     numNodes = parseInt(process.argv[3], 10);
    // }

}

run();

