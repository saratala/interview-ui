import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders Home component by default', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const homeElement = screen.getByText(/Welcome to Interview Me/i); // Adjusted text to match the Home component's content
  expect(homeElement).toBeInTheDocument();
});
