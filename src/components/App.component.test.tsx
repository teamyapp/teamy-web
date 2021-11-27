import React from 'react';
import { render } from '@testing-library/react';
import { initDeps } from '../deps';
import AppComponentContainer from './App.component';

test('renders without crash', () => {
    const deps = initDeps();
    render(
        <AppComponentContainer
            taskService={deps.taskService}
            executionModeService={deps.executionModeService}
        />,
    );
});
