import { render, screen } from '@testing-library/react';
import { initDeps } from '../deps';
import AppComponentContainer from './App.component';

test('renders learn react link', () => {
    const deps = initDeps();
    render(
        <AppComponentContainer
            executionModeService={deps.executionModeService}
        />,
    );
    const linkElement = screen.getByText(/Teamy/i);
    expect(linkElement).toBeInTheDocument();
});
