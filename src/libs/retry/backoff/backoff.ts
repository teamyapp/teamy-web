import { Duration } from '@lib/time/duration';

export interface BackOff {
    onSuccess: () => void;
    onFailure: () => void;
    delay: () => Duration;
}
