import child_process from 'child_process';
import * as net from 'net';


export function startNode(nodeId: number) : child_process.ChildProcess {

  const cwd = process.cwd();

  const execOption : child_process.ProcessEnvOptions = {
    cwd: `${cwd}/testnet/nodes/node${nodeId}`
  }

  //nodes/node$1
  const cmd = '../../../../openethereum/target/release/openethereum --config node.toml';

  const proc = child_process.exec(cmd, execOption, (error: child_process.ExecException | null, stdout: string, stderr: string) => {
    console.log(
    `result from Node ${nodeId}: \n
      cmd:     ${error?.cmd} \n
      code:    ${error?.code} \n
      killed:  ${error?.killed} \n
      message: ${error?.message} \n
      name:    ${error?.name} \n
      stdOut: ${stdout} \n
      stdErr: ${stderr}
    `);
  });

  proc.addListener('message',(message: any, sendHandle: net.Socket | net.Server) => {
    console.log(`n: ${nodeId} message: ${message}`);
  })

  proc.stdout?.addListener('data', (chunk: any) => {
    console.log(`n: ${nodeId} data: ${chunk}`);
  })

  proc.on("message", (message: any) => {
    console.log(`m:  ${nodeId} message: ${message} `);
  });

  console.log(`node started!`);

  return proc;
}