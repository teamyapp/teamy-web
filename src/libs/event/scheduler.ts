import { EventMonitor } from '@lib/event/event';

export type EventName = 'boundingBoxChange';

export class EventDetectionScheduler {
    private readonly eventMonitors = new Map<EventName, EventMonitor>();
    private running: boolean = false;

    public start() {
        this.running = true;
        requestAnimationFrame(this.updateBeforeNextFrame);
    }

    public stop() {
        this.running = false;
    }

    public addEventMonitor(
        eventName: EventName,
        eventMonitor: EventMonitor,
    ): void {
        this.eventMonitors.set(eventName, eventMonitor);
    }

    private updateBeforeNextFrame = () => {
        this.eventMonitors.forEach((eventMonitor) => {
            eventMonitor.detectEvent();
        });
        if (!this.running) {
            return;
        }

        requestAnimationFrame(this.updateBeforeNextFrame);
    };
}
