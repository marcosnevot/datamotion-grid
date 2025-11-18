// src/tests/component/App.test.tsx
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('App', () => {
  it('renders main layout with data grid table', async () => {
    render(<App />);

    // Main grid title (h2 inside DataGrid)
    const gridHeading = screen.getByRole('heading', {
      level: 2,
      name: /Virtualized analytics grid/i,
    });
    expect(gridHeading).toBeInTheDocument();

    // Data grid table is present
    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();
  });
});
