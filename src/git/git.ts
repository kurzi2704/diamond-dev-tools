import { cmd } from "../remoteCommand";



export function getGitCommitHash() {
    return process.env.GIT_COMMIT_HASH;
}


/// Get the latest n commits from the OpenEthereum repository from the current branch of the local open ethereum repository.
export function getLatestDiamondNodeCommits(n: number = 1) : string[] {

    // todo: error handling
    let cd_result = cmd("cd ../diamond-node");

    
    let result: string[] = [];
    for (let i = 0; i <= n - 1; i++)
    {    
        let head = cmd(`git rev-parse HEAD~${i}`);
        if (head.success) {
            result.push(head.output.replace("\n", ""));
        } else {
            console.log("Error getting git commit hash", head);
        }
    }

    return result;
    //git rev-parse HEAD~5
}
