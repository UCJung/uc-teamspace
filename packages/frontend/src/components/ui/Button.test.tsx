import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  test('renders with text', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByText('클릭')).toBeDefined();
  });

  test('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>버튼</Button>);
    fireEvent.click(screen.getByText('버튼'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  test('is disabled when disabled prop is set', () => {
    render(<Button disabled>비활성</Button>);
    const btn = screen.getByRole('button');
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  test('renders with icon', () => {
    render(<Button icon={<span data-testid="icon">+</span>}>추가</Button>);
    expect(screen.getByTestId('icon')).toBeDefined();
  });
});
