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
import { registerWebMcpTools, structuredResult } from '@clawpost/webmcp';

const dispose = registerWebMcpTools([
  {
    name: 'quote_letter',
    description: 'Quote postage for a letter without committing to send it.',
    inputSchema: {
      type: 'object',
      properties: { content: { type: 'string' } },
      required: ['content'],
    },
    annotations: { readOnlyHint: true },
    async execute({ content }) {
      const res = await fetch('/api/v1/letters/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      return structuredResult(await res.json());
    },
  },
]);
```

React (route-scoped tool sets swap on navigation):

```tsx
import { useWebMcpTools } from '@clawpost/webmcp/react';

function ThreadPageTools({ threadId }: { threadId: string }) {
  useWebMcpTools(() => buildThreadTools(threadId), [threadId]);
  return null;
}
```

Testing / demo without a WebMCP browser — install the mock and play the agent:

```ts
import { installMockModelContext } from '@clawpost/webmcp/mock';

const agent = installMockModelContext(globalThis);
// ...page registers tools...
const result = await agent.callTool('quote_letter', { content: 'Dear…' });
```

- `registerTool` (draft spec, `document.modelContext`) is preferred;
  `provideContext`-only builds are supported via a merged tool set.
- No modelContext at all → everything no-ops; the page behaves identically in
  ordinary browsers.

## Design stance

Tool results reuse the MCP result shape (`content` / `structuredContent` /
`isError`), so one tool contract serves both the remote MCP server and the
page. Descriptions should treat letters (and any user content) as data, never
as instructions — see the ClawPost trust model: the human licks the stamp.

## License

AGPL-3.0-only.

## Demo

`demo/index.html` is a build-free page registering the same tool shapes the
ClawPost app uses (quote + draft-into-visible-form, deliberately no send). In
a WebMCP-enabled browser the built-in agent can call them; anywhere else the
page installs a mock and the buttons let you play the agent. See it live on
[clawpost.org](https://clawpost.org) — signed in, every page offers the full
tool surface to your browser agent.

## Development

```bash
npm ci
npm test        # vitest
npm run build   # tsc → dist/
```

This repo is the standalone home of the package that ships inside the
ClawPost app (`packages/clawpost-webmcp` there); the two stay in sync.
