import {
    DbManager,
    convertEthAddressToPostgresBuffer,
    ethAmountToPostgresNumeric
} from "./db/database";

import {
    AvailableEvent_InsertParameters,
    OrderedWithdrawal,
    OrderedWithdrawal_InsertParameters,
} from "./db/schema";

import BigNumber from "bignumber.js";


interface BaseEvent {
    eventName: string;
    blockNumber: number;
    blockTimestamp: number;

    accept(visitor: BaseVisitor): Promise<void>;
}

interface BaseVisitor {
    visitAvailabilityEvents(event: AvailabilityEvent): Promise<void>;

    visitOrderedWithdrawalEvent(event: OrderedWithdrawalEvent): Promise<void>;

    visitClaimedOrderedWithdrawalEvent(event: ClaimedOrderedWithdrawalEvent): Promise<void>;

    visitStakeChangedEvents(event: StakeChangedEvents): Promise<void>;

    visitMovedStakeEvent(event: MovedStakeEvent): Promise<void>;
}

export class StakeChangedEvents implements BaseEvent {
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
        await visitor.visitStakeChangedEvents(this)
    }
}

export class MovedStakeEvent implements BaseEvent {
    public constructor(
        public eventName: string,
        public blockNumber: number,
        public blockTimestamp: number,
        public fromPoolAddress: string,
        public toPoolAddress: string,
        public stakerAddress: string,
        public epoch: number,
        public amount: string
    ) { }

    public async accept(visitor: BaseVisitor): Promise<void> {
        await visitor.visitMovedStakeEvent(this)
    }
}

export class OrderedWithdrawalEvent implements BaseEvent {
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

    public getUpdateObject(): Partial<OrderedWithdrawal> {
        return {
            staking_epoch: this.epoch,
            block_number: this.blockNumber,
            amount: this.amount
        }
    }
}

export class ClaimedOrderedWithdrawalEvent implements BaseEvent {
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
        await visitor.visitClaimedOrderedWithdrawalEvent(this);
    }

    public getUpdateObject(): Partial<OrderedWithdrawal> {
        return { claimed_on_block: this.blockNumber };
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

    public async visitAvailabilityEvents(event: AvailabilityEvent): Promise<void> {
        const insertData = event.getInsertObject();
        await dbManager.insertAvailabilityEvent(insertData);
    }

    public async visitOrderedWithdrawalEvent(event: OrderedWithdrawalEvent): Promise<void> {
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

        const previousAmount = new BigNumber(existingOrder.amount);
        const newAmount = previousAmount.plus(new BigNumber(event.amount));

        updateObject.amount = newAmount.toString();

        await dbManager.updateOrderWithdrawalEvent(
            { id: existingOrder.id },
            updateObject
        );
    }

    public async visitClaimedOrderedWithdrawalEvent(event: ClaimedOrderedWithdrawalEvent): Promise<void> {
        const existingOrder = await dbManager.getOrderWithdrawalEvent({
            from_pool_stakingAddress: convertEthAddressToPostgresBuffer(event.poolAddress),
            staker: convertEthAddressToPostgresBuffer(event.stakerAddress),
            claimed_on_block: null
        });

        if (existingOrder == null) {
            console.log(
                `Found unmatched ClaimedOrderedWithdrawalEvent at block
                ${event.blockNumber} from ${event.stakerAddress} for pool ${event.poolAddress}`
            );
            return;
        }

        let updateObject = event.getUpdateObject();

        await dbManager.updateOrderWithdrawalEvent(
            { id: existingOrder.id },
            updateObject
        );
    }

    public async visitStakeChangedEvents(event: StakeChangedEvents): Promise<void> {
        const record = await dbManager.getLastStakeHistoryRecord(event.poolAddress);

        if (record == null) {
            await dbManager.insertStakeHistoryRecord({
                from_block: event.blockNumber,
                to_block: event.blockNumber,
                stake_amount: ethAmountToPostgresNumeric(event.amount),
                node: convertEthAddressToPostgresBuffer(event.poolAddress)
            });

            return;
        }

        const currentStake = new BigNumber(record.stake_amount);
        const changeAmount = new BigNumber(event.amount);

        const newAmount = currentStake.plus(event.eventName == 'WithdrewStake' ? changeAmount.negated() : changeAmount)

        await dbManager.updateStakeHistory({
            from_block: record.from_block,
            to_block: record.to_block,
            node: record.node
        }, {
            to_block: event.blockNumber - 1,
        });

        await dbManager.insertStakeHistoryRecord({
            from_block: event.blockNumber,
            to_block: event.blockNumber,
            node: record.node,
            stake_amount: ethAmountToPostgresNumeric(newAmount.toString())
        });
    }

    public async visitMovedStakeEvent(event: MovedStakeEvent): Promise<void> {
    }
}

async function clientCode(components: BaseEvent[], visitor: BaseVisitor) {
    for (const component of components) {
        await component.accept(visitor);
    }
}

const components = [
    new AvailabilityEvent("Event3", 1, 1, "1", false),
    new AvailabilityEvent("Event4", 1, 1, "1", false),
];

let dbManager = new DbManager();

const visitor1 = new EventVisitor(dbManager);
clientCode(components, visitor1).then(() => {
    console.log('');
});
