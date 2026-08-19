# Devin Rule: Chunked Editing to Avoid Heap OOM

## Trigger
- Applies whenever an AI agent edits or creates files in this repository,
  especially during long refactoring sessions, large page creation, or any
  task that touches many files or very large files.
- Applies to `write`, `edit`, and `read` tool usage patterns.

## Problem

A single `write` call that replaces an entire large file (e.g. a 40 KB+ Astro
page or a long translations object) loads the full old content AND the full new
content into the agent's working memory at once. During a long session with
many such operations, heap usage compounds and the agent can hit an
out-of-memory (OOM) condition, causing it to get stuck or crash mid-task.

This is especially common when:
- Creating multiple long HTML/Astro PoC pages in one session.
- Rewriting a large `translations.ts` file in a single `write` call.
- Refactoring several large files by reading + re-writing each one.

## Actions

### 1. Prefer small `edit` calls over full-file `write` calls

When modifying an **existing** file, use the `edit` tool with the smallest
possible `old_string` / `new_string` pairs. The `edit` tool only holds the diff
in memory, not the entire file. Chain multiple small `edit` calls rather than
one giant `write` that replaces the whole file.

**Good:**
```
edit(file, old="  developer: { ... small block ... }", new="  developer: { ... updated block ... }")
edit(file, old="  techLeader: { ... small block ... }", new="  techLeader: { ... updated block ... }")
```

**Bad:**
```
write(file, entire_3000_line_file_content)  // loads everything into heap
```

### 2. For new long files, accept a single `write` but split the work

When a **new** file must be long (e.g. a rich PoC HTML page or a new Astro
page with many sections), a single `write` is acceptable because there is no
old content to hold. However:

- If the file would exceed ~50 KB, consider whether it should be split into
  two files (e.g. a page + a partial component, or a page + a data file).
- Do NOT re-read and re-write the same new file repeatedly to "add one more
  section" — that compounds heap pressure. Plan the full content before the
  first `write`, or use targeted `edit` calls to append sections afterwards.

### 3. Avoid read-then-write loops on the same file

Do NOT follow this pattern:
```
read(file)  → write(file, modified_full_content)
read(file)  → write(file, modified_full_content)
read(file)  → write(file, modified_full_content)
```

Each cycle holds the full file twice. Instead:
- Read once.
- Apply all changes as a sequence of small `edit` calls.
- Only re-read if you genuinely lost track of the current state.

### 4. Batch independent edits in parallel tool calls

When several `edit` calls target **different files** (or non-overlapping
regions of the same file), issue them in a single parallel tool block. This
reduces round-trips without increasing peak heap, because each edit only holds
its own small diff.

### 5. Use subagents for very large multi-file tasks

If a task involves creating or rewriting many large files (e.g. 6+ persona
pages, each 30 KB+), consider delegating one file per background subagent.
Each subagent has its own heap, so the main session stays light. Collect the
results when they finish.

### 6. Size budget per session

As a rough guideline:
- Keep individual `write` calls under ~40 KB when possible.
- Keep the number of full-file rewrites per session under ~10.
- If you notice you are approaching these limits, switch to `edit` calls or
  delegate to subagents.

## Enforcement

- AI agent MUST prefer `edit` over `write` for modifications to existing files.
- AI agent MUST NOT re-read and re-write the same file more than once per
  session unless the state is genuinely unknown.
- AI agent SHOULD delegate very large multi-file creation tasks to background
  subagents (one file per subagent) to keep the main session heap low.
- AI agent SHOULD split any new file that would exceed ~50 KB into smaller
  files when the architecture allows it.
