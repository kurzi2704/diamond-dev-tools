import { sleep } from "./time";
import https from "https";


export async function getHttpsString(url: string): Promise<string> {

    let result = "";
    let closed = false;
    https.get(url, (res) => {
        res.on('data', (chunk: Buffer) => { 
            result = result  + chunk.toString("utf8");
        });
        res.once('close', () => {
            closed = true;
        })
    });

    while(!closed) {
        await sleep(5);
    }

    
    return result;
}