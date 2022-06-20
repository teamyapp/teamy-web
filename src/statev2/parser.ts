export function toDate(dateStr?: string): Date | undefined {
    if (!dateStr) {
        return undefined;
    }

    return new Date(dateStr);
}

export function toInt(intStr?: string): number | undefined {
    if (!intStr) {
        return undefined;
    }

    return parseInt(intStr);
}
