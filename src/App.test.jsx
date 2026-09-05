import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders login page on initial load', async () => {
    render(<App />);
    await waitFor(() => {
      const signInElements = screen.getAllByText(/Sign In/i);
      expect(signInElements.length).toBeGreaterThan(0);
    });
  });
});
