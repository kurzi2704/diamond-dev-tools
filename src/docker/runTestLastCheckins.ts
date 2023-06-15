import { getLatestDiamondNodeCommits } from "../git/git";


async function run() {
    let latest_commits =  getLatestDiamondNodeCommits(15);
    console.log(latest_commits);
}

run();