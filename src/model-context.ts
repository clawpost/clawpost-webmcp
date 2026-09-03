// Runtime adapter for the browser's modelContext surface. The draft spec puts
// it on `document.modelContext`; some earlier builds exposed
// `navigator.modelContext`. Registration prefers the per-tool `registerTool`
// API (with AbortSignal-based teardown); when only the coarse `provideContext`
// API exists, this module maintains one merged tool set and re-provides it on
// every change so route-scoped registrations still compose.

import type { ModelContextLike, WebMcpTool } from "./types.js";

type ModelContextHost = {
  document?: { modelContext?: ModelContextLike };
  navigator?: { modelContext?: ModelContextLike };
};

function defaultHost(): ModelContextHost {
  return globalThis as ModelContextHost;
}

/** The page's modelContext, or null when the browser does not expose one. */
export function getModelContext(
  host: ModelContextHost = defaultHost(),
): ModelContextLike | null {
  return host.document?.modelContext ?? host.navigator?.modelContext ?? null;
}

export function isWebMcpAvailable(
  host: ModelContextHost = defaultHost(),
): boolean {
  return getModelContext(host) !== null;
}

// provideContext fallback state: the union of every live registration, keyed
// by registration so disposal removes exactly the tools it added.
const providedByContext = new WeakMap<
  ModelContextLike,
  Map<symbol, WebMcpTool[]>
>();

function providedFor(context: ModelContextLike): Map<symbol, WebMcpTool[]> {
  const existing = providedByContext.get(context);
  if (existing) return existing;

  const registrations = new Map<symbol, WebMcpTool[]>();
  providedByContext.set(context, registrations);
  return registrations;
}

async function reprovide(context: ModelContextLike): Promise<void> {
  const registrations = providedByContext.get(context);
  const tools = registrations ? [...registrations.values()].flat() : [];
  await context.provideContext?.({ tools });
}

/** Callable disposer with an observable registration-completion promise. */
export type WebMcpRegistration = (() => void) & {
  readonly ready: Promise<void>;
};

function registration(
  dispose: () => void,
  ready: Promise<void> = Promise.resolve(),
): WebMcpRegistration {
  // React effects need a callable cleanup. `ready` adds failure visibility
  // without breaking existing callers that only invoke the returned function.
  void ready.catch(() => {});
  return Object.assign(dispose, { ready });
}

/**
 * Register a set of tools with the page's modelContext. Returns a dispose
 * function that unregisters exactly these tools. Safe to call in any
 * environment: without a modelContext it logs once and no-ops so pages behave
 * identically in non-agent browsers.
 */
export function registerWebMcpTools(
  tools: WebMcpTool[],
  host: ModelContextHost = defaultHost(),
): WebMcpRegistration {
  const context = getModelContext(host);
  if (!context) {
    return registration(() => {});
  }

  if (typeof context.registerTool === "function") {
    const controller = new AbortController();
    const pending: Promise<undefined>[] = [];
    try {
      for (const tool of tools) {
        pending.push(
          Promise.resolve(
            context.registerTool(tool, { signal: controller.signal }),
          ),
        );
      }
    } catch (error) {
      controller.abort();
      throw error;
    }

    const ready = Promise.all(pending)
      .then(() => {})
      .catch((error: unknown) => {
        controller.abort();
        throw error;
      });
    return registration(() => controller.abort(), ready);
  }

  if (typeof context.provideContext === "function") {
    const key = Symbol("webmcp-registration");
    const provided = providedFor(context);
    provided.set(key, tools);

    let ready: Promise<void>;
    try {
      ready = reprovide(context).catch(async (error: unknown) => {
        provided.delete(key);
        await reprovide(context).catch(() => {});
        throw error;
      });
    } catch (error) {
      provided.delete(key);
      void reprovide(context).catch(() => {});
      throw error;
    }

    let disposed = false;
    return registration(() => {
      if (disposed) return;
      disposed = true;
      provided.delete(key);
      void reprovide(context).catch(() => {});
    }, ready);
  }

  return registration(() => {});
}
