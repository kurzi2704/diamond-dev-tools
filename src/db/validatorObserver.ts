import { ContractManager } from "../contractManager";

import { DbManager } from "./database";

import {
    PendingValidatorStateEvent,
    PendingValidatorStateEvent_InsertParameters
} from "./schema";

import { addressToBuffer, bufferToAddress } from "../utils/ether";

import { Watchdog } from '../watchdog';


export enum ValidatorState {
    Current = 'current',
    Pending = 'pending'
};


export class Validator {
    public constructor(
        public state: ValidatorState,
        public node: string,
        public enterBlockNumber: number,
        public keyGenRound: number,
        public exitBlockNumber?: number | null,
    ) { }

    public static fromEntity(record: PendingValidatorStateEvent): Validator {
        return new Validator(
            record.state as ValidatorState,
            bufferToAddress(record.node),
            record.on_enter_block_number,
            record.keygen_round,
            record.on_exit_block_number,
        );
    }

    public toEntity(): PendingValidatorStateEvent_InsertParameters {
        return {
            state: this.state.valueOf(),
            on_enter_block_number: this.enterBlockNumber,
            on_exit_block_number: this.exitBlockNumber,
            node: addressToBuffer(this.node),
            keygen_round: this.keyGenRound
        };
    }
}

export class ValidatorObserver {
    public currentValidators: Array<string>;
    public pendingValidators: Array<string>;
    public currentKeyGenRound: number = 0;

    public constructor(
        public contractManager: ContractManager,
        public dbManager: DbManager
    ) {
        this.currentValidators = new Array<string>();
        this.pendingValidators = new Array<string>();
    }

    public static async build(
        contractManager: ContractManager,
        dbManager: DbManager
    ): Promise<ValidatorObserver> {
        let observer = new ValidatorObserver(contractManager, dbManager);

        await observer.initialize();

        return observer;
    }

    public async initialize(): Promise<void> {
        const result = await this.dbManager.getValidators();

        this.currentValidators = new Array<string>();
        this.pendingValidators = new Array<string>();

        for (const entity of result) {
            const validator = Validator.fromEntity(entity);

            if (validator.state == ValidatorState.Current) {
                this.currentValidators.push(validator.node);
            }

            if (validator.state == ValidatorState.Pending) {
                this.pendingValidators.push(validator.node);
            }
        }
    }

    public async updateValidators(blockNumber: number): Promise<void> {
        const currentValidators = await this.fetchCurrentValidators(blockNumber);
        const pendingValidators = await this.fetchPendingValidators(blockNumber);

        const keyGenRound = await this.contractManager.getKeyGenRound(blockNumber);
        
        if (!Watchdog.deepEquals(this.pendingValidators, pendingValidators) || this.currentKeyGenRound != keyGenRound) {
            const { added, removed } = Watchdog.createDiffgram(this.pendingValidators, pendingValidators);

            console.log(`Pending validators switch, added: ${added}  removed: ${removed}`);

            this.pendingValidators = pendingValidators;
            this.currentKeyGenRound = keyGenRound;


            await this.processRemovedValidators(removed, blockNumber, ValidatorState.Pending);
            await this.processAddedValidators(added, blockNumber, ValidatorState.Pending, keyGenRound);
        }

        if (!Watchdog.deepEquals(this.currentValidators, currentValidators) || this.currentKeyGenRound != keyGenRound) {
            const { added, removed } = Watchdog.createDiffgram(this.currentValidators, currentValidators);

            console.log(`Current validators switch, added: ${added}  removed: ${removed}`);

            this.currentValidators = currentValidators;

            await this.processRemovedValidators(removed, blockNumber, ValidatorState.Current);
            await this.processAddedValidators(added, blockNumber, ValidatorState.Current, keyGenRound);
        }
    }

    private async processAddedValidators(addedValidators: string[], blockNumber: number, state: ValidatorState, keyGenRound: number): Promise<void> {
        for (const added of addedValidators) {
            const validator = new Validator(
                state,
                added,
                blockNumber,
                keyGenRound,
                null
            );

            await this.dbManager.insertValidator(validator.toEntity());
        }
    }

    private async processRemovedValidators(removedValidators: string[], blockNumber: number, state: ValidatorState): Promise<void> {
        const keygenRound = await this.contractManager.getKeyGenRound(blockNumber);

        for (const removed of removedValidators) {
            const result = await this.dbManager.updateOrIgnoreValidator(
                removed,
                state.valueOf(),
                blockNumber,
                keygenRound
            );

            if (!result) {
                console.log(`Existing record of ${state.valueOf()} validator ${removed} not found!`);
            }
        }
    }

    private normalize(items: string[]): string[] {
        return items.map((x) => x.toLowerCase());
    }

    private async fetchCurrentValidators(blockNumber: number): Promise<string[]> {
        const validators = await this.contractManager.getValidators(blockNumber);

        return this.normalize(validators);
    }

    private async fetchPendingValidators(blockNumber: number): Promise<string[]> {
        const validators = await this.contractManager.getPendingValidators(blockNumber);

        return this.normalize(validators);
    }
}
