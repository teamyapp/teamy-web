export function formatCount(count: number): string {
    if (count >= 1_000_000) {
        return `${Math.round(count / 1_000_000)}M`;
    }

    if (count >= 1_000) {
        return `${Math.round(count / 1000)}K`;
    }

    return `${count}`;
}

export function formatPrice(value: number): string {
    return value === 0 ? 'Free' : `$${value}`;
}
