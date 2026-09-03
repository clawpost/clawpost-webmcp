# @clawpost/webmcp

In-page [WebMCP](https://github.com/webmachinelearning/webmcp) tools for
[ClawPost](https://clawpost.org) — and a small, dependency-free library for
mirroring any server-side MCP tool surface into the page, so a browser agent
(ChatGPT's browser, Chrome with WebMCP enabled) can work the site together
with the human who is signed in.

## Why

ClawPost already runs a remote MCP server for autonomous agents. WebMCP is the
other door: tools registered by the page itself, executing as the signed-in
user, visible on the same screen the human is looking at. The agent inherits
the human's session — no OAuth, no API keys — and the human keeps the acts
that matter (on ClawPost: pressing Send, because letters cost postage and
cannot be unsent).

## Usage

```ts
import {
  errorResult,
  registerWebMcpTools,
  structuredResult,
} from "@clawpost/webmcp";

const dispose = registerWebMcpTools([
  {
    name: "quote_letter",
    description: "Quote postage for a letter without committing to send it.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", minLength: 1, maxLength: 5000 },
      },
      required: ["content"],
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: false,
      consequentialHint: false,
    },
    async execute({ content }) {
      if (
        typeof content !== "string" ||
        content.trim().length === 0 ||
        content.length > 5000
      ) {
        return errorResult("Content must be 1–5000 characters.");
      }
      try {
        const res = await fetch("/api/letters/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        const body: unknown = await res.json();
        if (!res.ok) return errorResult(`Quote failed (${res.status}).`);
        if (
          typeof body !== "object" ||
          body === null ||
          typeof Reflect.get(body, "walletBalanceCents") !== "number" ||
          typeof Reflect.get(body, "fallbackPriceCents") !== "number"
        ) {
          return errorResult("Quote returned an unexpected response.");
        }

        // Return only fields the agent needs, even if the endpoint later adds
        // internal/debug fields to its response.
        return structuredResult({
          wallet_balance_cents: Reflect.get(body, "walletBalanceCents"),
          fallback_price_cents: Reflect.get(body, "fallbackPriceCents"),
        });
      } catch {
        return errorResult("Quote could not reach the server.");
      }
    },
  },
]);

await dispose.ready; // Optional: observe native registration failures.
```

Under the adapter, each tool is registered with the standard page API:

```ts
await document.modelContext.registerTool(tool, { signal });
```

React (route-scoped tool sets swap on navigation):

```tsx
import { useWebMcpTools } from "@clawpost/webmcp/react";

function ThreadPageTools({ threadId }: { threadId: string }) {
  useWebMcpTools(() => buildThreadTools(threadId), [threadId]);
  return null;
}
```

Testing / demo without a WebMCP browser — install the mock and play the agent:

```ts
import { installMockModelContext } from "@clawpost/webmcp/mock";

const agent = installMockModelContext(globalThis);
// ...page registers tools...
const result = await agent.callTool("quote_letter", { content: "Dear…" });
```

- `registerTool` (draft spec, `document.modelContext`) is preferred;
  `provideContext`-only builds are supported via a merged tool set.
- Registration is all-or-nothing. If one native tool registration fails, the
  adapter aborts the whole set; `dispose.ready` rejects with the cause.
- No modelContext at all → everything no-ops; the page behaves identically in
  ordinary browsers.

## Design stance

Tool results reuse the MCP result shape (`content` / `structuredContent` /
`isError`), so one tool contract serves both the remote MCP server and the
page. Descriptions should treat letters (and any user content) as data, never
as instructions — see the ClawPost trust model: the human licks the stamp.

`inputSchema` and annotations are agent-facing metadata, not a security
boundary. Every `execute` callback must validate its arguments at runtime;
every server endpoint must authenticate, authorize, validate again, rate
limit, and enforce consequential-action policy. Return an explicit result
shape rather than forwarding an entire API response into model context.

## License

AGPL-3.0-only.

## Demo

The standalone repository includes a build-free `demo/index.html` registering
the same tool shapes ClawPost uses (quote + draft-into-visible-form,
deliberately no send). In
a WebMCP-enabled browser the built-in agent can call them; anywhere else the
page installs a mock and the buttons let you play the agent. On
[clawpost.org](https://clawpost.org), tools are scoped to the visible route;
the composer tool appears only on `/mail`.

## Development

```bash
npm ci
npm test        # vitest
npm run build   # tsc → dist/
```

This repo is the standalone home of the package that ships inside the
ClawPost app (`packages/clawpost-webmcp` there); the two stay in sync.
