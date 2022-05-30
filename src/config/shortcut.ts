import { Shortcut } from '@lib/shortcut/monitor';

import { UserActionEvent } from '@core/event/userAction';

export const shortcuts: Shortcut<UserActionEvent>[] = [
    {
        keys: ['MetaKey', 'FKey'],
        userAction: 'findKeyword',
    },
];
