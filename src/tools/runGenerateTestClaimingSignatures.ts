import { cmd, cmdR } from "../remoteCommand";




const messagePrefix = "claim to: ";
const dockerContainerName = "adoring_zhukovsky";
const claimValue = "10000";

async function createSignatures(numSignatures = 10) {

    console.log("creating signatures from dmdv3...");

    // we use accounts 50 - 90 to generate 40 accounts to test with.
    const tuples: any[] = [];

    for(let i = 0; i < numSignatures; i++) {
        let sig = createAddressAndSignature();


        while(!sig.signature.startsWith("I")) {

            let postfix = ` -${i}`;
            sig = createAddressAndSignature(postfix);
        }
        tuples.push(sig);
    }
    


    let result = {
        messagePrefix: messagePrefix,
        balances: tuples
    }

    console.log("result:");
    console.log(JSON.stringify(result, null, 2));
}


function createAddressAndSignature(postfix = "") {

    // we use accounts 50 - 90 to generate 40 accounts to test with.
    const getAddressResult = cmd(`docker exec ${dockerContainerName} diamond-cli getnewaddress`);

    if (getAddressResult.success) {
        const addressV3 = getAddressResult.output.replace("\n", "");
        console.log("addressV3:" ,addressV3);

        const addressV4 = "0xbb753f1126c2463Ac29e175B180dAE7F7f627fA4";
        const messageComplete = messagePrefix + addressV4 + postfix; 

        let signingCmd = `diamond-cli signmessage "${addressV3}" "${messageComplete}"`; 
        const signatureResult = cmd(`docker exec ${dockerContainerName} ${signingCmd}`);

        if (signatureResult.success) {
            const signature = signatureResult.output.replace("\n", "");
            console.log("signature:", signature);

            let entry = 
                { dmdv3Address: addressV3, 
                  dmdv4Address: addressV4, 
                  value: claimValue,
                  signature: signature,
                  postfix: postfix };

            return entry;
        }
    }

    throw "unexpected";
}

createSignatures();