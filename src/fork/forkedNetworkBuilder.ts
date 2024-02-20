
import fs from "fs";

/// https://github.com/DMDcoin/honey-badger-testing/issues/94



export class ForkedNetworkBuilder {

    constructor(public workingDirectory: string) {
        
    }

    public static async build() : Promise<ForkedNetworkBuilder> {

        let tmp = await fs.promises.mkdtemp('hbbft_network_fork');
        return new ForkedNetworkBuilder(tmp);


    }

    private async generateRealNetwork() {
        
    }


    private async adaptNetwork() {

    }

}



