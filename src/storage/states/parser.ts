export function toDate(dateStr?: string): Date | undefined {
    if (!dateStr) {
        return;
    }

    return new Date(dateStr);
}

export function toInt(intStr?: string): number | undefined {
    if (!intStr) {
        return;
    }

    return parseInt(intStr);
}
