import {
    DbManager,
    convertEthAddressToPostgresBuffer,
    ethAmountToPostgresNumeric
} from "./db/database";

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

    visitStakeChangedEvent(event: StakeChangedEvent): Promise<void>;

    visitMovedStakeEvent(event: MovedStakeEvent): Promise<void>;

    visitGatherAbandonedStakesEvent(event: GatherAbandonedStakesEvent): Promise<void>;
}

export class StakeChangedEvent implements BaseEvent {
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
        await visitor.visitStakeChangedEvent(this)
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
}

export class GatherAbandonedStakesEvent implements BaseEvent {
    public constructor(
        public eventName: string,
        public blockNumber: number,
        public blockTimestamp: number,
        public caller: string,
        public poolAddress: string,
        public amount: string
    ) {}

    public async accept(visitor: BaseVisitor): Promise<void> {
        await visitor.visitGatherAbandonedStakesEvent(this);
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
}

/**
 * @TODO extract same ports to separate method from visit functions
 */
export class EventVisitor implements BaseVisitor {
    public constructor(
        public dbManager: DbManager
    ) { }

    public async visitAvailabilityEvents(event: AvailabilityEvent): Promise<void> {
        await this.dbManager.insertAvailabilityEvent({
            became_available: event.available,
            block: event.blockNumber,
            node: convertEthAddressToPostgresBuffer(event.poolAddress)
        });
    }

    public async visitOrderedWithdrawalEvent(event: OrderedWithdrawalEvent): Promise<void> {
        const existingOrder = await this.dbManager.getOrderWithdrawalEvent({
            from_pool_stakingAddress: convertEthAddressToPostgresBuffer(event.poolAddress),
            staker: convertEthAddressToPostgresBuffer(event.stakerAddress),
            claimed_on_block: null
        });

        const eventAmount = BigNumber(ethAmountToPostgresNumeric(event.amount));

        if (existingOrder == null) {
            await this.dbManager.insertOrderWithdrawalEvent({
                block_number: event.blockNumber,
                from_pool_stakingAddress: convertEthAddressToPostgresBuffer(event.poolAddress),
                staker: convertEthAddressToPostgresBuffer(event.stakerAddress),
                staking_epoch: event.epoch,
                amount: eventAmount.toString()
            });

            return;
        }

        const previousAmount = new BigNumber(existingOrder.amount);
        const newAmount = previousAmount.plus(eventAmount);

        await this.dbManager.updateOrderWithdrawalEvent(
            { id: existingOrder.id },
            {
                staking_epoch: event.epoch,
                block_number: event.blockNumber,
                amount: newAmount.toString()
            }
        );
    }

    public async visitClaimedOrderedWithdrawalEvent(event: ClaimedOrderedWithdrawalEvent): Promise<void> {
        const existingOrder = await this.dbManager.getOrderWithdrawalEvent({
            from_pool_stakingAddress: convertEthAddressToPostgresBuffer(event.poolAddress),
            staker: convertEthAddressToPostgresBuffer(event.stakerAddress),
            claimed_on_block: null
        });

        const stakeRecord = await this.dbManager.getLastStakeHistoryRecord(event.poolAddress);

        if (existingOrder == null || stakeRecord == null) {
            console.log(
                `Found unmatched ClaimedOrderedWithdrawalEvent at block
                ${event.blockNumber} from ${event.stakerAddress} for pool ${event.poolAddress}`
            );

            return;
        }

        await this.dbManager.updateOrderWithdrawalEvent(
            { id: existingOrder.id },
            { claimed_on_block: event.blockNumber }
        );

        const currentStake = BigNumber(stakeRecord.stake_amount);
        const changeAmount = BigNumber(ethAmountToPostgresNumeric(event.amount));
        const newAmount = currentStake.minus(changeAmount);

        await this.dbManager.updateStakeHistory({
            from_block: stakeRecord.from_block,
            to_block: stakeRecord.to_block,
            node: stakeRecord.node
        }, {
            to_block: event.blockNumber - 1,
        });

        await this.dbManager.insertStakeHistoryRecord({
            from_block: event.blockNumber,
            to_block: event.blockNumber,
            node: stakeRecord.node,
            stake_amount: newAmount.toString()
        });
    }

