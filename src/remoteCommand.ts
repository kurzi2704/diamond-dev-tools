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

/// be aware, it still doesn't print out stdout on the fly.
export async function cmdRemoteAsync(hostSSH: string, command: string) : Promise<string> {
  
  //console.log(command);
  //todo: proper escaping for the shell of command here.
  const remoteCommand = `ssh -t -o LogLevel=QUIET ${hostSSH} "${command}"`;
  //console.log(remoteCommand);
  console.log(`executing on ${hostSSH} : ${remoteCommand}`);

  let result = '';
  

  const solidityFile = "Some.sol";
  const promise1 = child.spawn('mythril', [solidityFile]);

  
  
  let promise = child.spawn('/usr/bin/ssh', ['-t',  '-o', 'LogLevel=QUIET', hostSSH, command ])
  //let promise = child.spawn(re5moteCommand)
    .on("message", (message, send_hanlde) => {
      if (message) {
        let m = message.toString();
        result += m;
        console.log(m);
      }
    })
    .on("close", (code, signal) => {
      console.log("Closed");
      console.log(code);
      // let s : NodeJS.Signals = signal;
      // console.log(signal);
    })
    .on("error", (error) => {

      console.log("error:");
      console.log(error);
      //throw error;
    })
    

    let data_reader = promise.stdout.addListener("data", (chunk) => {

      if (chunk instanceof Buffer) {

        // convert the chunk to a UTF-8 string.
        let text = chunk.toString("utf8");
        console.log(text);
      } else {
        console.log(chunk);
      }
    });

    // promise.stdout.addListener("readable", () => {

    //   console.log(chunk);
    // });
    let data = data_reader.read();
    while (data) {
      console.log(data);
    }


  console.log("ssh spawned, waiting...");

  await promise;

  // const txt = result.toString();
  // console.log(txt);
  return result;
  
}


export function cmd(command: string) : { success: boolean, output: string} {
  console.log(command);
  let result = Buffer.alloc(0);

  let success = true;
  try {
    result = child.execSync(command);
  } catch (e: any) {
    console.log('catched error in cmd:', e);
    success = false;
    result = e.stderr;
  }
  const txt = result.toString();
  console.log(txt);
  return { success, output: txt };
}

export async function cmdAsync(command: string) : Promise<string> {

  let result = "";
  await child.exec(command, (error, stdout) => {
    if (stdout) {
      result += stdout;
    }
    if (error) {
      result += error;
    }
  });

  return result;
}


