# Sudoku 1v1 - Implementation Guide

## Commands

```bash
bun run dev          # Start Vite dev server
bun run test         # Run tests once (vitest run)
bun run test:watch   # Run tests in watch mode
bun run lint         # Check lint + format (biome check)
bun run lint:fix     # Auto-fix lint + format (biome check --write)
bun run typecheck    # TypeScript check (tsc --noEmit)
bun run ci           # Full CI: lint + typecheck + test
```

## Architecture

- **Frontend**: Vite + React 19 + Tailwind CSS 4
- **Real-time server**: PartyKit (Cloudflare Durable Objects)
- **Testing**: Vitest + React Testing Library
- **Lint/Format**: Biome (tabs, double quotes, semicolons)

See `spec.md` for full product specification.

## Git Workflow — MANDATORY

### Atomic Conventional Commits

Every commit is atomic and follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

<why this change was made — motivation, context, trade-offs>
<what it enables or unblocks>
```

The **subject line** says what changed. The **body** says why.
Every commit MUST have a body unless it is a trivial fixup. The body explains the reasoning, not a restatement of the diff.

Types: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`, `style`, `ci`

Scopes: `engine`, `board`, `numpad`, `controls`, `solo`, `multiplayer`, `lobby`, `ui`, `hooks`, `server`, `types`

Examples:
```
test(engine): add puzzle generation and solving tests

Validates that generated puzzles have correct clue counts per
difficulty, solutions preserve given clues, and every row/column
contains digits 1-9. These tests define the contract for the
sudoku engine before implementation.
```
```
feat(engine): implement puzzle generation and solving

Uses the `sudoku` npm package (0-8 based) and maps to our 1-9
format. Difficulty controls clue count by randomly removing
givens from the generated puzzle. Conflict detection scans
row/col/box for duplicate values.
```
```
fixup! feat(engine): implement puzzle generation and solving

Fix off-by-one in difficulty clue range — expert was generating
puzzles with too many clues.
```

### Commit Cadence — After Every TDD Cycle

Commit **immediately** after each vertical slice (RED→GREEN→REFACTOR) completes:

1. **RED** → write ONE failing test → commit: `test(<scope>): <what is being tested>`
2. **GREEN** → write minimum passing code → commit: `feat(<scope>): <what was implemented>`
3. **REFACTOR** → clean up → commit: `refactor(<scope>): <what was improved>`

If the refactor step has no changes, skip that commit. The point is: every passing state gets committed.

**Never batch multiple tests before implementing.** See `.claude/skills/tdd/SKILL.md` for the full TDD workflow.

### Fixup Commits

When a change logically belongs to a previous commit (typo, rename, lint fix, missed edge case):

- Use `git commit --fixup=<sha>` to create a fixup commit
- Fixup commits still get a description body explaining *why* the fixup is needed
- This keeps history clean and allows `git rebase --autosquash` later
- For renames, style fixes, import reordering — always fixup the originating commit
- Never amend published commits; always append fixup commits

### Commit Hygiene

- Each commit must leave the project in a **passing state**: lint + typecheck + tests green
- Stage specific files, never `git add -A` or `git add .`
- Never commit `.env`, secrets, or `node_modules`
- Use `BACKLOG.md` transitions as part of the relevant feature commit (not separate commits)

## Task Tracking — BACKLOG.md

All tasks are tracked in `BACKLOG.md` at the project root. This file is git-tracked and serves as the single source of truth for project status.

Update `BACKLOG.md` as part of the commit that completes or starts work on a task — not as a separate commit.

## TDD Workflow — MANDATORY

Follow the TDD skill in `.claude/skills/tdd/SKILL.md`. Key rules:

- **Vertical slices only**: ONE test → ONE implementation → repeat. Never batch tests.
- **Plan first**: Confirm interface and behaviors with the user before coding.
- **Test behavior, not implementation**: Tests use public interfaces, survive refactors.
- **Mock only at system boundaries**: See `.claude/skills/tdd/mocking.md`.
- Never write implementation code without a corresponding test.
- Tests go next to the file they test (`*.test.ts` / `*.test.tsx`).

## Project Conventions

### File Structure
- Components: `src/components/ComponentName.tsx` — React functional components
- Hooks: `src/hooks/useHookName.ts` — custom React hooks
- Library: `src/lib/` — pure logic, no React dependency
- Server: `src/party/` — PartyKit server code
- Tests: colocated as `*.test.ts` / `*.test.tsx`

### Code Style (enforced by Biome)
- Tabs for indentation
- Double quotes for strings
- Semicolons always
- Organize imports automatically

### Component Patterns
- Functional components only
- Props typed inline or with `type` (not `interface`)
- Tailwind classes for styling — no CSS modules, no styled-components
- Use `className` composition, not conditional class libraries (keep deps minimal)

### State Management
- React hooks (useState, useReducer) — no external state library
- `useSudoku` hook owns all game state for a single board
- `useMultiplayer` hook manages PartyKit connection and room state

### Types
- All shared types in `src/lib/types.ts`
- Use `type` over `interface`
- Discriminated unions for message types

## Key Design Decisions

- **Soft validation**: Conflicts shown visually, not blocked. Board complete only when all filled + valid.
- **Server-authoritative**: Server holds puzzle solution, validates completion. Client never sees solution.
- **Board sharing**: Sharer's cells become locked/given on both boards. Notes not shared.
- **Numpad positions**: Bottom (default), Left, Right. Persisted in localStorage.
- **No accounts**: Nickname + random color. sessionStorage for reconnect identity.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->