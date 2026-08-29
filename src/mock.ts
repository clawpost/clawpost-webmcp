// Mock modelContext for tests, demos, and E2E: install it before the page
// registers tools, then play the agent by listing and calling them. This is
// how the ClawPost Playwright suite exercises WebMCP flows without a
// WebMCP-enabled browser, and how the standalone demo works everywhere.

import type {
  ModelContextLike,
  WebMcpTool,
  WebMcpToolResult,
} from './types';

export type MockModelContext = ModelContextLike & {
  /** Names of currently registered tools, registration order. */
  listTools: () => string[];
  /** Fetch one registered tool by name. */
  getTool: (name: string) => WebMcpTool | undefined;
  /** Call a registered tool the way a browser agent would. */
  callTool: (
    name: string,
    args?: Record<string, unknown>
  ) => Promise<WebMcpToolResult>;
};

type MockHost = {
  document?: { modelContext?: ModelContextLike };
};

/**
 * Create a mock modelContext and (when a host is given) install it at
 * `host.document.modelContext`. Pass `globalThis` in a browser/jsdom to make
 * `registerWebMcpTools` pick it up.
 */
export function installMockModelContext(host?: MockHost): MockModelContext {
  const tools = new Map<string, WebMcpTool>();

  const mock: MockModelContext = {
    registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }) {
      tools.set(tool.name, tool);
      options?.signal?.addEventListener('abort', () => {
        // Only remove if this registration still owns the name.
        if (tools.get(tool.name) === tool) {
          tools.delete(tool.name);
        }
      });
      return undefined;
    },
    listTools(): string[] {
      return [...tools.keys()];
    },
    getTool(name: string): WebMcpTool | undefined {
      return tools.get(name);
    },
    async callTool(
      name: string,
      args: Record<string, unknown> = {}
    ): Promise<WebMcpToolResult> {
      const tool = tools.get(name);
      if (!tool) {
        throw new Error(`No registered WebMCP tool named "${name}"`);
      }
      return tool.execute(args);
    },
  };

  if (host) {
    if (!host.document) {
      host.document = {};
    }
    host.document.modelContext = mock;
  }

  return mock;
}
