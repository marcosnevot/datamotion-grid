// src/features/datagrid/utils/virtualizationUtils.ts

import type { CSSProperties } from 'react';
import { DEFAULT_ROW_HEIGHT } from '../config/gridSettings';

export interface SimpleVirtualItem {
  index: number;
  start: number;
  size: number;
}

/**
 * Normalizes any object with index/start/size into a SimpleVirtualItem.
 * Useful to decouple tests and helpers from the concrete virtualizer type.
 */
export function toSimpleVirtualItem(input: {
  index: number;
  start: number;
  size: number;
}): SimpleVirtualItem {
  return {
    index: input.index,
    start: input.start,
    size: input.size,
  };
}

/**
 * Returns style for the outer container that holds all virtual rows.
 * It's expected to be placed inside a single table cell spanning all columns.
 */
export function getVirtualContainerStyle(totalSize: number): CSSProperties {
  return {
    height: `${totalSize}px`,
    position: 'relative',
  };
}

/**
 * Returns style for a single virtualized row wrapper.
 * Rows are absolutely positioned inside the virtual container.
 */
export function getVirtualRowStyle(item: SimpleVirtualItem): CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    transform: `translateY(${item.start}px)`,
  };
}

/**
 * Estimates the total scroll height for a given number of items.
 * Useful in tests or as a fallback when no real virtualizer is available.
 */
export function estimateTotalHeight(
  itemCount: number,
  rowHeight: number = DEFAULT_ROW_HEIGHT,
): number {
  if (itemCount <= 0) {
    return 0;
  }

  return itemCount * rowHeight;
}
