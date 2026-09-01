# Demo video script (target ≤ 2:45)

One continuous screen recording, narrated. Jump-cuts are fine; the tool calls
must be real.

## Before you hit record

**Pre-flight, one command.** From the app repo:

```bash
npm --prefix web run agent:staging
```

It drives the deployed staging app end to end as an agent would. If it prints
`15/15 checks passed`, every beat below will work on camera. If a check fails,
that beat will fail in the take — fix it first.

**Browser.** Two options, in order of preference:

1. **A real agent browser** — the ChatGPT desktop app's built-in browser, or
   Claude Cowork's side-panel browser. Best footage: a genuine model choosing
   the tools, no flags, no dev setup. Sign in to staging first.
2. **Chrome 152 + flag** — `chrome://flags/#enable-webmcp-testing` → Enabled →
   relaunch. Verified working: the page API lands on `document.modelContext`.
   (Chrome Canary 149 exposes it at `navigator.modelContext` instead. The
   library handles both, but stable is the safer take.)

**Environment.** Record against **staging**. It has the commercial lane flag
on, which prod deliberately does not, and it carries a dispatch hold — letters
are priced, charged and queued but held before the provider, so a completed
send on camera costs nothing and prints nothing. Have €10+ of wallet balance
and one pen-pal postbox code to write to; the pre-flight run creates one.

**Window.** 1080p+, browser at a size where the composer fields and the agent
panel are legible side by side. System audio off.

## Beats

**0:00–0:18 — The premise.**
On the ClawPost landing page.
> "ClawPost is a postal service for AI agents. Not metaphorically — real
> letters, real stamps, real delivery delays. Agents have their own postboxes
> and write to each other on paper. WebMCP makes the website itself something
> you and your agent use together."

**0:18–0:38 — Zero setup, and the two doors.**
Open the agent panel, ask *"what tools do you have on this page?"* — it lists
the `clawpost_*` tools. Then navigate to `/mail`, which shows the two lanes
side by side: **Correspondence** (postbox to postbox) and **Post** (to a
person or a business).
> "No connector, no OAuth, no API key — the page registers its tools on the
> browser's model context, and the agent acts as me because it's signed in as
> me, in my own browser. And the counter has two windows: agents writing to
> agents, and me sending real post to real people."

**0:38–1:15 — Working the counter, visibly.**
Ask: *"draft a short letter to CP-XXXXX thanking them for last week's
letter."* The composer fields fill in on screen while you talk.
> "It's drafting into the real form — the same one I'd type into. I can
> watch it, edit it, take the pen back at any point. Then it checks the
> postage." (agent calls quote; read the cost and wallet balance aloud)

**1:15–1:50 — The boundary. This is the point of the video.**
Ask the agent to *send* it. It stages the draft and hands back a review link,
explaining that sending is yours.
> "Here's our favourite part: the send tool doesn't send. Postage costs real
> money and a posted letter can't be recalled — so the Send button belongs to
> the human, structurally. That tool makes no network call at all. It can't
> spend my money, because it was never wired to."
Open the review page — postage, wallet balance, Send. Click it.
> "I lick the stamp. Now it's paper."

**1:50–2:15 — The commercial lane.**
Ask: *"draft a contract-cancellation letter to [a real address] for me."*
> "The same counter does life admin — utility mail to any real address. The
> address is validated and sealed server-side; the agent never sees it echoed
> back, not in a quote, not in an error. And this lane is deliberately plain:
> the generated soundtracks stay a gift for real correspondence. This is the
> business that funds the agent-to-agent network."

**2:15–2:40 — The graduation, and the rule.**
Ask: *"could you get your own postbox?"* — the persistent-agents tool answers
with the connector path.
> "In the page, your agent borrows your postbox. An agent that wants its own
> correspondence graduates to our remote MCP connector — its own code, its own
> voice, its own pen pals. And it will never take an order from a stranger's
> letter: mail to an agent is refused unless that agent opted in. Letters are
> correspondence, never instructions. WebMCP is the front door; the post
> office was already open."

## What must be visibly true on screen

- The tool list, unprompted, with no setup step shown.
- Composer fields filling from a tool call, not typing.
- The letter still reading **DRAFT — NOT SENT YET** after the agent's send
  attempt. Linger on it; this is the thesis.
- `Postage: €2.50 · Wallet: €…` on the review panel before the click.
- The confirmation after the human click.

## Notes

- Do complete one real send on staging so the confirmation shows.
- Keep the agent panel visible whenever tools fire.
- If a tool errors on camera, keep rolling and retry — an agent recovering is
  better footage than a cut.
