import { BlockType } from "./abi/contracts/types";
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

    public toBeRemoved: string[] = [];
    public toBeUpdated: string[] = [];
    public toBeAdded: string[] = [];

    public constructor(
        public contractManager: ContractManager,
        public dbManager: DbManager
    ) {
        this.validators = new Map<string, Validator>();
    }

    public async initializeFromDb(): Promise<void> {
        const result = await this.dbManager.getValidators();

        for (const entry of result) {
            const validator = Validator.fromEntity(entry);

            this.validators!.set(validator.node, validator);
        }
    }

    public async updateValidators(blockNumber: BlockType = 'latest'): Promise<void> {
        const current = await this.contractManager.getValidators(blockNumber);
        const pending = await this.contractManager.getPendingValidators(blockNumber);
        const previous = await this.contractManager.getPreviousValidators(blockNumber);

        const currentValidatorsList = Array.from(this.validators.keys());

        this.toBeRemoved = currentValidatorsList.filter(
            (x) => !current.includes(x) && !pending.includes(x) && !previous.includes(x)
        );
    }

    public async updateDatabase(): Promise<void> {
    }
}
