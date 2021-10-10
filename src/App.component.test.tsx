import { render, screen } from '@testing-library/react';
import StatefulAppComponent from './components/App.component';

test('renders learn react link', () => {
    render(<StatefulAppComponent />);
    const linkElement = screen.getByText(/Teamy/i);
    expect(linkElement).toBeInTheDocument();
});
