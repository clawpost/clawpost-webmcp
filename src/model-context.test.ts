import { describe, expect, it } from 'vitest';
import {
  getModelContext,
  isWebMcpAvailable,
  registerWebMcpTools,
} from './model-context';
import { installMockModelContext } from './mock';
import { structuredResult, textResult, type WebMcpTool } from './types';

function makeTool(name: string): WebMcpTool {
  return {
    name,
    description: `Test tool ${name}`,
    inputSchema: { type: 'object', properties: {} },
    execute: async () => textResult(`ran ${name}`),
  };
}

describe('getModelContext', () => {
  it('returns null when no surface exists', () => {
    expect(getModelContext({})).toBeNull();
    expect(isWebMcpAvailable({})).toBe(false);
  });

  it('prefers document.modelContext over navigator.modelContext', () => {
    const onDocument = { registerTool: () => undefined };
    const onNavigator = { registerTool: () => undefined };
    const host = {
      document: { modelContext: onDocument },
      navigator: { modelContext: onNavigator },
    };
    expect(getModelContext(host)).toBe(onDocument);
  });

  it('falls back to navigator.modelContext', () => {
    const onNavigator = { registerTool: () => undefined };
    expect(getModelContext({ navigator: { modelContext: onNavigator } })).toBe(
      onNavigator
    );
  });
});

describe('registerWebMcpTools with registerTool', () => {
  it('registers tools and unregisters them on dispose', () => {
    const host: Parameters<typeof installMockModelContext>[0] = {};
    const mock = installMockModelContext(host);

    const dispose = registerWebMcpTools([makeTool('a'), makeTool('b')], host);
    expect(mock.listTools()).toEqual(['a', 'b']);

    dispose();
    expect(mock.listTools()).toEqual([]);
  });

  it('a later registration of the same name survives an earlier dispose', () => {
    const host: Parameters<typeof installMockModelContext>[0] = {};
    const mock = installMockModelContext(host);

    const first = registerWebMcpTools([makeTool('a')], host);
    const second = registerWebMcpTools([makeTool('a')], host);
    first();
    expect(mock.listTools()).toEqual(['a']);
    second();
    expect(mock.listTools()).toEqual([]);
  });

  it('executes the registered tool like an agent would', async () => {
    const host: Parameters<typeof installMockModelContext>[0] = {};
    const mock = installMockModelContext(host);
    const tool: WebMcpTool = {
      name: 'quote',
      description: 'quote a letter',
      inputSchema: {
        type: 'object',
        properties: { content: { type: 'string' } },
        required: ['content'],
      },
      execute: async (args) =>
        structuredResult({ echoed: args.content, cost_cents: 250 }),
    };

    registerWebMcpTools([tool], host);
    const result = await mock.callTool('quote', { content: 'hello' });
    expect(result.structuredContent).toEqual({
      echoed: 'hello',
      cost_cents: 250,
    });
    expect(result.isError).toBeUndefined();
  });

  it('no-ops without a modelContext', () => {
    const dispose = registerWebMcpTools([makeTool('a')], {});
    expect(() => dispose()).not.toThrow();
  });
});

describe('registerWebMcpTools with provideContext only', () => {
  it('maintains the merged tool set across registrations', () => {
    let providedTools: string[] = [];
    const host = {
      document: {
        modelContext: {
          provideContext: (ctx: { tools: { name: string }[] }) => {
            providedTools = ctx.tools.map((t) => t.name);
          },
        },
      },
    };

    const first = registerWebMcpTools([makeTool('a')], host);
    const second = registerWebMcpTools([makeTool('b'), makeTool('c')], host);
    expect(providedTools).toEqual(['a', 'b', 'c']);

    first();
    expect(providedTools).toEqual(['b', 'c']);
    second();
    expect(providedTools).toEqual([]);
  });
});
