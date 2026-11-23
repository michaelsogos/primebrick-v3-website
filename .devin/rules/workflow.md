---
trigger: always_on
---
# Devin Workflow Rule: Tic-Toc Planning

## Trigger
- Applies automatically at the start of any new session.
- Triggered whenever a new feature, refactor, debt management, or bugfix is requested.

## Documentation deep-dive — MANDATORY gate before TIC and TOC

No phase ever starts on memory or code examples alone. Before entering
EITHER phase the agent MUST run a thorough documentation pass across
**every repo the task's domain touches** — `AGENTS.md`, `.devin/rules/*`,
`docs/ai/*`, `docs/dev-guide/*` in each of them. Docs are the contract;
source code is only the proof.

- **Before TIC** (Analysis Phase → plan file): map the task's domain to
  the repos it concerns, read the relevant rules and canonical docs in
  each of them, and cite the doc findings in the plan — file paths,
  never memory.
- **Before TOC** (execution after `PROCEED`): re-read the docs governing
  the areas the plan touches — they are the authority the change must
  satisfy, and they may have changed since planning. A doc-vs-plan
  conflict stops execution and goes back to the user; it is never
  resolved silently.

Skipping this gate is a protocol violation — wrong locale codes, wrong
icon vocabulary and anatomy drift all trace back to skipped doc reads.

## Actions
1. **Analysis Phase**: Analyze the codebase to fully understand the requirements, but **DO NOT modify any source code files** during this phase.
2. **File Creation**: Automatically generate a new Markdown plan file inside the directory `d:\git\primebrick\primebrick-workspace\ai-plans\`. You are free to decide the file name based on the task context (e.g., `feature-xyz-plan.md` or `bugfix-abc-plan.md`). Ensure the file uses the `.md` extension. When in plan mode please use sub-agents to create the plan file.
3. **Plan Generation**: Write a detailed, structural action plan inside this generated Markdown file. Include objectives, impacted files, architectural changes, and precise acceptance criteria; with code examples.
4. **MANDATORY BLOCKER**: Once the file is saved, output this exact message in the chat: *"Planning complete. I have created the plan file inside your ai-plans folder. Awaiting approval."* 
5. **HALT EXECUTION**: Stop immediately. **DO NOT** execute any coding, terminal commands, or subagents until the user explicitly sends the keyword: **"PROCEED"**.

## Tests are deliverables — final specs from the first write

Every behavioral verification written during a task MUST land as a
final, persistent test in its canonical location — the first draft is
already the deliverable and is refined incrementally; it is never a
throwaway probe deleted after it passes.

- Writing the same check twice — a temporary script now, the real
  spec later — is forbidden wasted work.
- A deleted probe deletes its proof: any behavior only ever verified
  by a temporary file counts as UNVERIFIED until the persistent spec
  exists.
- Exploratory checks run inside the final spec while it is developed,
  never in scratch files; assertions sharpen as evidence arrives.

## Plan-first — MANDATORY for every governed task

Any request in this workflow's scope (feature, refactor, debt, bugfix)
runs under an open plan file in `primebrick-workspace/ai-plans/` — the
plan is the ledger of record and the memory that survives the session.

- **No plan exists → create it in TIC, before any TOC work.** Starting
  execution without a plan file is a protocol violation.
- **The turn names its governing plan** — which file and which task rows
  it executes. Work outside the plan's rows is added to the table first
  or deferred — never shipped unrecorded.
- **A deviation from the plan is a STOP** — update the plan to the new
  shared direction first; silent drift is the violation.
- **The ledger is updated before the turn ends** — ✅ with commit
  hashes, ⏳ with what remains.
