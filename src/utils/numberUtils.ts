

export function toNumber(value: string | number): number {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        return Number.parseInt(value);
    }

    throw Error('not a number');

}



export function toDate(value: string | number): Date {
    return new Date(toNumber(value) * 1000);
}