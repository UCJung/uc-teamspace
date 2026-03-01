import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GridCell from './GridCell';

describe('GridCell', () => {
  test('renders value in read mode', () => {
    render(
      <GridCell
        value="진행업무 내용"
        isEditing={false}
        onStartEdit={vi.fn()}
        onEndEdit={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText('진행업무 내용')).toBeDefined();
  });

  test('renders textarea in edit mode', () => {
    const { container } = render(
      <GridCell
        value="내용"
        isEditing={true}
        onStartEdit={vi.fn()}
        onEndEdit={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    expect(container.querySelector('textarea')).toBeTruthy();
  });

  test('calls onStartEdit when clicked', () => {
    const onStartEdit = vi.fn();
    render(
      <GridCell
        value=""
        isEditing={false}
        onStartEdit={onStartEdit}
        onEndEdit={vi.fn()}
        onSave={vi.fn()}
        placeholder="입력..."
      />,
    );
    const cell = screen.getByRole('gridcell');
    fireEvent.click(cell);
    expect(onStartEdit).toHaveBeenCalledOnce();
  });

  test('calls onSave with current value on blur', () => {
    const onSave = vi.fn();
    const { container } = render(
      <GridCell
        value="기존값"
        isEditing={true}
        onStartEdit={vi.fn()}
        onEndEdit={vi.fn()}
        onSave={onSave}
      />,
    );
    const textarea = container.querySelector('textarea')!;
    fireEvent.blur(textarea);
    expect(onSave).toHaveBeenCalled();
  });

  test('does not call onStartEdit when disabled', () => {
    const onStartEdit = vi.fn();
    render(
      <GridCell
        value="내용"
        isEditing={false}
        onStartEdit={onStartEdit}
        onEndEdit={vi.fn()}
        onSave={vi.fn()}
        disabled={true}
      />,
    );
    const cell = screen.getByRole('gridcell');
    fireEvent.click(cell);
    expect(onStartEdit).not.toHaveBeenCalled();
  });
});
