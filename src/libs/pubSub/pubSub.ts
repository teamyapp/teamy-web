import { PopChannel, chan, multi } from '@lib/csp/csp';

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
        if (!this.channel.closed()) {
            this.channel.close();
        }
    }
}
