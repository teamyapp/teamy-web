import { Duration } from '@lib/entity/duration';

export interface BackOff {
    onSuccess: () => void;
    onFailure: () => void;
    delay: () => Duration;
}
