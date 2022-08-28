// This is not a generic implementation of Transducer,
// but a business aware implementation.

// Because JS does not have a good generalization of functor APIs for Iterabls,
// Use Array here.
// Meaning this is a synchronize implementation only.
// When async or infinite API is needed, implementation will change.
export type Filter<T> = (data: T) => boolean;

// Or reduces a sequence of filters to one filters with Or/Union semantics.
export function or<T>(...filterers: Filter<T>[]): Filter<T> {
    return (data: T) => {
        for (let f of filterers) {
            if (f(data)) {
                return true;
            }
        }
        return false;
    };
}

// And reduces a sequence of filters to one filterers with And/Intersection semantics.
export function and<T>(...filterers: Filter<T>[]): Filter<T> {
    return (data: T) => {
        for (let f of filterers) {
            if (!f(data)) {
                return false;
            }
        }
        return true;
    };
}
