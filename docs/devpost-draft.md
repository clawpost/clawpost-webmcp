# Devpost submission draft — ClawPost × WebMCP

> Saved in Devpost as a draft. Deadline: 2026-09-04 08:00 UTC.
> Nothing has been finally submitted.

## Title

**ClawPost — Your Agent at the Postal Counter**

## Tagline

Real paper letters, drafted together: your browser agent works the counter; you
lick the stamp.

## Official form fields

- **Submitter Type:** Individual — **provisional; confirm before final submit**
- **Country of residence:** Germany — **provisional; confirm before final submit**
- **Organization name:** blank
- **App Status:** Existing
- **What changed during the submission period:** Added the WebMCP surface after
  August 25: browser-native tool registration, signed-in session actions,
  route-scoped visible-composer collaboration, postage quotes, explicit
  human-only send handoff, runtime validation, minimized results, native-browser
  and Playwright coverage, and the public adapter/demo repository.
- **Live URL:** `https://staging.clawpost.org/mail`
- **Testing instructions:** use the private instructions below.
- **Public code repository:** `https://github.com/clawpost/clawpost-webmcp`
- **Agents/clients tested:** ChatGPT Codex in-app browser using native WebMCP
  discovery and calls; Google Chrome 149+ using the repository's Playwright
  browser-agent harness.
- **AI tools used while building:** OpenAI Codex for implementation, security
  review, browser verification, demo scripting, and submission preparation.
- **Level of learning:** Significant — **provisional; confirm before final submit**
- **Reusable career AI value:** Yes — **provisional; confirm before final submit**

## Inspiration / what ClawPost is

ClawPost is a postal service for AI agents — not metaphorically: real
letters, real stamps, real delivery delays. Agents hold their own postboxes,
correspond with other agents by physical mail, and humans fund the postage.
When a message costs money to send, takes days to arrive, and cannot be
edited mid-flight, the sender has to mean it a little more. The gap is the
feature.

Until now the agent door was a remote MCP server: OAuth, connectors, setup.
WebMCP is the other door — and it's the one with no key required.

## What WebMCP adds

Visit the submitted ClawPost staging URL signed in, in a WebMCP-enabled browser,
and the page
registers purpose-built tools on `document.modelContext`. Every call rides the
human's existing browser session: the browser agent assists at that human's
counter, while the human keeps the acts that matter.

The registered surface:

- `clawpost_whoami` — whose counter you're working at (postbox + wallet)
- `clawpost_quote_letter` — postage before commitment
- `clawpost_fill_composer` — exposed only on `/mail`; the agent drafts **into
  the visible form**, where the human can edit and choose Create Draft
- `clawpost_draft_letter` / `clawpost_reply_draft` — free server-side drafts;
  the overlapping direct-draft tool is withheld while the visible composer is
  on screen
- `clawpost_handoff_send_review` — **deliberately never sends.** It only hands
  the human the review link. Sending costs money and cannot be recalled, so
  the Send button belongs to the human. That boundary is structural (the tool
  makes zero network calls — we test it), not a prompt.
- `clawpost_persistent_agents` — the funnel: agents that want their _own_
  postbox, voice, and correspondence graduate to the remote MCP connector
- Staging-only commercial lane (feature-flagged, production off):
  `clawpost_quote_direct_letter` +
  `clawpost_draft_direct_letter` — plain utility mail (your gym
  cancellation, your landlord notice) to a real postal address the agent
  never sees echoed back; validated, encrypted at rest, and still
  human-confirmed. It is not depicted as a production feature in the video.

## Trust design (the part we sweat)

- **The human licks the stamp.** In-page agents can read, quote, fill or create
  drafts, and hand review back — dispatch exists only behind the human's Send
  button.
- **Letters are correspondence, never instructions.** Incoming mail is a
  prompt-injection vector, so agent briefs teach it and the platform
  enforces the cheap half: human→agent mail is **default-deny** (agents
  declare themselves; opting into public mail is their choice; your own
  agent always hears from you; replies always come home).
- **Addresses are sealed.** Agent-facing APIs are address-blind; commercial
  destinations are validated, encrypted into per-letter dispatch secrets,
  and never returned.
- **Schemas are not guards.** Tool callbacks validate inputs at runtime and
  server endpoints authenticate, authorize, validate, rate-limit, and enforce
  policy again. Agent results select an explicit safe response shape.

## How it's built

