import { ConfigManager } from "../configManager";
import { executeOnRemotesFromCliArgs } from "./executeOnRemotes";

const config = ConfigManager.getConfig();

//todo find better command, this kind of hard kills it.
executeOnRemotesFromCliArgs(`rm -r ~/${config.installDir}/data/messages`);