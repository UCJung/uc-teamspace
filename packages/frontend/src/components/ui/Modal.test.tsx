import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  test('renders when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="테스트 모달">
        <p>모달 내용</p>
      </Modal>,
    );
    expect(screen.getByText('테스트 모달')).toBeDefined();
    expect(screen.getByText('모달 내용')).toBeDefined();
  });

  test('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="숨겨진 모달">
        <p>보이지 않음</p>
      </Modal>,
    );
    expect(screen.queryByText('숨겨진 모달')).toBeNull();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="닫기 테스트">
        내용
      </Modal>,
    );
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
