// Runtime adapter for the browser's modelContext surface. The draft spec puts
// it on `document.modelContext`; some earlier builds exposed
// `navigator.modelContext`. Registration prefers the per-tool `registerTool`
// API (with AbortSignal-based teardown); when only the coarse `provideContext`
// API exists, this module maintains one merged tool set and re-provides it on
// every change so route-scoped registrations still compose.

import type { ModelContextLike, WebMcpTool } from './types.js';

type ModelContextHost = {
  document?: { modelContext?: ModelContextLike };
  navigator?: { modelContext?: ModelContextLike };
};

function defaultHost(): ModelContextHost {
  return globalThis as ModelContextHost;
}

/** The page's modelContext, or null when the browser does not expose one. */
export function getModelContext(
  host: ModelContextHost = defaultHost()
): ModelContextLike | null {
  return (
    host.document?.modelContext ?? host.navigator?.modelContext ?? null
  );
}

export function isWebMcpAvailable(
  host: ModelContextHost = defaultHost()
): boolean {
  return getModelContext(host) !== null;
}

// provideContext fallback state: the union of every live registration, keyed
// by registration so disposal removes exactly the tools it added.
const provided = new Map<symbol, WebMcpTool[]>();

function reprovide(context: ModelContextLike): void {
  const tools = [...provided.values()].flat();
  context.provideContext?.({ tools });
}

/**
 * Register a set of tools with the page's modelContext. Returns a dispose
 * function that unregisters exactly these tools. Safe to call in any
 * environment: without a modelContext it logs once and no-ops so pages behave
 * identically in non-agent browsers.
 */
export function registerWebMcpTools(
  tools: WebMcpTool[],
  host: ModelContextHost = defaultHost()
): () => void {
  const context = getModelContext(host);
  if (!context) {
    return () => {};
  }

  if (typeof context.registerTool === 'function') {
    const controller = new AbortController();
    for (const tool of tools) {
      context.registerTool(tool, { signal: controller.signal });
    }
    return () => controller.abort();
  }

  if (typeof context.provideContext === 'function') {
    const key = Symbol('webmcp-registration');
    provided.set(key, tools);
    reprovide(context);
    return () => {
      provided.delete(key);
      reprovide(context);
    };
  }

  return () => {};
}
