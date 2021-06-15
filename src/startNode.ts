import child_process from 'child_process';
import path from 'path';


export function startNode(nodeId: number, extraFlags: string = '') : child_process.ChildProcess {

  const cwd = process.cwd();

  const execOption : child_process.ProcessEnvOptions = {
    cwd: `${cwd}/testnet/nodes/node${nodeId}`
  }

  console.log('cwd:', cwd);

  const openethereumsubdirectory = '../openethereum/target/release/openethereum';

  const resolvedPath = path.resolve(cwd, openethereumsubdirectory);
  console.log('resolvedPath = ', resolvedPath);

  //child_process.spawn()
  const proc = child_process.execFile(resolvedPath,['--config=node.toml', extraFlags], execOption, (error: child_process.ExecException | null, stdout: string, stderr: string) => {
    console.log(
    `result from Node ${nodeId}: \n
      cmd:     ${error?.cmd} \n
      code:    ${error?.code} \n
      killed:  ${error?.killed} \n
      message: ${error?.message} \n
      name:    ${error?.name} \n
    `);
  });

  // proc.addListener('message',(message: any, sendHandle: net.Socket | net.Server) => {
  //   console.log(`n: ${nodeId} message: ${message}`);
  // })

  // proc.stdout?.addListener('data', (chunk: any) => {
  //   console.log(`n: ${nodeId} data: ${chunk}`);
  // })

  // proc.on("message", (message: any) => {
  //   console.log(`m:  ${nodeId} message: ${message} `);
  // });

  console.log(`node ${nodeId} started!`);
  

  return proc;
}

export function startRpcNode(extraFlags: string = '') : child_process.ChildProcess {

  const cwd = process.cwd();

  const execOption : child_process.ProcessEnvOptions = {
    cwd: `${cwd}/testnet/nodes/rpc_node`
  }

  console.log('cwd:', cwd);

  const openethereumsubdirectory = '../openethereum/target/release/openethereum';

  const resolvedPath = path.resolve(cwd, openethereumsubdirectory);
  console.log('resolvedPath = ', resolvedPath);

  //child_process.spawn()
  const proc = child_process.execFile(resolvedPath,['--config=node.toml', extraFlags], execOption, (error: child_process.ExecException | null, stdout: string, stderr: string) => {
    console.log(
    `result from RPC Node: \n
      cmd:     ${error?.cmd} \n
      code:    ${error?.code} \n
      killed:  ${error?.killed} \n
      message: ${error?.message} \n
      name:    ${error?.name} \n
      stdOut: ${stdout} \n
      stdErr: ${stderr}
    `);
  });

  console.log(`rpc node started!`);


  return proc;
}