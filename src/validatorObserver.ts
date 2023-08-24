import _ from 'underscore';

import { ContractManager } from "./contractManager";

import {
    DbManager,
    convertBufferToEthAddress,
    convertEthAddressToPostgresBuffer
} from "./db/database";

import {
    PendingValidatorStateEvent,
    PendingValidatorStateEvent_InsertParameters
} from "./db/schema";


export enum ValidatorState {
    Current = 'current',
    Pending = 'pending',
    Previous = 'previous'
};


export class Validator {
    public constructor(
        public state: ValidatorState,
        public node: string,
        public enterBlockNumber: number,
        public exitBlockNumber?: number | null
    ) { }

    public static fromEntity(record: PendingValidatorStateEvent): Validator {
        return new Validator(
            record.state as ValidatorState,
            convertBufferToEthAddress(record.node),
            record.on_enter_block_number,
            record.on_exit_block_number,
        );
    }

    public toEntity(): PendingValidatorStateEvent_InsertParameters {
        return {
            state: this.state.valueOf(),
            on_enter_block_number: this.enterBlockNumber,
            on_exit_block_number: this.exitBlockNumber,
            node: convertEthAddressToPostgresBuffer(this.node)
        };
    }
}

export class ValidatorObserver {
    public validators: Map<string, Validator>;

    public constructor(
        public contractManager: ContractManager,
        public dbManager: DbManager
    ) {
        this.validators = new Map<string, Validator>();
    }

    public static async buildFromDb(
        contractManager: ContractManager,
        dbManager: DbManager
    ): Promise<ValidatorObserver> {
        let observer = new ValidatorObserver(contractManager, dbManager);

        await observer.initializeFromDb();

        return observer;
    }

    public async initializeFromDb(): Promise<void> {
        const result = await this.dbManager.getValidators();

        this.validators = new Map<string, Validator>();

        for (const entry of result) {
            const validator = Validator.fromEntity(entry);

            this.validators.set(validator.node, validator);
        }
    }

    public async updateValidators(blockNumber: number): Promise<void> {
        const currentValidators = await this.getCurrentValidators(blockNumber);
        const pendingValidators = await this.getPendingValidators(blockNumber);
        const previousValidators = await this.getPreviousValidators(blockNumber);

        const validatorPresent = (validator: string) =>
            currentValidators.includes(validator)
            || pendingValidators.includes(validator)
            || previousValidators.includes(validator);

        const stateToValidators = _.zip(
            [ValidatorState.Current, ValidatorState.Pending, ValidatorState.Previous],
            [currentValidators, pendingValidators, previousValidators]
        );

        let dbUpdateList = new Array<Validator>();
        let dbInsertList = new Array<Validator>();

        for (let [state, stateValidators] of stateToValidators) {
            const { added, updated } = this.processValidators(state, blockNumber, stateValidators);

            dbInsertList.concat(added);
            dbUpdateList.concat(updated);
        }

        for (let [address, validator] of this.validators) {
            if (validatorPresent(address)) {
                continue;
            }

            dbUpdateList.push(new Validator(
                validator.state,
                validator.node,
                validator.enterBlockNumber,
                blockNumber
            ));

            this.validators.delete(address);
        }

        await this.insertRecords(dbInsertList);
        await this.updateRecords(dbUpdateList);
    }

    private processValidators(
        state: ValidatorState,
        blockNumber: number,
        addresses: string[]
    ): { added: Validator[], updated: Validator[] } {
        let added = new Array<Validator>();
        let updated = new Array<Validator>();

        for (let address of addresses) {
            const entry = this.validators.get(address);

            if (entry) {
                if (entry.state == state) {
                    continue;
                }

                entry.exitBlockNumber = blockNumber;

                updated.push(entry);
                added.push(new Validator(
                    state,
                    address,
                    blockNumber,
                    null
                ));
            } else {
                const addedValidator = new Validator(
                    state,
                    address,
                    blockNumber,
                    null
                );

                added.push(addedValidator);
                this.validators.set(address, addedValidator);
            }
        }

        return { added, updated };
    }

    private async updateRecords(records: Array<Validator>): Promise<void> {
        if (records.length == 0) {
            return;
        }

        console.log('update: ', records);

        for (let record of records) {
            this.dbManager.updateValidator({
                node: convertEthAddressToPostgresBuffer(record.node),
                state: record.state.valueOf(),
                on_enter_block_number: record.enterBlockNumber
            }, {
                on_exit_block_number: record.exitBlockNumber
            });
        }
    }

    private async insertRecords(records: Array<Validator>): Promise<void> {
        if (records.length == 0) {
            return;
        }

        console.log('insert: ', records);

        for (let record of records) {
            this.dbManager.insertValidator(record.toEntity());
        }
    }

    private normalize(items: string[]): string[] {
        return items.map((x) => x.toLowerCase());
    }

    private async getCurrentValidators(blockNumber: number): Promise<string[]> {
        const validators = await this.contractManager.getValidators(blockNumber);

        return this.normalize(validators);
    }

    private async getPendingValidators
    (blockNumber: number): Promise<string[]> {
        const validators = await this.contractManager.getPendingValidators(blockNumber);

        return this.normalize(validators);
    }

    private async getPreviousValidators(blockNumber: number): Promise<string[]> {
        const validators = await this.contractManager.getPreviousValidators(blockNumber);

        return this.normalize(validators);
    }
}
