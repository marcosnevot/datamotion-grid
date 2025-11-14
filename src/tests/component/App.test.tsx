import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../../App';

describe('App', () => {
  it('renders Phase 0 setup message', () => {
    render(<App />);
    expect(screen.getByText(/DataMotion Grid – Phase 0 setup/i)).toBeInTheDocument();
  });
});
