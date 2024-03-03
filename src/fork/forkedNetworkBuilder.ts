
import fs from "fs";
import * as path from 'path';
import { LocalnetBuilder } from "../localnet/localnet-builder";
import Web3 from "web3";
import { copyFolderRecursiveSync } from "../utils/fs";

/// https://github.com/DMDcoin/honey-badger-testing/issues/94



export class ForkedNetworkBuilder {

    public portsBase = 30300;
    public portsBaseRPC = 8540;
    public portsBaseWS = 9540;

    constructor(public workingDirectory: string) {
        
    }

    /// creates a forked network builder
    /// with in a new empty temp directory
    public static async new() : Promise<ForkedNetworkBuilder> {

        let tmp = path.join("/tmp", await fs.promises.mkdtemp('hbbft_network_fork'));
        return new ForkedNetworkBuilder(tmp);
    }

    public async create()  {
         //buildNodeFiles()
         
        let bootNetBuilder = new LocalnetBuilder(4, 4);

        bootNetBuilder.buildNodeFiles();
        bootNetBuilder.copyNodeFilesToTargetDirectory(path.join(this.workingDirectory, "nodeFilesBoot"));
        console.log("node files created in tmp directory: ", this.workingDirectory);


        let forkNetBuilder = new LocalnetBuilder(4, 4);
        // we use different ports for the foked network,
        // that makes merging the reserved peers files easier.

        forkNetBuilder.portBase = 40300;
        forkNetBuilder.portBaseRPC = 18540;
        forkNetBuilder.portBaseWS = 19540;
        forkNetBuilder.metricsPortBase = 48705;

        forkNetBuilder.buildNodeFiles();
        forkNetBuilder.copyNodeFilesToTargetDirectory(path.join(this.workingDirectory, "nodeFilesFork"));
        console.log("node files created in tmp directory: ", this.workingDirectory);

        // create a merged reserved peers files.

        let bootReservedPeersFile = fs.readFileSync(path.join(this.workingDirectory, "nodeFilesBoot", "node1", "reserved-peers"), {encoding: 'utf-8'});
        let forkReservedPeersFile = fs.readFileSync(path.join(this.workingDirectory, "nodeFilesFork", "node1", "reserved-peers"), {encoding: 'utf-8'});


        let mergedReservedPeersFile = bootReservedPeersFile + "\n" + forkReservedPeersFile;
        let reservedPeersOutputFile = path.join(this.workingDirectory, "reserved-peers");
        fs.writeFileSync(reservedPeersOutputFile, mergedReservedPeersFile, {encoding: 'utf-8'});

        console.log("reserved peers file created: ", reservedPeersOutputFile);

        // create an adapted spec with a fork specification for the fork network.

        let originalSpec = JSON.parse(fs.readFileSync(path.join(this.workingDirectory, "nodeFilesBoot", "node1", "spec_hbbft.json"), {encoding: 'utf-8'}));
        let forkFiles = JSON.parse(fs.readFileSync(path.join(this.workingDirectory, "nodeFilesFork", "nodes_info.json"), {encoding: 'utf-8'}));

        let adaptedSpec = this.createForkAdaptedSpec(originalSpec, forkFiles, 30);
        // create the final network directory
        fs.mkdirSync(path.join(this.workingDirectory, "final"), {recursive: true});

        
        console.log("copy the original nodes from the boot network as it is.");
        // nodeFilesBoot is a directory,
        // we need to copy the files from the directory to the final directory.
        
        copyFolderRecursiveSync(path.join(this.workingDirectory, "nodeFilesBoot"), path.join(this.workingDirectory, "final"));

        
        
        // copy the nodes from the fork network, but with the merged reserved peers file.

    }

    private createForkAdaptedSpec(originalSpec: any, nodeInfoForForkRaw: any, forkBlockStart: number) : string {

        // make a copy of the original spec.
        let result = JSON.parse(JSON.stringify(originalSpec));

        let forks : any[] = [];

        let fork: any = {};

        fork["block_number_start"] = forkBlockStart;

        let validators: any[] = [];
        let parts: string[] = [];
        let acks: string[][] = [];


        for (let publicKey_ of nodeInfoForForkRaw["public_keys"]) {
            let publicKey : string = publicKey_;
            validators.push(publicKey.substring(2));
        }
        fork["validators"] = validators;


        for (let parts_ of nodeInfoForForkRaw["parts"]) {
            let partsFromInfo: [] = parts_;
            
            let partsAsHex = Web3.utils.bytesToHex(partsFromInfo);
            parts.push(partsAsHex.substring(2));
        }
        fork["parts"] = parts;

        for (let acksArray_ of nodeInfoForForkRaw["acks"]) {

            let thisAcks: string[] = [];
            for (let acksFromInfo_ of acksArray_) {
                let acksFromInfo : [] = acksFromInfo_;
                let acksAsHex = Web3.utils.bytesToHex(acksFromInfo);
                thisAcks.push(acksAsHex.substring(2));
            }

            acks.push(thisAcks);
        }

        fork["acks"] = acks;
        forks.push(fork);

        result.engine.hbbft.params["forks"] = forks;

        return result;
        // fork.
    }


    // private async generateLocalNetwork() {
    //     let localnetBuilder = new LocalnetBuilder("");
    // }

    // private async adaptNetwork() {
    // }

}



