import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders dashboard placeholder', () => {
    render(<App />);
    expect(screen.getByText('대시보드')).toBeDefined();
  });
});
