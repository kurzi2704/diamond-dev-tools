import child_process from 'child_process';
import { startNode } from './startNode';


export class NodeState {

  public constructor(public nodeID: number) {

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

    console.log(`connected before ? ${this.childProcess.connected}`);

    this.childProcess.kill("SIGTERM");

    console.log(`connected after ? ${this.childProcess.connected}`);

    //let isKilled = 
    //while()
    //await setTimeout(() => { }, 1000);

  }
  
}

export class NodeStateManager {

  static s_instance = new NodeStateManager()

  private constructor() {

  }

  public static get() : NodeStateManager {
    return NodeStateManager.s_instance;
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
    while (this.nodeStates.length < numOfStates) {
      this.nodeStates.push(new NodeState(this.nodeStates.length + 1));
    }
  }

}


async function testIt() {

  const nodeState = NodeStateManager.get().startNode(2);
  await nodeState.stop();
}


testIt();

