import { render, screen } from '@testing-library/react';
import { initDeps } from '../deps';
import AppComponentContainer from './App.component';

test('renders Teamy logo', () => {
    const deps = initDeps();
    render(
        <AppComponentContainer
            taskService={deps.taskService}
            executionModeService={deps.executionModeService}
        />,
    );
    const linkElement = screen.getByText(/Teamy/i);
    expect(linkElement).toBeInTheDocument();
});
