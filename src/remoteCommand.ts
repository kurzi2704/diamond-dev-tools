import * as child from 'child_process';

//executes a command on a remote Node.
export function cmdR(hostSSH: string, command: string, logOutput: boolean = true) : string {
  
  //console.log(command);
  //todo: proper escaping for the shell of command here.
  const remoteCommand = `ssh -t -o LogLevel=QUIET ${hostSSH} "${command}"`;
  //console.log(remoteCommand);
  console.log(`executing on ${hostSSH} : ${remoteCommand}`);
  const result = child.execSync(remoteCommand, {  });
  const txt = result.toString();
  if (logOutput) {
    console.log(txt);
  }
  
  return txt;
}

export async function cmdRemoteAsync(hostSSH: string, command: string) : Promise<string> {
  
  //console.log(command);
  //todo: proper escaping for the shell of command here.
  const remoteCommand = `ssh -t -o LogLevel=QUIET ${hostSSH} "${command}"`;
  //console.log(remoteCommand);
  console.log(`executing on ${hostSSH} : ${remoteCommand}`);

  let result = '';

  await child.exec(remoteCommand, (error, stdout, stderr) => {
    result += stdout;
    result += stderr;
  });

  const txt = result.toString();
  console.log(txt);
  return txt;
  
}


export function cmd(command: string) : string {
  console.log(command);
  const result = child.execSync(command);
  const txt = result.toString();
  console.log(txt);
  return txt;
}

