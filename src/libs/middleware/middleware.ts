export type Middleware<T> = (entity: T) => T

export function WithMiddlewares<T>(
    entity: T,
    middlewares: Middleware<T>[],
): T {
    if (middlewares.length === 0) {
        return entity;
    }

    return middlewares[0](
        WithMiddlewares(entity, middlewares.slice(1)),
    );
}
