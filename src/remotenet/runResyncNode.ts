import { getNodesFromCliArgs } from "./remotenetArgs";




async function  resync() {

    (await getNodesFromCliArgs()).forEach(async (node) => {
        await node.stopRemoteNode();
        await node.clearDBRemote();
        await node.startRemote();
    });

}


resync();