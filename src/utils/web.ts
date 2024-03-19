import { sleep } from "./time";
import https from "https";


export async function getHttpsString(url: string): Promise<string> {

    let result = "";
    let specRequest = https.get(url, (res) => {
        res.once('data', (chunk: Buffer) => { 
            let text = chunk.toString("utf8");
            console.log(text);
        });
    });

    while(!specRequest.finished) {
        await sleep(5);
    }

    return result;
}