// TODO: enable in the future when 1) moved off Apollo or when 2) vitest is stable
import { render } from '@testing-library/react';
import React from 'react';

import { initDeps } from '@core/dep/deps';

import AppComponentHook from './App.component';

test('renders without crash', () => {
    const deps = initDeps();
    render(<AppComponentHook deps={deps} />);
});
