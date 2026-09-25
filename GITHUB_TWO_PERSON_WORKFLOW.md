# TRACEX — GITHUB TWO-PERSON WORKFLOW & GIT HYGIENE MANUAL
**Lead Authors:** Person 1 (Apoorv) & Person 2 (Anvesh)  
**Target Repository:** `https://github.com/anveshr312-bit/TraceX.git` / `https://github.com/apoorvgarewal07/TraceX.git`

---

## 1. Core Architecture of Responsibility

To avoid merge conflicts, code collisions, and overwritten work, the codebase is strictly partitioned:

| Domain | Directory / Files | Primary Owner | Secondary Reviewer |
| :--- | :--- | :--- | :--- |
| **Backend & Blockchain** | `backend/blockchain/`, `backend/database/`, `backend/scraper/` | **Person 1 (Apoorv)** | Person 2 |
| **API Endpoints & Schemas** | `backend/api/` | **Person 1 (Apoorv)** | Person 2 (Contract review) |
| **Intelligence Rules R1–R8** | `backend/intelligence/` | **Person 2 (Anvesh)** | Person 1 |
| **AI Copilot & Guardrails** | `backend/copilot/` | **Person 2 (Anvesh)** | Person 1 |
| **Legal Notice Generator** | `backend/legal/` | **Person 1 (Apoorv)** | Person 2 |
| **Modern Frontend (`new-ui`)**| `new-ui/` | **Person 2 (Anvesh)** | Person 1 |
| **Shared Docs & Plans** | Root `.md` files | **Co-Owned** | Both |

---

## 2. Remote & Repository Setup

Both developers must configure identical remote tracking:

```bash
# Check current remotes
git remote -v

# If needed, set origin to shared repository
git remote set-url origin https://github.com/anveshr312-bit/TraceX.git
# Or add peer as remote:
git remote add apoorv https://github.com/apoorvgarewal07/TraceX.git
git remote add anvesh https://github.com/anveshr312-bit/TraceX.git

# Fetch all branches
git fetch --all --tags
```

---

## 3. Branching Strategy

- **`main`**: The pristine, protected demo branch. Must build cleanly at all times. Direct pushes to `main` are prohibited.
- **Person 1 Feature Branches:** `feature/p1-phase-<number>-<slug>`
  - Example: `feature/p1-phase-2-auth-cases`
  - Example: `feature/p1-phase-4-taint-attribution`
- **Person 2 Feature Branches:** `feature/p2-phase-<number>-<slug>`
  - Example: `feature/p2-phase-2-auth-cases-ui`
  - Example: `feature/p2-phase-8-copilot-ui`

---

## 4. Daily Workflow Commands

### Step 1: Starting a New Phase / Task
Always branch from the latest updated `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/p1-phase-2-auth-cases
```

### Step 2: Committing Changes
Follow Conventional Commits with person and phase indicators:
- `feat(p1-p2): add User and Case SQLAlchemy models`
- `fix(p1-p3): enforce 66-character regex on fraud_tx_hash`
- `feat(p2-p5): add svg gold glow animation for finding edge matches`
- `chore(p2-p12): run final production build and lint checks`

```bash
git status
git add backend/database/schemas.py
git commit -m "feat(p1-p2): define User and Case database models"
```

### Step 3: Pushing Feature Branch
```bash
git push -u origin feature/p1-phase-2-auth-cases
```

### Step 4: Syncing with Peer's Latest Changes
Before opening a PR or merging into `main`, rebase or pull latest `main`:

```bash
# Fetch latest from remote
git fetch origin

# Rebase feature branch on top of main
git checkout feature/p1-phase-2-auth-cases
git rebase origin/main

# If conflicts occur:
# 1. Inspect conflicted files
# 2. Resolve conflict markers (<<<<<<<, =======, >>>>>>>)
# 3. Stage resolved files: git add <resolved-file>
# 4. Continue rebase: git rebase --continue
# (To abort if messy: git rebase --abort)

# Force-with-lease push after successful rebase
git push --force-with-lease origin feature/p1-phase-2-auth-cases
```

---

## 5. Pull Requests & Merge Order

### Strict Merge Sequence
1. **Person 1 merges Backend Phase PR first.** (e.g. `feature/p1-phase-2-auth-cases` -> `main`).
2. Person 1 posts in Slack/Discord/WhatsApp: *"Phase 2 backend merged. Endpoints live: `/api/v1/auth/login`, `/api/v1/cases`."*
3. **Person 2 rebases UI Phase branch on `main`**:
   ```bash
   git checkout feature/p2-phase-2-auth-cases-ui
   git fetch origin
   git rebase origin/main
   ```
4. Person 2 flips stubs in `new-ui/src/api/client.ts` (`USE_AUTH_STUB = false`), verifies against live backend, and runs `npm run build`.
5. **Person 2 merges UI Phase PR second.** (e.g. `feature/p2-phase-2-auth-cases-ui` -> `main`).

### Pull Request Checklist Before Merging:
- [ ] For Backend: `pytest backend/tests/` passes with 0 failures.
- [ ] For Frontend: `npm run build` passes in `< 10s` with 0 TypeScript errors.
- [ ] For Frontend: `npm run lint` passes with 0 errors.
- [ ] Peer has approved the PR.
- [ ] Merge method: **Squash and Merge** or **Rebase and Merge** (keeps `main` history clean and bisect-friendly).

---

## 6. Resolving Merge Conflicts

Because backend (`backend/`) and frontend (`new-ui/`) live in separate directories, merge conflicts should be rare. If a conflict occurs in shared files:

### Conflict in Root Documentation / Schemas
1. Open conflicted file in IDE.
2. Accept incoming changes from peer if they own that section.
3. If both edited root `README.md` or a config:
   ```bash
   git checkout --ours <file>    # Keep your version
   # or
   git checkout --theirs <file>  # Keep peer's version
   ```
4. Verify tests still pass:
   ```bash
   pytest backend/tests/
   npm run build --prefix new-ui
   ```
5. Stage and complete:
   ```bash
   git add <file>
   git commit -m "chore: resolve merge conflict between p1 and p2"
   ```

---

## 7. Emergency Rollback Protocol

If a bad commit or broken dependency lands on `main` right before a demo:

### Safe Non-Destructive Rollback (Recommended):
```bash
# Identify the offending commit hash
git log -n 5 --oneline

# Create a revert commit that inverses the changes
git revert <commit-hash>
git push origin main
```

### Emergency Local Hard Reset (Use Only if Main is Corrupted Locally):
```bash
# Stash any uncommitted work
git stash

# Reset local branch to the last known healthy tag
git reset --hard pre-frontend-retirement
# Or reset to specific commit
git reset --hard 90ccc7b
```

---

## 8. Milestone Tags

Tag major phase completions so you can instantly rollback or showcase specific milestones:

```bash
# Tagging Phase 0 baseline:
git tag -a v0.0-baseline -m "Phase 0: Baseline verified"

# Tagging Phase 5 intelligence completion:
git tag -a v0.5-intelligence -m "Phase 5: R1-R8 rule engine integrated"

# Tagging Phase 9 evidence complete:
git tag -a v0.9-evidence -m "Phase 9: Bitwise tamper verification complete"

# Final Demo freeze:
git tag -a v1.0.0-final -m "TraceX Final Hackathon Release Freeze"

# Push tags to remote:
git push origin --tags
```
