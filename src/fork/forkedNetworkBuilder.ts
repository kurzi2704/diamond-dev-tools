
import fs from "fs";
import * as path from 'path';
import { LocalnetBuilder } from "../localnet/localnet-builder";

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

        // create the final network directory
        fs.mkdirSync(path.join(this.workingDirectory, "final"), {recursive: true});

        // copy the original nodes from the boot network as it is.
        fs.copyFileSync(path.join(this.workingDirectory, "nodeFilesBoot"), path.join(this.workingDirectory, "final"));

        // copy the nodes from the fork network, but with the merged reserved peers file.

    }

    private createForkAdaptedSpec(originalSpec: string, nodeInfoForForkRaw: string, forkBlockStart: number) : string {


        

    }

    public mergeReservedPeers() {

    }


    // private async generateLocalNetwork() {
    //     let localnetBuilder = new LocalnetBuilder("");
    // }

    // private async adaptNetwork() {
    // }

}



