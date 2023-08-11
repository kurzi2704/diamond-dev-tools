import { WhereCondition } from "@databases/pg-typed";
import { DbManager, convertEthAddressToPostgresBuffer } from "./db/database";
import {
    AvailableEvent_InsertParameters,
    OrderedWithdrawal,
    OrderedWithdrawal_InsertParameters
} from "./db/schema";
import BigNumber from "bignumber.js";


interface BaseEvent {
    eventName: string;
    blockNumber: number;
    blockTimestamp: number;

    accept(visitor: BaseVisitor): Promise<void>;
}

interface BaseVisitor {
    visitStakeChangedEvents(element: StakeChangedEvent): Promise<void>;

    visitAvailabilityEvents(element: AvailabilityEvent): Promise<void>;

    visitOrderedWithdrawalEvent(element: OrderWithdrawalEvent): Promise<void>;
}

export class StakeChangedEvent implements BaseEvent {
    public constructor(
        public eventName: string,
        public blockNumber: number,
        public blockTimestamp: number,
        public poolAddress: string,
        public stakerAddress: string,
        public epoch: number
    ) { }

    public async accept(visitor: BaseVisitor): Promise<void> {
        await visitor.visitStakeChangedEvents(this)
    }
}

export class OrderWithdrawalEvent implements BaseEvent {
    public constructor(
        public eventName: string,
        public blockNumber: number,
        public blockTimestamp: number,
        public poolAddress: string,
        public stakerAddress: string,
        public epoch: number,
        public amount: string
    ) { }

    public async accept(visitor: BaseVisitor): Promise<void> {
        await visitor.visitOrderedWithdrawalEvent(this);
    }

    public getInsertObject(): OrderedWithdrawal_InsertParameters {
        return {
            amount: this.amount,
            block_number: this.blockNumber,
            from_pool_stakingAddress: convertEthAddressToPostgresBuffer(this.poolAddress),
            staker: convertEthAddressToPostgresBuffer(this.stakerAddress),
            staking_epoch: this.epoch
        };
    }

    public isClaimed() {
        return this.eventName == 'ClaimedOrderedWithdrawal';
    }

    public getUpdateObject(): Partial<OrderedWithdrawal> {
        if (this.isClaimed()) {
            return { claimed_on_block: this.blockNumber };
        } else {
            return {
                staking_epoch: this.epoch,
                block_number: this.blockNumber,
                amount: this.amount
            }
        }
    }
}

export class AvailabilityEvent implements BaseEvent {
    public constructor(
        public eventName: string,
        public blockNumber: number,
        public blockTimestamp: number,
        public poolAddress: string,
        public available: boolean
    ) { }

    public async accept(visitor: BaseVisitor): Promise<void> {
        await visitor.visitAvailabilityEvents(this)
    }

    public getInsertObject(): AvailableEvent_InsertParameters {
        return {
            node: convertEthAddressToPostgresBuffer(this.poolAddress),
            block: this.blockNumber,
            became_available: this.available
        };
    }
}

export class EventVisitor implements BaseVisitor {
    public constructor(
        public dbManager: DbManager
    ) { }

    public async visitStakeChangedEvents(event: StakeChangedEvent): Promise<void> {
    }

    public async visitAvailabilityEvents(event: AvailabilityEvent): Promise<void> {
        const insertData = event.getInsertObject();
        await dbManager.insertAvailabilityEvent(insertData);
    }

    public async visitOrderedWithdrawalEvent(event: OrderWithdrawalEvent): Promise<void> {
        const existingOrder = await dbManager.getOrderWithdrawalEvent({
            from_pool_stakingAddress: convertEthAddressToPostgresBuffer(event.poolAddress),
            staker: convertEthAddressToPostgresBuffer(event.stakerAddress),
            claimed_on_block: null
        });

        if (existingOrder == null) {
            await dbManager.insertOrderWithdrawalEvent(event.getInsertObject());

            return;
        }

        let updateObject = event.getUpdateObject();

        if (!event.isClaimed()) {
            const previousAmount = new BigNumber(existingOrder.amount);
            const newAmount = previousAmount.plus(new BigNumber(event.amount));

            updateObject.amount = newAmount.toString();
        }

        await dbManager.updateOrderWithdrawalEvent(
            { id: existingOrder.id },
            updateObject
        );
    }
}

async function clientCode(components: BaseEvent[], visitor: BaseVisitor) {
    for (const component of components) {
        await component.accept(visitor);
    }
}

const components = [
    new StakeChangedEvent("Event1", 1, 1, "1", "1", 1),
    new StakeChangedEvent("Event2", 1, 1, "1", "1", 1),
    new AvailabilityEvent("Event3", 1, 1, "1", false),
    new AvailabilityEvent("Event4", 1, 1, "1", false),
];

let dbManager = new DbManager();

const visitor1 = new EventVisitor(dbManager);
clientCode(components, visitor1).then(() => {
    console.log('');
});
