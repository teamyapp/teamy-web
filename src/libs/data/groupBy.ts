export function groupBy<T, Group>(
    data: T[],
    groupBy: (ele: T) => Group,
): Map<Group | undefined, T[]> {
    return data.reduce((accu, cur) => {
        if (accu.has(groupBy(cur))) {
            accu.get(groupBy(cur))?.push(cur);
        } else {
            accu.set(groupBy(cur), [cur]);
        }
        return accu;
    }, new Map<Group | undefined, T[]>());
}
