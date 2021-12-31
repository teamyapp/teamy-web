import React from 'react';

import { initDeps } from '@deps';
import { render } from '@testing-library/react';

import AppComponentHook from './App.component';

test('renders without crash', () => {
    const deps = initDeps();
    render(<AppComponentHook deps={deps} />);
});
