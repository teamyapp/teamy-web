import { UserActionEvent } from '@core/event/userAction';

import { Shortcut } from '@lib/shortcut/monitor';

export const shortcuts: Shortcut<UserActionEvent>[] = [
    {
        keys: ['MetaKey', 'FKey'],
        userAction: 'findKeyword',
    },
];
