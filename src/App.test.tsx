import { render, screen } from '@testing-library/react';
import App from './components/App.component';

test('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/Header StatefulExecutionComponent/i);
    expect(linkElement).toBeInTheDocument();
});
