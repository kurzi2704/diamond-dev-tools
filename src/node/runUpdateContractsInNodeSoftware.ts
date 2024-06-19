import fs from "fs";


async function runAll() {

    //let contractsMapping = {
    //    "staking_contract": "StakingHbbft"
    //};

    let artifactsBaseDir = "../diamond-contracts-core/artifacts/contracts/";
    let nodeContractPath = "../diamond-node/crates/ethcore/res/contracts/"
    
    let dmdNodeFile =  nodeContractPath + "staking_contract.json";
    let artifactFile = artifactsBaseDir + "StakingHbbft" + ".sol/StakingHbbft.json";
    handleContract(dmdNodeFile, artifactFile);
}


async function handleContract(dmdNodeFile: string, contractArtifactLocation: string) {

    let artifactText = fs.readFileSync(contractArtifactLocation, { encoding: "utf-8"});
    const artifact = JSON.parse(artifactText);
    let artifactOut = [];
    for (const item of artifact.abi) {
        if (item.type === "function") {
            artifactOut.push(item);
        }
    }

    fs.writeFileSync(dmdNodeFile, JSON.stringify(artifactOut, null, 4));
}


runAll();