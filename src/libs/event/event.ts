export interface Event {
    type: any;
}

export type EventListener<Context> = (context: Context) => void;

export interface EventMonitor {
    detectEvent(): void;
}
