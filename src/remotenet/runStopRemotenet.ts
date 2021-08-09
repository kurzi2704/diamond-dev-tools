import { executeOnAllRemotes } from "./executeOnAllRemotes";


//todo find better command, this kind of hard kills it.
executeOnAllRemotes("screen -X -S node_test quit");