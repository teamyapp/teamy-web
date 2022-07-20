import { BaseChannel } from '@lib/csp/csp';

export function closeIfNot(ch?: BaseChannel) {
    if (ch && !ch.closed()) {
        ch.close();
    }
}
