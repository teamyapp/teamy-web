import { PopChannel, chan, multi } from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';

export class PubSub<Data> {
    private readonly channel = chan<Data>();
    private readonly multiCaster = multi<Data>(this.channel);

    public publish(data: Data): Promise<void> {
        return this.channel.put(data);
    }

    public subscribe(initialData?: Data): PopChannel<Data | undefined> {
        const ch = this.multiCaster.copy();
        if (initialData) {
            ch.put(initialData);
        }
        return ch;
    }

    public dispose() {
        closeIfNot(this.channel);
    }
}
