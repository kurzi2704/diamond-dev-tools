import child_process from 'child_process';
import { startNode } from '../startNode';
import { loadNodeInfosFromTestnetDirectory } from './nodeInfo';

export class NodeState {

  public constructor(public nodeID: number, public publicKey: string | undefined) {

  }

  public childProcess?: child_process.ChildProcess;
  public isStarted = false;


  public start(force = false) {
    if (this.isStarted && !force) {
      throw new Error(`Node ${this.nodeID} is already started.`);
    }

    this.childProcess = startNode(this.nodeID);
    this.isStarted = true;
  }

  public async stop(force = false) {

    if (!this.isStarted && !force) {
      throw new Error(`Can't stop node ${this.nodeID} that has not been started yet.`);
    }

    if (!this.childProcess) {
      throw new Error(`Can't stop node ${this.nodeID} without having a child process.`);
    }

    this.childProcess.on("close", (x)=> {
      console.log("closed!!", x);
    })

    
    let isExited = false;

    this.childProcess.on("exit", (x)=> {
      console.log("exited!", x);
      isExited = true;
    })

    function sleep(milliseconds: number) {
      return new Promise(resolve => setTimeout(resolve, milliseconds));
     }




    console.log(`connected before ? ${this.childProcess.connected}`);


    this.childProcess.kill("SIGTERM");

    console.log(`connected after ? ${this.childProcess.connected}`);

    while(isExited === false) {
      console.log('wait for exit...');
      //await setTimeout(() =>{}, 1000);
      await sleep(100);
    }
    //let isKilled = 
    //while()
    //await setTimeout(() => { }, 1000);

  }
  
}

export class NodeManager {

  static s_instance = new NodeManager()

  private constructor() {

  }

  public static get() : NodeManager {
    return NodeManager.s_instance;
  }

  nodeStates: Array<NodeState> = [];

  public startNode(nodeID: number, force = false) : NodeState {

    const result = this.getNode(nodeID);

    result.start(force);
    return result;

  }

  public getNode(nodeID: number) : NodeState {

    if (nodeID == 0) {
      throw new Error('nodeIDs are index-1 based');
    }

    this.ensureNodeStates(nodeID);
    const nodeState = this.nodeStates[nodeID -1];
    console.assert(nodeState.nodeID == nodeID, 'Unexpected NodeID');
    return nodeState;
  }

  private ensureNodeStates(numOfStates: number) {

    if (this.nodeStates.length < numOfStates) {
    
      const nodeInfos = loadNodeInfosFromTestnetDirectory();

      while (this.nodeStates.length < numOfStates) {
        const publicKey = nodeInfos?.public_keys[this.nodeStates.length];
        this.nodeStates.push(new NodeState(this.nodeStates.length + 1, publicKey));
      }
    }
  }

  public initFromTestnetManifest() {
    const nodeInfos = loadNodeInfosFromTestnetDirectory();
    if (nodeInfos) {
      this.ensureNodeStates(nodeInfos.public_keys.length);
    }
  }

}


// async function testIt() {

//   const nodeState = NodeManager.get().startNode(2);
//   await nodeState.stop();
// }


// testIt();

