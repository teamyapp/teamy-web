import { chan, multi, PopChannel } from "@lib/csp/csp";
type KeyboardEventType = 'keydown' | 'keyup';

const KeyboardKeys = ['Control', 'Meta'] as const;
type KeyboardKey = (typeof KeyboardKeys)[number];

function isOfTypeKeyboardKey (eventKey: string): eventKey is KeyboardKey {
  return (KeyboardKeys as readonly string[]).includes(eventKey);
}

export interface InternalKeyboardEvent {
    eventType: KeyboardEventType,
    key: KeyboardKey
}

export class KeyBoardEventMonitor {
    private keyEventChan = chan<InternalKeyboardEvent>();
    private keyEventMultiChan = multi<InternalKeyboardEvent>(this.keyEventChan);
    private holdKeySet = new Set<KeyboardKey>();

    private onKeyUp = (event: KeyboardEvent) => {
        const isKeyboardKey = isOfTypeKeyboardKey(event.key)
        if (isKeyboardKey || event.metaKey) {
            this.keyEventChan.put({
                key: isKeyboardKey ? event.key : 'Meta',
                eventType: 'keyup',
            })
            
            this.holdKeySet.delete(isKeyboardKey ? event.key : 'Meta')
        }        
    }

    private onKeyDown = (event: KeyboardEvent) => {
        const isKeyboardKey = isOfTypeKeyboardKey(event.key)
        if (isKeyboardKey && this.isKeyHold(event.key)) {
            return
        }
        
        if (isKeyboardKey|| event.metaKey) {
            this.keyEventChan.put({
                key: isKeyboardKey ? event.key : 'Meta',
                eventType: "keydown",
            });
    
            this.holdKeySet.add(isKeyboardKey ? event.key : 'Meta')
        }
    }

    public subscribe(): PopChannel<InternalKeyboardEvent | undefined> {
        return this.keyEventMultiChan.copy()
    }

    public start() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    public stop() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    public isKeyHold(key: KeyboardKey): boolean {
        return this.holdKeySet.has(key)
    }
}
