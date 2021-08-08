import * as child from 'child_process';

//executes a command on a remote Node.
export function cmdR(hostSSH: string, command: string) : string {
  
  console.log(command);
  //todo: proper escaping for the shell of command here.
  const remoteCommand = `ssh -t -o LogLevel=QUIET ${hostSSH} '${command}'`;
  console.log(`executing on ${hostSSH}: ${remoteCommand}`);
  const result = child.execSync(remoteCommand);
  const txt = result.toString();
  console.log(txt);
  return txt;
}
