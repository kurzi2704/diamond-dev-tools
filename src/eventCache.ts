import { ContractEvent, ContractManager } from "./contractManager";
import { MovedStakeEvent, StakeChangedEvent } from "./eventsVisitor";


export class EventCache {
    public constructor(
        public fromBlock: number,
        public toBlock: number,
        public events: ContractEvent[]
    ) { }

    public getEvents(blockNumber: number): ContractEvent[] {
        if (blockNumber < this.fromBlock || blockNumber > this.toBlock) {
            throw new Error(`blockNumber ${blockNumber} is not in range ${this.fromBlock} - ${this.toBlock}`);
        }

        // ok this could be implemented in a more efficient way.
        // but we do not have many events, so this is ok for now.
        return this.events.filter((event) => event.blockNumber == blockNumber);
    }

    public getPoolsSet(blockNumber: number): Set<string> {
        const events = this.getEvents(blockNumber);

        let result = new Set<string>();

        for (const event of events) {
            if (!EventCache.isStakeMovementEvent(event)) {
                continue;
            }

            if (event.eventName == 'MovedStake') {
                result.add((event as MovedStakeEvent).fromPoolAddress.toLowerCase());
                result.add((event as MovedStakeEvent).toPoolAddress.toLowerCase());
            } else {
                result.add((event as StakeChangedEvent).poolAddress.toLowerCase());
            }
        }

        return result;
    }

    public getDelegatorsSet(blockNumber: number): Set<string> {
        const events = this.getEvents(blockNumber);

        let result = new Set<string>();

        for (const event of events) {
            if (!EventCache.isPlacedStakeEvent(event)) {
                continue;
            }

            if ((event as StakeChangedEvent).isDelegatorStake()) {
                result.add((event as StakeChangedEvent).stakerAddress);
            }
        }

        return result;
    }

    public static async build(fromBlock: number, toBlock: number, contractManager: ContractManager): Promise<EventCache> {
        let allEvents = await contractManager.getAllEvents(fromBlock, toBlock);

        const totalEvents = allEvents.length;

        console.log(`building event cache for block range ${fromBlock} to ${toBlock}. total events ${totalEvents}`);

        return new EventCache(fromBlock, toBlock, allEvents);
    }

    public static getStakeMovementEvents(): string[] {
        return [
            'PlacedStake',
            'MovedStake',
            'WithdrewStake',
            'OrderedWithdrawal',
            'ClaimedOrderedWithdrawal',
            'GatherAbandonedStakes'
        ];
    }

    public static isStakeMovementEvent(event: ContractEvent): boolean {
        return EventCache.getStakeMovementEvents().includes(event.eventName);
    }

    public static isPlacedStakeEvent(event: ContractEvent): boolean {
        return event.eventName == 'PlacedStake';
    }
}