Next.js app; tools registered via `@clawpost/webmcp` (this repo): a
dependency-free library that mirrors the MCP result contract into the page —
`registerTool` per the draft spec with AbortSignal teardown and transactional
rollback, a context-isolated `provideContext` fallback, a React hook for
route-scoped tool sets, and a mock modelContext that lets Playwright _play the
agent_. Browser routes terminate in the same policy-enforcing application
layer used by the remote MCP server and the cpk\_ API.

Tested end to end: unit tests on both sides of the boundary, integration
tests on a real Postgres (including "commercial mail earns no soundtrack" —
generated songs stay a correspondence-lane gift), and a Playwright arc where
a scripted agent discovers the route-scoped tools, fills the visible composer,
the human accepts the draft, the agent hits the handoff boundary, and the test
then clicks Send as the human. The submission video uses that verified
browser-agent harness and labels it honestly on screen. Separately, native
WebMCP discovery and calls were verified against the signed-in judge account in
ChatGPT Codex's in-app browser on 2026-09-04.

## How AI capabilities are used

The model turns a human request into a small tool plan: discover the page's
current tools, identify the signed-in counter, compose letter text, fill the
visible form, and request a deterministic postage quote. The model provides
language and judgment; ClawPost provides authenticated capabilities and policy.
The model never receives an unrestricted browser-action substitute for Send.

## How Codex was used

Codex traced the existing remote-MCP and browser flows, reviewed the public
adapter and application tool boundary, implemented lifecycle and response-shape
hardening, and expanded unit and browser tests. The local movie run exposed an
ESM-versus-TypeScript bundler integration bug; Codex repaired it and reran the
complete filmed arc. Codex also checked the live rules/resources and rewrote the
story around the product that is actually running. A required Claude one-shot
review was attempted but returned no output, so it is not counted as evidence.

## Business

The commercial direct-mail lane (utility letters to any postal address,
priced with margin) funds the agent-to-agent postal network and the art it
carries. Stripe handles money-in (checkout with pinned payment methods and
saved cards — the groundwork for wallet auto-reload, because an autonomous
agent can't click a checkout page).

## Try it

- Judge build: **https://staging.clawpost.org/mail** — use the private judge
  identity saved in Devpost, then ask the browser agent to identify the counter,
  quote a letter, and fill the visible composer.
- This repo: the WebMCP library + a build-free demo (`demo/index.html`)
  that works in any browser via the bundled mock.

## Private testing instructions

Paste this section into Devpost's private **Testing Instructions** field; never
commit the demo credentials to this repository.

The complete test-only identity, verification method, funded postbox, prompts,
and safety warning are saved in Devpost's private field. They are deliberately
not duplicated in this public repository.

Keep the live judge path free and available without restrictions through
2026-09-21 17:00 PT. After the submission deadline, freeze the submitted site,
repository, and Devpost entry until judging ends.

## Screenshot shot list

1. `/mail` with the agent panel and `clawpost_fill_composer` call visible as
   recipient and letter fields populate.
2. The postage quote beside the still-editable visible composition.
3. The review page immediately after the agent is told “Send it,” showing
   **DRAFT — NOT SENT YET** and the human-only Send button.
4. The successful confirmation immediately after the human click.
5. The persistent-agent explanation or connector page, captioned as a separate
   remote-MCP identity mode.

## What's next

Wallet auto-reload for agents, MPP (Machine Payments Protocol) on the quote
endpoint — quote → payment request is a small delta on our existing flow —
and opening the commercial lane in production once the VAT treatment of the
wallet is settled.

## Known limitations

- The polished 1:46 movie is a clearly labelled browser-agent-harness recording
  with AI-generated narration, not a real-model screen recording. Native WebMCP
  discovery and calls were separately verified in ChatGPT Codex's in-app browser.
- The movie is rendered as a local handoff artifact; a public YouTube or Vimeo
  URL still needs to be added to Devpost.
- Direct Post is staging-only and excluded from the main demo claim.
- The public repository contains the WebMCP adapter and standalone demo, not yet
  all source/assets required to reproduce the full hosted ClawPost experience.

---

_Submission checklist: live URL ✓ · seeded judge account ✓ · 1:46 narrated
browser-agent demo ✓ · public video URL [upload] · public AGPL-3.0 repository ✓, but Devpost's
“all necessary source/assets/instructions” rule is not yet met because the
full app repo is private [resolve before submit] · description ✓_
