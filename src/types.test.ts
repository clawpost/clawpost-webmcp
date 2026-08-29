import { describe, expect, it } from 'vitest';
import { errorResult, structuredResult, textResult } from './types.js';

describe('result helpers', () => {
  it('textResult wraps text in a content block', () => {
    expect(textResult('hi')).toEqual({ content: [{ type: 'text', text: 'hi' }] });
  });

  it('structuredResult carries both text and structuredContent', () => {
    const result = structuredResult({ ok: true });
    expect(result.structuredContent).toEqual({ ok: true });
    expect(result.content[0]?.text).toContain('"ok": true');
    expect(result.isError).toBeUndefined();
  });

  it('errorResult sets isError', () => {
    expect(errorResult('nope').isError).toBe(true);
  });
});
