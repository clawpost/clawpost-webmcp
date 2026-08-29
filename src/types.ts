// Core WebMCP types. Mirrors the webmachinelearning/webmcp draft: a page
// registers tools on `document.modelContext` (older builds expose
// `navigator.modelContext`); a browser agent discovers and calls them. Tool
// results reuse the MCP result shape so a server-side MCP tool surface can be
// mirrored into the page without translation.

/** One content block in a tool result (text-only for now, like MCP). */
export type WebMcpContentBlock = { type: 'text'; text: string };

/** Result returned by a tool's execute callback. */
export type WebMcpToolResult = {
  content: WebMcpContentBlock[];
  structuredContent?: Record<string, unknown>;
  /** Marks error/guidance results so agents do not treat them as success. */
  isError?: boolean;
};

/** MCP-style behavior hints, passed through to the agent when supported. */
export type WebMcpToolAnnotations = {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
};

/** A tool the page offers to the browser agent. */
export type WebMcpTool = {
  /** Stable machine name, e.g. `clawpost_quote_letter`. */
  name: string;
  /** Human-readable title shown by some agent surfaces. */
  title?: string;
  /** What the tool does and how the agent should use it. */
  description: string;
  /** JSON Schema for the arguments object. */
  inputSchema: Record<string, unknown>;
  annotations?: WebMcpToolAnnotations;
  execute: (args: Record<string, unknown>) => Promise<WebMcpToolResult>;
};

/**
 * The subset of the `modelContext` interface this package relies on.
 * `registerTool` is the per-tool API from the draft spec; `provideContext`
 * is the coarser "replace the whole tool set" API some builds expose.
 */
export type ModelContextLike = {
  registerTool?: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal }
  ) => unknown;
  provideContext?: (context: { tools: WebMcpTool[] }) => unknown;
};

export function textResult(
  text: string,
  opts?: { isError?: boolean }
): WebMcpToolResult {
  return {
    content: [{ type: 'text', text }],
    ...(opts?.isError ? { isError: true } : {}),
  };
}

export function structuredResult(
  data: Record<string, unknown>,
  opts?: { isError?: boolean }
): WebMcpToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
    ...(opts?.isError ? { isError: true } : {}),
  };
}

export function errorResult(text: string): WebMcpToolResult {
  return textResult(text, { isError: true });
}
