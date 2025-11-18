// src/tests/unit/viewsConfig.test.ts

import { describe, it, expect } from 'vitest';
import {
  PREDEFINED_VIEWS,
  DEFAULT_VIEW_ID,
} from '../../features/datagrid/config/viewsConfig';
import type { GridView } from '../../features/datagrid/types/gridTypes';

describe('viewsConfig', () => {
  it('exposes at least one predefined view', () => {
    expect(PREDEFINED_VIEWS.length).toBeGreaterThan(0);
  });

  it('DEFAULT_VIEW_ID points to an existing view', () => {
    const defaultView = PREDEFINED_VIEWS.find(
      (view) => view.id === DEFAULT_VIEW_ID,
    );
    expect(defaultView).toBeDefined();
  });

  it('all views have unique ids and non-empty names', () => {
    const ids = new Set<string>();

    for (const view of PREDEFINED_VIEWS as GridView[]) {
      expect(typeof view.id).toBe('string');
      expect(view.id.length).toBeGreaterThan(0);
      expect(typeof view.name).toBe('string');
      expect(view.name.length).toBeGreaterThan(0);

      expect(ids.has(view.id)).toBe(false);
      ids.add(view.id);
    }
  });
});
