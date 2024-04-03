import { Account } from "web3-core";
import { ConfigManager } from "../../configManager";
import { NodeManager } from "../../net/nodeManager";
import { sleep } from "../../utils/time";
import { Watchdog } from "../../watchdog";
import { ContractManager } from "../../contractManager";
import { stakeOnValidators } from "../../net/stakeOnValidators";
import { toNumber } from "../../utils/numberUtils";
import fs from "fs";

class RestakeObservation {


    public constructor(public epochNumber: number, public rewardBlockNumber: number, public countOfDelegators: number, public timeNeededForBlockCreation: number) {

    }

    public static getCsvHeader() {
        return "epochNumber,rewardBlockNumber,countOfDelegators,timeNeededForBlockCreation";
    }

    static writeCSVHeaderToFile(outputFile: string) {
        fs.writeFileSync(outputFile, RestakeObservation.getCsvHeader() + "\n");
    }

    public toCsvString() {
        return `${this.epochNumber},${this.rewardBlockNumber},${this.countOfDelegators},${this.timeNeededForBlockCreation}`;
    }

    public appendCSVToFile(outputFile: string) {
        fs.appendFileSync(outputFile, this.toCsvString() + "\n");
    }

}

class AutoRestakeTest {

    ///public totalDelegatorsCount = 0;

