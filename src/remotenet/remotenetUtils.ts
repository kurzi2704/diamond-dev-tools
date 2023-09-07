import { cmdR } from "../remoteCommand";



export function getIP(nodeNumber: number) : string {

    return cmdR(`hbbft${nodeNumber}`, `dig @resolver3.opendns.com myip.opendns.com +short`).replace('\n', '');
}