import { executeOnAllRemotes } from "./executeOnAllRemotes";



import { parse } from 'ts-command-line-args';

interface IStopRemotnetArgs {
  onlyunavailable: boolean;
}



const args = parse<IStopRemotnetArgs>({
  onlyunavailable: { type: Boolean, alias: 'u'},
  });


//todo find better command, this kind of hard kills it.
executeOnAllRemotes("screen -X -S node_test quit", undefined, args.onlyunavailable);