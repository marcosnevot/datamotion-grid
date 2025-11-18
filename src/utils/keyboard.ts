// src/utils/keyboard.ts

export interface ShortcutEventLike {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Alt + C → toggle column panel
 */
export function isColumnPanelShortcut(event: ShortcutEventLike): boolean {
  const key = event.key.toLowerCase();
  return key === 'c' && !!event.altKey;
}

/**
 * Alt + [1..N] → aplicar vista por índice (0-based).
 *
 * Ejemplos:
 * - Alt+1 → índice 0
 * - Alt+2 → índice 1
 */
export function getViewShortcutIndex(
  event: ShortcutEventLike,
  maxViews: number,
): number | null {
  if (!event.altKey) {
    return null;
  }

  const digit = Number.parseInt(event.key, 10);
  if (!Number.isFinite(digit)) {
    return null;
  }

  if (digit < 1 || digit > maxViews) {
    return null;
  }

  return digit - 1;
}
