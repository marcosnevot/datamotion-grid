// src/tests/unit/keyboard.test.ts
import { describe, it, expect } from 'vitest';
import {
  isColumnPanelShortcut,
  getViewShortcutIndex,
  type ShortcutEventLike,
} from '../../utils/keyboard';

describe('keyboard utils', () => {
  describe('isColumnPanelShortcut', () => {
    it('returns true for Alt + C (case insensitive)', () => {
      const lower: ShortcutEventLike = { key: 'c', altKey: true };
      const upper: ShortcutEventLike = { key: 'C', altKey: true };

      expect(isColumnPanelShortcut(lower)).toBe(true);
      expect(isColumnPanelShortcut(upper)).toBe(true);
    });

    it('returns false when Alt is not pressed or key is different', () => {
      expect(isColumnPanelShortcut({ key: 'c', altKey: false })).toBe(false);
      expect(isColumnPanelShortcut({ key: 'x', altKey: true })).toBe(false);
      expect(isColumnPanelShortcut({ key: 'c' })).toBe(false);
    });
  });

  describe('getViewShortcutIndex', () => {
    const maxViews = 3;

    it('returns null when Alt is not pressed', () => {
      expect(getViewShortcutIndex({ key: '1' }, maxViews)).toBeNull();
    });

    it('returns index for Alt + number within range', () => {
      expect(getViewShortcutIndex({ key: '1', altKey: true }, maxViews)).toBe(
        0,
      );
      expect(getViewShortcutIndex({ key: '2', altKey: true }, maxViews)).toBe(
        1,
      );
      expect(getViewShortcutIndex({ key: '3', altKey: true }, maxViews)).toBe(
        2,
      );
    });

    it('returns null when key is not a digit', () => {
      expect(
        getViewShortcutIndex({ key: 'a', altKey: true }, maxViews),
      ).toBeNull();
    });

    it('returns null when digit is out of range', () => {
      expect(
        getViewShortcutIndex({ key: '0', altKey: true }, maxViews),
      ).toBeNull();
      expect(
        getViewShortcutIndex({ key: '4', altKey: true }, maxViews),
      ).toBeNull();
    });
  });
});
