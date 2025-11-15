// src/tests/unit/virtualizationUtils.test.ts

import { describe, it, expect } from 'vitest';
import {
  toSimpleVirtualItem,
  estimateTotalHeight,
  getVirtualContainerStyle,
  getVirtualRowStyle,
} from '../../features/datagrid/utils/virtualizationUtils';
import { DEFAULT_ROW_HEIGHT } from '../../features/datagrid/config/gridSettings';

describe('virtualizationUtils', () => {
  it('toSimpleVirtualItem normalizes the basic fields', () => {
    const input = { index: 3, start: 120, size: 40 };
    const item = toSimpleVirtualItem(input);

    expect(item.index).toBe(3);
    expect(item.start).toBe(120);
    expect(item.size).toBe(40);
  });

  it('estimateTotalHeight returns 0 for non-positive item counts', () => {
    expect(estimateTotalHeight(0)).toBe(0);
    expect(estimateTotalHeight(-5)).toBe(0);
  });

  it('estimateTotalHeight uses the default row height when not specified', () => {
    const count = 10;
    expect(estimateTotalHeight(count)).toBe(count * DEFAULT_ROW_HEIGHT);
  });

  it('estimateTotalHeight respects custom row height', () => {
    const count = 5;
    const rowHeight = 50;
    expect(estimateTotalHeight(count, rowHeight)).toBe(count * rowHeight);
  });

  it('getVirtualContainerStyle returns height and relative position', () => {
    const style = getVirtualContainerStyle(1000);

    expect(style.height).toBe('1000px');
    expect(style.position).toBe('relative');
  });

  it('getVirtualRowStyle positions rows using translateY', () => {
    const style = getVirtualRowStyle({ index: 2, start: 80, size: 40 });

    expect(style.position).toBe('absolute');
    expect(style.top).toBe(0);
    expect(style.left).toBe(0);
    expect(style.width).toBe('100%');
    expect(style.transform).toBe('translateY(80px)');
  });
});
