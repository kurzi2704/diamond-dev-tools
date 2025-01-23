import { ContractManager } from "../contractManager";
import { DbManager } from "./database";




export class BonusScoreProcessor {

    

    currentBonusScores: { [nodeId: string]: number; } = {};


    public constructor(
        public contractManager: ContractManager,
        public dbManager: DbManager
    ) {
        
    }

    public async init(blockNumber: number) {

        const allPools = await this.contractManager.getAllPools(blockNumber);


        const bonusScoreSystem = this.contractManager.getBonusScoreSystem();
        for (const pool of allPools) {
            const mining = await this.contractManager.getAddressMiningByStaking(pool, blockNumber);

            const bonusScore = await this.contractManager.getBonusScore(mining, blockNumber);
            this.currentBonusScores[pool.toLowerCase()] = bonusScore;
        }
        //this.contractManager.
    }

    public async registerNewNode(pool: string, mining: string, blockNumber: number) {
    

        const currentScore = await this.contractManager.getBonusScore(mining, blockNumber);
        await this.dbManager.writeInitialBonusScore(pool, blockNumber, currentScore);

        this.currentBonusScores[pool.toLowerCase()] = currentScore;
        
    }


    public async processBonusScore(blockNumber: number) {
        
        const allPools = await this.contractManager.getAllPools(blockNumber);

        for (const pool of allPools) {
            const mining = await this.contractManager.getAddressMiningByStaking(pool, blockNumber);
            const currentScore = await this.contractManager.getBonusScore(mining, blockNumber);

            const existingScore = this.currentBonusScores[pool.toLowerCase()];

            if (currentScore !== existingScore) {

                console.log("updating bonus score from ", existingScore, " to ", currentScore, " for pool ", pool);
                await this.dbManager.updateBonusScore(pool, currentScore, blockNumber);
                this.currentBonusScores[pool.toLowerCase()] = currentScore;
            }
        }
    }

}