import Web3 from "web3";
import { sleep } from "../utils/time";



export async function waitForRPC(web3: Web3) {

    while (true) {
        try {
            let result = await web3.eth.getBlockNumber();
        } catch (e) {
            await sleep(200);
        }
    }
}