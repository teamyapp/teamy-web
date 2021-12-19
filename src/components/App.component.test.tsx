import React from 'react';
import { render } from '@testing-library/react';
import { initDeps } from '../deps';
import AppComponentHook from './App.component';

test('renders without crash', () => {
    const deps = initDeps();
    render(<AppComponentHook deps={deps} />);
});
