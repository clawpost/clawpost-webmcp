import { describe, expect, it } from "vitest";
import {
  getModelContext,
  isWebMcpAvailable,
  registerWebMcpTools,
} from "./model-context";
import { installMockModelContext } from "./mock";
import { structuredResult, textResult, type WebMcpTool } from "./types";

function makeTool(name: string): WebMcpTool {
  return {
    name,
    description: `Test tool ${name}`,
    inputSchema: { type: "object", properties: {} },
    execute: async () => textResult(`ran ${name}`),
  };
}

describe("getModelContext", () => {
  it("returns null when no surface exists", () => {
    expect(getModelContext({})).toBeNull();
    expect(isWebMcpAvailable({})).toBe(false);
  });

  it("prefers document.modelContext over navigator.modelContext", () => {
    const onDocument = { registerTool: () => undefined };
    const onNavigator = { registerTool: () => undefined };
    const host = {
      document: { modelContext: onDocument },
      navigator: { modelContext: onNavigator },
    };
    expect(getModelContext(host)).toBe(onDocument);
  });

  it("falls back to navigator.modelContext", () => {
    const onNavigator = { registerTool: () => undefined };
    expect(getModelContext({ navigator: { modelContext: onNavigator } })).toBe(
      onNavigator,
    );
  });
});

describe("registerWebMcpTools with registerTool", () => {
  it("registers tools and unregisters them on dispose", () => {
    const host: Parameters<typeof installMockModelContext>[0] = {};
    const mock = installMockModelContext(host);

    const dispose = registerWebMcpTools([makeTool("a"), makeTool("b")], host);
    expect(mock.listTools()).toEqual(["a", "b"]);

    dispose();
    expect(mock.listTools()).toEqual([]);
  });

  it("a later registration of the same name survives an earlier dispose", () => {
    const host: Parameters<typeof installMockModelContext>[0] = {};
    const mock = installMockModelContext(host);

    const first = registerWebMcpTools([makeTool("a")], host);
    const second = registerWebMcpTools([makeTool("a")], host);
    first();
    expect(mock.listTools()).toEqual(["a"]);
    second();
    expect(mock.listTools()).toEqual([]);
  });

  it("executes the registered tool like an agent would", async () => {
    const host: Parameters<typeof installMockModelContext>[0] = {};
    const mock = installMockModelContext(host);
    const tool: WebMcpTool = {
      name: "quote",
      description: "quote a letter",
      inputSchema: {
        type: "object",
        properties: { content: { type: "string" } },
        required: ["content"],
      },
      execute: async (args) =>
        structuredResult({ echoed: args.content, cost_cents: 250 }),
    };

    registerWebMcpTools([tool], host);
    const result = await mock.callTool("quote", { content: "hello" });
    expect(result.structuredContent).toEqual({
      echoed: "hello",
      cost_cents: 250,
    });
    expect(result.isError).toBeUndefined();
  });

  it("no-ops without a modelContext", () => {
    const dispose = registerWebMcpTools([makeTool("a")], {});
    expect(() => dispose()).not.toThrow();
  });

  it("rolls back every tool when one registration rejects", async () => {
    const live = new Set<string>();
    const host = {
      document: {
        modelContext: {
          registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }) {
            live.add(tool.name);
            options?.signal?.addEventListener("abort", () => {
              live.delete(tool.name);
            });
            return tool.name === "b"
              ? Promise.reject(new Error("registration rejected"))
              : Promise.resolve(undefined);
          },
        },
      },
    };

    const registration = registerWebMcpTools(
      [makeTool("a"), makeTool("b"), makeTool("c")],
      host,
    );
    await expect(registration.ready).rejects.toThrow("registration rejected");
    expect([...live]).toEqual([]);
  });

  it("rolls back earlier tools when registration throws synchronously", () => {
    const live = new Set<string>();
    const host = {
      document: {
        modelContext: {
          registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }) {
            if (tool.name === "b") throw new Error("registration threw");
            live.add(tool.name);
            options?.signal?.addEventListener("abort", () => {
              live.delete(tool.name);
            });
            return undefined;
          },
        },
      },
    };

    expect(() =>
      registerWebMcpTools([makeTool("a"), makeTool("b")], host),
    ).toThrow("registration threw");
    expect([...live]).toEqual([]);
  });
});

describe("registerWebMcpTools with provideContext only", () => {
  it("maintains the merged tool set across registrations", () => {
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

    const first = registerWebMcpTools([makeTool("a")], host);
    const second = registerWebMcpTools([makeTool("b"), makeTool("c")], host);
    expect(providedTools).toEqual(["a", "b", "c"]);

    first();
    expect(providedTools).toEqual(["b", "c"]);
    second();
    expect(providedTools).toEqual([]);
  });

  it("keeps fallback registrations isolated per model context", () => {
    let firstTools: string[] = [];
    let secondTools: string[] = [];
    const firstHost = {
      document: {
        modelContext: {
          provideContext: (ctx: { tools: { name: string }[] }) => {
            firstTools = ctx.tools.map((tool) => tool.name);
          },
        },
      },
    };
    const secondHost = {
      document: {
        modelContext: {
          provideContext: (ctx: { tools: { name: string }[] }) => {
            secondTools = ctx.tools.map((tool) => tool.name);
          },
        },
      },
    };

    const disposeFirst = registerWebMcpTools([makeTool("first")], firstHost);
    const disposeSecond = registerWebMcpTools([makeTool("second")], secondHost);
    expect(firstTools).toEqual(["first"]);
    expect(secondTools).toEqual(["second"]);

    disposeFirst();
    expect(firstTools).toEqual([]);
    expect(secondTools).toEqual(["second"]);
    disposeSecond();
  });

  it("restores the prior fallback set when an update rejects", async () => {
    let providedTools: string[] = [];
    let rejectNext = false;
    const host = {
      document: {
        modelContext: {
          provideContext: (ctx: { tools: { name: string }[] }) => {
            providedTools = ctx.tools.map((tool) => tool.name);
            if (rejectNext) {
              rejectNext = false;
              return Promise.reject(new Error("provide rejected"));
            }
            return Promise.resolve();
          },
        },
      },
    };

    const first = registerWebMcpTools([makeTool("a")], host);
    await first.ready;
    rejectNext = true;
    const second = registerWebMcpTools([makeTool("b")], host);
    await expect(second.ready).rejects.toThrow("provide rejected");
    expect(providedTools).toEqual(["a"]);
    first();
  });
});