    public async visitStakeChangedEvent(event: StakeChangedEvent): Promise<void> {
        const record = await this.dbManager.getLastStakeHistoryRecord(event.poolAddress);

        if (record == null) {
            await this.dbManager.insertStakeHistoryRecord({
                from_block: event.blockNumber,
                to_block: event.blockNumber,
                stake_amount: ethAmountToPostgresNumeric(event.amount),
                node: convertEthAddressToPostgresBuffer(event.poolAddress)
            });

            return;
        }

        const currentStake = BigNumber(record.stake_amount);
        const changeAmount = BigNumber(ethAmountToPostgresNumeric(event.amount));

        const newAmount = currentStake.plus(event.eventName == 'WithdrewStake' ? changeAmount.negated() : changeAmount)

        await this.dbManager.updateStakeHistory({
            from_block: record.from_block,
            to_block: record.to_block,
            node: record.node
        }, {
            to_block: event.blockNumber - 1,
        });

        await this.dbManager.insertStakeHistoryRecord({
            from_block: event.blockNumber,
            to_block: event.blockNumber,
            node: record.node,
            stake_amount: newAmount.toString()
        });
    }

    public async visitMovedStakeEvent(event: MovedStakeEvent): Promise<void> {
        const fromPoolRecord = await this.dbManager.getLastStakeHistoryRecord(event.fromPoolAddress);

        if (fromPoolRecord == null) {
            console.log(
                `Found unmatched MoveStake event at block
                ${event.blockNumber} from ${event.stakerAddress} for pool ${event.fromPoolAddress}`
            );
            return;
        }

        const movedAmount = BigNumber(ethAmountToPostgresNumeric(event.amount));
        const fromPoolUpdatedStake = BigNumber(fromPoolRecord.stake_amount).minus(movedAmount)

        // close previous time frame of fromPoolAddress
        await this.dbManager.updateStakeHistory({
            from_block: fromPoolRecord.from_block,
            to_block: fromPoolRecord.to_block,
            node: fromPoolRecord.node
        }, {
            to_block: event.blockNumber - 1,
        });

        // create new record for fromPoolAddress
        await this.dbManager.insertStakeHistoryRecord({
            from_block: event.blockNumber,
            to_block: event.blockNumber,
            stake_amount: fromPoolUpdatedStake.toString(),
            node: fromPoolRecord.node
        });

        const toPoolRecord = await this.dbManager.getLastStakeHistoryRecord(event.toPoolAddress);
        let toPoolUpdatedStake = BigNumber(0);

        // if record for new pool already exists, close previous time frame
        if (toPoolRecord != null) {
            await this.dbManager.updateStakeHistory({
                from_block: toPoolRecord.from_block,
                to_block: toPoolRecord.to_block,
                node: toPoolRecord.node
            }, {
                to_block: event.blockNumber - 1,
            });

            toPoolUpdatedStake = BigNumber(toPoolRecord.stake_amount);
        }

        toPoolUpdatedStake = toPoolUpdatedStake.plus(movedAmount);

        // insert new time frame
        await this.dbManager.insertStakeHistoryRecord({
            from_block: event.blockNumber,
            to_block: event.blockNumber,
            node: convertEthAddressToPostgresBuffer(event.toPoolAddress),
            stake_amount: toPoolUpdatedStake.toString()
        });
    }

    public async visitGatherAbandonedStakesEvent(event: GatherAbandonedStakesEvent): Promise<void> {
        const record = await this.dbManager.getLastStakeHistoryRecord(event.poolAddress);

        if (record == null) {
            console.log(`Found unmatched MoveStake event at block ${event.blockNumber} for pool ${event.poolAddress}`);
            return;
        }

        // close previous time frame of fromPoolAddress
        await this.dbManager.updateStakeHistory({
            from_block: record.from_block,
            to_block: record.to_block,
            node: record.node
        }, {
            to_block: event.blockNumber - 1,
        });

        const gatheredAmount = BigNumber(ethAmountToPostgresNumeric(event.amount));
        const stakeAmount = BigNumber(record.stake_amount).minus(gatheredAmount);

        // insert new time frame
        await this.dbManager.insertStakeHistoryRecord({
            from_block: event.blockNumber,
            to_block: event.blockNumber,
            node: convertEthAddressToPostgresBuffer(event.poolAddress),
            stake_amount: stakeAmount.toString()
        });
    }
}
