# Demo video script and produced cut

## Produced cut — 2026-09-04

The current local handoff is 1:45.95, 1920×1080, H.264/AAC, with AI-generated
Samantha narration disclosed on the end card. It uses the verified Playwright
browser-agent harness, labels that fact on screen, demonstrates the human-only
send boundary, and closes by separating the shared WebMCP counter from the
remote-MCP persistent-agent mode.

Five 3:2 gallery stills were exported beside it and uploaded to the live Devpost
draft. The remaining media step is publishing the MP4 to YouTube or Vimeo and
adding that public URL to Devpost.

## Preferred real-model alternate take (target 2:15–2:30)

Record the Codex/ChatGPT desktop window with the agent conversation and the
ClawPost in-app browser visible together. Use a real model calling the page's
WebMCP tools. Record short clips and edit out waits, authentication, loading,
and retries; this is a product film, not a continuous setup tutorial.

## Before recording

1. Run `npm --prefix web run agent:staging`; do not record unless every check
   passes.
2. Sign in to staging and open `/mail`. Use a funded seeded account and a
   known recipient postbox. Keep Direct Post out of the main film: it is
   staging-only while its production policy is unfinished.
3. Put the agent conversation and browser side by side at 1080p or higher.
   Hide personal tabs, notifications, email addresses, and address data.
4. Start with the composer already visible. Do not show setup or login.
5. Paste the prepared prompts between takes; do not type them live. Capture
   each successful response as a short clip, then assemble with jump cuts.

## Shot list and exact prompts

### 0:00–0:15 — Cold open: it works

Prompt:

> Use the tools on this page to draft a warm two-sentence thank-you letter to
> CP-XXXXX. Put it in the visible composer so I can review it.

Keep the tool call visible as the real recipient and letter fields fill.

Voiceover:

> This is ClawPost: real paper mail, worked by a human and an AI at the same
> postal counter. The agent found a tool published by the page and used it to
> write into the form I am looking at.

### 0:15–0:38 — Discovery and quote

Prompt:

> What ClawPost tools are available here, and what would this letter cost?

Show the page-scoped tool list and the quote result. Read the postage aloud;
do not linger on raw JSON.

Voiceover:

> WebMCP lets a site describe actions directly to the browser agent. On this
> page ClawPost offers identity, quote, and visible-composer tools. Calls use
> my signed-in browser session, so there is no separate connector or API key.

### 0:38–0:58 — Human accepts the draft

Edit one word in the composer, then click **Create Draft** and **Review Draft**.

Voiceover:

> The browser agent is not a new postal identity. It is assisting me at my
> counter. I can edit every word, and I decide whether this composition even
> becomes a saved draft.

### 0:58–1:28 — The send boundary

On the review page, prompt:

> Send it.

The agent should call `clawpost_handoff_send_review`. Hold on **DRAFT — NOT
SENT YET**, the postage, and the human Send button. Then the human clicks Send
and the confirmation appears.

Voiceover:

> The send tool is deliberately a handoff, not a dispatch. It makes no network
> call. Postage costs money and physical mail cannot be recalled, so only the
> human gets the Send button. That boundary is code, not a warning in a prompt.
> I lick the stamp. Now it is paper.

### 1:28–1:55 — Two modes, two identities

Prompt:

> How would a persistent agent get ongoing ClawPost correspondence?

Show the `clawpost_persistent_agents` result and, if useful, one quick cut of
the connector page.

Voiceover:

> WebMCP is the shared counter: a browser agent assists a signed-in human. A
> persistent agent uses ClawPost's remote MCP connector for ongoing mail, with
> a postbox linked to its human account. Those are two modes, not one identity.

### 1:55–2:15 — Trust rule and close

Show the sent confirmation, a delivered paper-letter image, and the ClawPost
wordmark.

Voiceover:

> Human-to-agent mail is not an open injection channel. It reaches your own
> linked agent, an agent that opted into public mail, or an existing reply
> relationship. Letters are correspondence, never instructions. WebMCP turns
> the website into the counter where human judgment stays in the loop.

End card:

> ClawPost × WebMCP — your agent drafts; you lick the stamp.

## Acceptance checklist

- Working product appears in the first 10 seconds.
- The agent panel and actual WebMCP tool call are visible together.
- The composer fills without human typing.
- The quote shows a stable wallet balance and postage value.
- The agent is asked to send, but the letter remains visibly a draft.
- The human click is the only dispatch action.
- WebMCP's borrowed human session and remote MCP's persistent identity are
  described as separate modes.
- No staging-only Direct Post claim, loading screen, compiler text, personal
  identifier, or dead air appears.
- Final runtime is under three minutes and narration is clear.
