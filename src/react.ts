// React binding: register a set of WebMCP tools for the lifetime of a
// component (or until deps change). SSR-safe — registration only happens in
// the browser, and browsers without a modelContext no-op.

import { useEffect } from 'react';
import { registerWebMcpTools } from './model-context.js';
import type { WebMcpTool } from './types.js';

/**
 * Register `tools` while the calling component is mounted. Re-registers when
 * `deps` change (route-scoped tool sets swap on navigation this way). The
 * factory runs only in the browser, so it may safely close over
 * window/document state.
 */
export function useWebMcpTools(
  factory: () => WebMcpTool[],
  deps: readonly unknown[]
): void {
  useEffect(() => {
    const dispose = registerWebMcpTools(factory());
    return dispose;
    // The caller owns the dependency list, exactly like useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
