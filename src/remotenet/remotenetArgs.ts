import { parse } from "ts-command-line-args";
import { NodeManager, NodeState } from "../regression/nodeManager";
import * as child from 'child_process';
import { ContractManager } from "../contractManager";

export interface IRemotnetArgs {
  onlyunavailable: boolean;
  all: boolean;
  numberOfNodes?: number;
  sshnode?: string;
  miningAddress?: string;
  help?: boolean;
}

export function parseRemotenetArgs() : IRemotnetArgs {

  const args = parse<IRemotnetArgs>({
    all: { type: Boolean, alias: 'a'},
    onlyunavailable: { type: Boolean, alias: 'u'},
    numberOfNodes: { type: Number, alias: 'n', optional: true },
    sshnode: {type: String, optional: true},
    miningAddress: {type: String, optional: true, alias: 'm'},
    help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
    },
    {
      helpArg: 'help',
      headerContentSections: [{ header: 'Remote Net Arguments', content: 'Specify on what nodes the commands should be executed' }],
      footerContentSections: [{ header: '', content: `` }],
  });

  console.log('CLI args: ', args);

    if (!args.all && !args.onlyunavailable && !args.numberOfNodes && !args.sshnode && !args.miningAddress) {
      const msg = `no target specified. use --help for infos.`;
      console.log(`no target specified. use --help for infos.`);
      throw Error(msg);
    }

  return args;
}

export async function getNodesFromCliArgs() {


  let result: Array<NodeState> = [];

  const args = parseRemotenetArgs();
  const pwdResult = child.execSync("pwd");
  console.log('operating in: ' + pwdResult.toString());
  const nodeManager = NodeManager.get();
  let numOfNodes = args.numberOfNodes ?? nodeManager.nodeStates.length;

  for(let i = 1; i <=  numOfNodes; i++) {
    
    const nodeName = `hbbft${i}`;

    const node = nodeManager.getNode(i);
    if (args.onlyunavailable)
    {
      const contractManager = await ContractManager.get();
      
      if (node.address) {
        const executeOnThisRemote = !await contractManager.isValidatorAvailable(node.address);
        if (!executeOnThisRemote) {
          console.log('Skipping Node that is available:', node.address);
        } else {
          result.push(node);
        }

      }
    }
    else if (args.miningAddress) {
      const node = nodeManager.getNode(i);
      
      if (node.address && node.address.toLowerCase() === args.miningAddress.toLowerCase()) {
        console.log(`Node for mining address ${args.miningAddress} : ${nodeName}`);
        result.push(node);
      }
    } else if (args.sshnode) {
      if (args.sshnode == nodeName) {
        result.push(node);
      }
    } else if (args.all) {
      result.push(node);
    } else {
      console.log('not implemented for args: ', args);
      throw Error('not implemented for args');
    }
  }

  if (result.length == 0) {
    console.log(`No nodes found for args:`, args);
  }

  return result;
}