    public async runTest() {


        console.log("Booting testnetwork for automatic restaking test.");
        console.log("Tests and documents the implication of the automatic reward restaking feature https://github.com/DMDcoin/diamond-contracts-core/issues/43");


        // we need to create an output directory for this this.

        let now = new Date(Date.now());
        let globalOutputDir = "output";

        const testOutputDirName = `auto_restake_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}`;
        const testOutputPathRelative = `${globalOutputDir}/${testOutputDirName}`;


        if (!fs.existsSync(globalOutputDir)) {
            fs.mkdirSync(globalOutputDir);
        }

        if (!fs.existsSync(testOutputPathRelative)) {
            fs.mkdirSync(testOutputPathRelative);
        }

        let outputFile = `${testOutputPathRelative}/auto_restake.csv`;
        RestakeObservation.writeCSVHeaderToFile(outputFile);


        const nodeManager = NodeManager.get();
        const contractManager = ContractManager.get();
        let watchdog = new Watchdog(contractManager, nodeManager);

        console.log("booting network...");
        nodeManager.startRpcNode();
        nodeManager.startAllNodes();

        console.log("waiting...");
        let waitTime = 10;
        console.log(`waiting ${waitTime} seconds for boot`);
        await sleep(waitTime * 1000);

        let results: Array<RestakeObservation> = [];


        let validators = await contractManager.getValidators();
        if (validators.length != 1) {
            console.log("Expected 1 validator, got ", validators.length);
            throw new Error("Expected 1 validator, got " + validators.length);
        }

        watchdog.startWatching();

        let numOfNodes = nodeManager.nodeStates.length;
        let targetNumOfValidators = numOfNodes - 1;

        const web3 = ConfigManager.getWeb3();

        console.log("block at startup:", await web3.eth.getBlockNumber());

        // we stake on all nodes except the 1 MOC.
        stakeOnValidators(numOfNodes - 1);

        validators = await contractManager.getValidators();
        console.log("validators after staking: ", validators);

        let isInitialised = false;
        let isWorkingOnDelegateStaking = false;

        let minStake = await contractManager.getMinStake();

        let totalDelegatorsCount = 0;
        let numOfDelegatorsEachEpoch = 1000;

        let stakingContract = await contractManager.getStakingHbbft();

        console.log("getting pool addresses.: ", stakingContract.options.address);

        let poolAddresses: Array<string> = [];

        watchdog.onEpochSwitch = async (epoch: number, blockNumber: number) => {

            if (isWorkingOnDelegateStaking) {
                console.log("ERROR: already working on delegate staking, Network overload ? error ?");
                process.exit(1);
            }

            console.log("!!!!!!!!!!!epoch switch!!!!!!!!!!", epoch);
            validators = await contractManager.getValidators();
            console.log("validators after staking: ", validators);

            if (validators.length != targetNumOfValidators) {
                if (isInitialised) {
                    console.log("detected unexpected shrink of the validator set - aborting!", validators.length);
                    process.exit(1);
                }
                return;
            }

            isWorkingOnDelegateStaking = true;
            let numOfDelegatorStakesConfirmed = 0;
            let numOfDelegatorStakesSent = 0;

            if (!isInitialised) {
                console.log("initialised!");

                for (let validator of validators) {
                    poolAddresses.push(await contractManager.getAddressStakingByMining(validator));
                }

                isInitialised = true;
            }

            // track the performance values here.
            let blockForEpochSwitch = await web3.eth.getBlock(blockNumber);
            let blockBeforeEpochSwitch = await web3.eth.getBlock(blockNumber - 1);

            let timeConsumed = toNumber(blockForEpochSwitch.timestamp) - toNumber(blockBeforeEpochSwitch.timestamp);
            console.log("last epoch switch took: ", timeConsumed, " seconds");

            let obsersvation = new RestakeObservation(epoch, blockNumber, totalDelegatorsCount, timeConsumed);
            obsersvation.appendCSVToFile(outputFile);
            // block.timestamp;

            let nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount!);
            console.log("nonce: ", nonce);

            for (let i = 0; i < numOfDelegatorsEachEpoch; i++) {
                // we could just create an deterministic entropy here, so we would not need to store the accounts.
                // and still have the ability to recover the private key.
                // something like: "epoch_i";
                let account = web3.eth.accounts.create();

                let minStakeForDelegators = web3.utils.toBN(await stakingContract.methods.delegatorMinStake().call());
                let minStakeForDelegatorsAndFees = minStakeForDelegators.add(web3.utils.toBN(web3.utils.toWei("1", "ether")));

                console.log("funding account with nonce: ", nonce, "address:", account.address);
                web3.eth.sendTransaction({ from: web3.eth.defaultAccount!, to: account.address, value: minStakeForDelegatorsAndFees.toString(), gas: "21000", nonce: nonce })
                    .once("receipt", (receipt) => {
                        console.log("receipt: did receive funds for ", account.address, " tx: ", receipt.transactionHash);
                    })
                    .once("confirmation", async (payload) => {

                        let targetAddress = poolAddresses[i % poolAddresses.length];
                        let txValue = minStakeForDelegators.toString();
                        let balance = await web3.eth.getBalance(account.address);
                        console.log("confirmed funds for ", account.address, "starting delegate staking on ", targetAddress, "balance:", balance, "value: ", txValue);
                        // round robin - so every pool gets funded the same ways, ok almost...

                        // Get the transaction configuration
                        const transactionConfig = stakingContract.methods.stake(targetAddress).encodeABI();

                        // Sign the transaction
                        const signedTransaction = await web3.eth.accounts.signTransaction({
                            from: account.address,
                            to: stakingContract.options.address,
                            data: transactionConfig,
                            value: txValue,
                            gas: "1000000",
                            nonce: 0 // nonce should be 0, because we are using the wallet nonce.
                        }, account.privateKey, (error, signedTransaction) => {
                            if (error) {
                                console.log("error on signing transaction: ", error);
                            }
                            // if (signedTransaction) {
                            //     console.log("signed transaction: ", signedTransaction);
                            // }
                        });

                        // Send the signed transaction
                        web3.eth.sendSignedTransaction(signedTransaction.rawTransaction!)
                            .once("receipt", (receipt) => {
                                console.log("receipt of staking ", minStake.toString(), " on ", targetAddress, " tx: ", receipt.transactionHash);
                            })
                            .once('confirmation', (confirmationNumber, receipt) => {
                                console.log("staked ", minStake.toString(), " on ", targetAddress, " tx: ", receipt.transactionHash);
                                numOfDelegatorStakesConfirmed++;
                                totalDelegatorsCount++;
                            })
                            .once('error', (error) => {
                                console.log("error on staking ", minStake.toString(), " on ", targetAddress, " error: ", error);
                            })
                            .once('transactionHash', (hash) => {
                                console.log("staking ", account.address, " on ", targetAddress, " transactionHash: ", hash);
                            });

                        numOfDelegatorStakesSent++;
                    })

                nonce++;
            }

            while (numOfDelegatorStakesConfirmed != numOfDelegatorsEachEpoch) {
                await sleep(10000);
                console.log("awaiting stakes. sent: ", numOfDelegatorStakesSent, " confirmed: ", numOfDelegatorStakesConfirmed);
            }
            console.log("total staked now:", totalDelegatorsCount);
            isWorkingOnDelegateStaking = false;
        };

        let targetMaxDelegators = 100000;
        while (totalDelegatorsCount < targetMaxDelegators) {
            await sleep(1000);
        }

        console.log("Test Finished, reached target delegators count of ", targetMaxDelegators);

    }
}


let test = new AutoRestakeTest();
test.runTest().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});