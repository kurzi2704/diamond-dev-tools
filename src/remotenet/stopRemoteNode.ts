import { NodeState } from "../net/nodeManager";
import { cmdR } from "../remoteCommand";



export function stopRemoteNode(node: NodeState, logErrors: boolean = true) {

    let sshName = node.sshNodeName();
    let shellCommand = 'screen -X -S node_test quit';
    try {
        console.log(`=== ${sshName } ===`);
        cmdR(sshName , shellCommand);
      } catch (e) {
        if (logErrors) {
          console.log(`Error on ${sshName }`, e);
        }
        else {
          console.log(`ignoring error on ${sshName}`);
        }
  
      }
  
}