import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  test('renders with text', () => {
    render(<Badge>제출완료</Badge>);
    expect(screen.getByText('제출완료')).toBeDefined();
  });

  test('renders dot when dot prop is true', () => {
    const { container } = render(<Badge dot>상태</Badge>);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeTruthy();
  });

  test('renders ok variant', () => {
    const { container } = render(<Badge variant="ok">정상</Badge>);
    expect(container.firstChild).toBeTruthy();
  });

  test('renders danger variant', () => {
    const { container } = render(<Badge variant="danger">위험</Badge>);
    expect(container.firstChild).toBeTruthy();
  });
});
