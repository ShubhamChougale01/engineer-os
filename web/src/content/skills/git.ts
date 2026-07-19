import type { SkillContent } from "../types";

/**
 * Git — full 50-section knowledge page.
 * Note: code blocks use ~~~ fences (CommonMark-equivalent to backtick fences)
 * so this file needs no backtick escaping inside the template literals.
 */
const git: SkillContent = {
  overview: `
Git is a distributed version control system (DVCS): a tool that tracks changes to a set of files over time so that any previous state can be recovered, compared, merged, or blamed on a specific person and reason. Unlike centralized systems, every clone of a Git repository is a full copy of the project's entire history — there is no single server whose loss destroys the record.

For an AI engineer, Git is not a "nice to have" — it is the substrate everything else sits on. Model training code, data pipeline definitions, infrastructure-as-code (see the **Terraform** skill), notebook experiments, prompt templates, and CI/CD pipeline definitions (see the **CI/CD**, **GitHub Actions**, and **Jenkins** skills) are all version-controlled with Git. Every pipeline in every one of those tools is triggered by a Git event — a push, a tag, a pull request. You cannot reason about deployment automation without first understanding what a "commit" and a "branch" actually are underneath the porcelain commands.

Key characteristics: distributed (every clone has full history), content-addressable (every object is identified by the SHA-1/SHA-256 hash of its content, not a filename or sequence number), snapshot-based (not diff-based — each commit is a full snapshot of the tree, with objects shared/deduplicated automatically), and built around cheap, instant branching. That last property changed how teams collaborate more than any single feature: creating a branch in Git is writing 41 bytes to a file, not copying a directory tree, which is why feature branches, trunk-based development, and pull-request workflows are all economically viable in a way they weren't with older systems like CVS or Subversion.

Git deliberately separates the **plumbing** (the low-level object model: blobs, trees, commits, refs) from the **porcelain** (the user-facing commands: add, commit, merge, rebase). This page teaches the plumbing first, because once you understand that a branch is just a movable pointer to a commit and a commit is just a snapshot with a parent link, nearly every "surprising" Git behavior — merge conflicts, detached HEAD, force-push, reflog recovery — stops being surprising and becomes a direct, predictable consequence of the model.
`,

  history: `
Git was created by **Linus Torvalds** in April 2005 to manage development of the Linux kernel. The immediate trigger was the withdrawal of free use of BitKeeper, the proprietary DVCS the kernel project had used since 2002, after a dispute over a reverse-engineering effort by a community member. Torvalds needed a replacement in days, not months, and had strong opinions from years of watching BitKeeper (and disliking CVS/Subversion) about what a version control system for a massive, distributed, no-central-authority project needed: speed, strong integrity guarantees against corruption or tampering, and support for thousands of parallel branches.

| Year | Milestone |
|------|-----------|
| 2002 | Linux kernel adopts BitKeeper (proprietary DVCS) |
| 2005 (Apr) | BitKeeper's free tier is withdrawn; Torvalds starts writing Git |
| 2005 (Apr–Jun) | Git self-hosts: it manages its own source within days; first tagged release |
| 2005 | Junio Hamano becomes the primary maintainer, a role he still holds |
| 2008 | GitHub launches, adding a social, web-based layer (pull requests, issues) on top of Git |
| 2010 | GitLab launches, later adding self-hosted CI/CD around Git |
| 2011 | Git 1.7.x popularizes rebase-based and pull-request workflows industry-wide |
| 2014–2017 | Git LFS (Large File Storage) emerges to handle binary/model-weight assets |
| 2017 | git worktree becomes standard, allowing multiple working directories from one repo |
| 2018 | GitHub introduces required status checks and protected branches as mainstream practice |
| 2020 | Git begins the transition path to SHA-256 as an alternative to SHA-1 (SHA-1 remains the default) |
| 2022–2023 | git-filter-repo becomes the recommended replacement for the deprecated filter-branch and BFG for history rewriting |
| 2023–2024 | Trunk-based development and short-lived branches become the dominant advice for teams with mature CI/CD |

Git's name is a self-deprecating British slang term for an unpleasant person — Torvalds joked that he names all his projects after himself, and this one was no exception. The design goals he stated at the outset — "take CVS as an example of what not to do; distributed, BitKeeper-style workflow; very strong safeguards against corruption; very fast" — are still legible in the tool today.
`,

  "why-it-exists": `
Before Git, the dominant version control systems were centralized: **CVS** and **Subversion (SVN)**. In that model, one server holds the single true history, and every commit is a network round-trip to that server. This created real gaps:

- **A single point of failure.** If the central server's disk failed and backups were stale, project history could be permanently lost.
- **Slow, network-dependent operations.** Committing, diffing against history, and browsing log all required a live connection to the server. Offline work was crippled — you could edit files, but not commit, branch, or see history.
- **Expensive branching.** In Subversion, a branch was a full directory copy on the server; branching and merging were rare, high-friction events reserved for major releases, not everyday feature work.
- **No cryptographic integrity story.** Corrupted or tampered history was hard to detect.
- **No natural model for massively distributed, no-central-authority collaboration** — exactly the situation of the Linux kernel, with thousands of contributors and no single company owning the repository.

Git's answer was architectural, not incremental: make every clone a complete, independent repository with full history, make branches free (a pointer, not a copy), make every object content-addressed so corruption and tampering are detectable by construction, and make the common operations (commit, diff, log, branch, merge) local and instant. The "distributed" part is the load-bearing idea — it is why open-source projects with no central maintainer-employer (Linux, and later huge swaths of the industry) could scale collaboration the way they have.
`,

  "problem-it-solves": `
Git removes several concrete pains:

- **"Whose change broke this, and when?"** — git blame and git bisect turn a fuzzy question into a precise, automatable search over history.
- **Losing work.** Local commits, the stash, and the reflog (Git's safety net, covered in depth in Advanced Concepts) mean that "I did something and now my work is gone" is almost always recoverable — Git rarely deletes data outright; it usually just stops pointing at it.
- **Fear of trying things.** Because branches are nearly free and merging is a first-class operation, engineers can experiment on a branch, throw it away, or merge it back, without touching the main line of work.
- **Coordinating many people on the same files.** Three-way merge algorithms (covered in Internal Working) let two people change different parts of the same file and have Git combine both changes automatically, only asking a human when the same lines genuinely conflict.
- **Reproducing exact historical states.** Every commit is a full, addressable snapshot — "check out the exact code that shipped as v2.3.1" is a single command, not an archaeology project.
- **Offline work.** Commit, branch, diff, and log all work with zero network access; only push and fetch/pull need connectivity.

What Git deliberately does **not** solve:

- **Storing large binaries efficiently.** Git's model assumes text-like content that diffs and compresses well; large binary assets (datasets, model checkpoints, video) bloat every clone forever unless you use an extension like Git LFS, or better, keep them out of Git entirely (object storage + a manifest).
- **Access control and code review workflow.** Git itself has no concept of a "pull request," required reviewers, or permissions — that's a hosting-platform concern (GitHub, GitLab, Bitbucket) layered on top.
- **Build/release automation.** Git tracks source; it does not build, test, or deploy anything by itself — that is the job of the CI/CD, GitHub Actions, and Jenkins skills, which listen for Git events and react to them.
- **Semantic understanding of changes.** Git's merges are textual/line-based; it has no idea that two changes to a function are semantically incompatible if they don't textually overlap. Tests, not Git, catch that class of bug.
`,

  "learning-objectives": `
By the end of this page you should be able to:

1. Explain Git's object model precisely: blobs, trees, commits, and refs, and derive by hand how a commit's SHA is computed from its content.
2. Describe the three-tree architecture (working directory, staging area/index, repository) and say exactly what add, commit, checkout, and restore each move between them.
3. Correctly explain that a branch is a movable pointer to a commit, not a copy of files — and predict what happens to that pointer on each new commit.
4. Choose between merge and rebase for a given situation, and explain why rebasing already-pushed/shared history is dangerous.
5. Resolve a real merge conflict by reading conflict markers and reconstructing the intended result.
6. Use the reflog to recover a commit that no branch or tag points to anymore.
7. Use git bisect to binary-search a regression down to the exact introducing commit.
8. Use cherry-pick, stash, and tags (lightweight vs annotated) correctly and know when each is the right tool.
9. Design a sane .gitignore and explain why committed secrets and binaries are a recurring, serious real-world problem.
10. Rewrite history safely with interactive rebase and git-filter-repo, and state the hard rule about not rewriting pushed shared history.
11. Set up local Git hooks (pre-commit, pre-push) for automation, and compare trunk-based development against Git Flow as competing branching strategies.
`,

  prerequisites: `
- **Required**: comfort with a command-line shell (navigating directories, running commands, reading output) — see the **Linux** skill if you need this first. No prior version control knowledge is assumed; this page starts from zero.
- **Helpful**: basic understanding of file systems (files vs directories, paths) and of what a hash function is (input bytes in, fixed-size fingerprint out) — the object model leans on this.
- **For the internals sections**: no cryptography background is required; SHA-1/SHA-256 are treated as "black box, deterministic fingerprint functions," which is all you need.

Dependency links on this platform: **Linux** (shell fluency) → this page → **CI/CD**, **GitHub Actions**, **Jenkins** (pipelines that trigger on Git events) → **Terraform** (infrastructure code that is itself version-controlled with Git, including remote state considerations) → **Docker**, **Kubernetes** (deployment artifacts built from Git-tracked Dockerfiles/manifests).
`,

  "beginner-concepts": `
### Initializing and the first commit

~~~bash
git init                       # create a new repository (adds a .git/ directory)
git clone https://github.com/org/repo.git   # copy an existing repository, with full history

git status                     # what's changed, what's staged, what branch am I on
git add file.py                # stage a specific file
git add .                      # stage everything changed in the current directory
git commit -m "Add pricing module"   # snapshot the staged content
~~~

A repository is just a project directory plus a hidden **.git/** subdirectory that holds the entire object database and metadata. Delete .git/ and you have an ordinary folder with zero history — worth remembering before you assume something is "backed up."

### Viewing history

~~~bash
git log                        # full commit history, newest first
git log --oneline --graph --all   # compact, visual, every branch
git show HEAD                  # the diff introduced by the current commit
git diff                       # unstaged changes vs the index
git diff --staged              # staged changes vs the last commit
~~~

### Branching basics

~~~bash
git branch                     # list local branches
git branch feature/login       # create a branch (does NOT switch to it)
git switch feature/login       # switch to it (modern command)
git switch -c feature/signup   # create AND switch in one step
git checkout feature/login     # the older, multi-purpose equivalent of switch
~~~

git switch and git restore (added in Git 2.23) split the overloaded, historically confusing git checkout into two focused commands: switch changes branches, restore changes files. Prefer them for clarity; checkout still works everywhere and appears constantly in older docs and scripts.

### Undoing things, the safe way first

~~~bash
git restore file.py             # discard unstaged changes to a file
git restore --staged file.py    # unstage a file (keep the edits)
git commit --amend -m "Fix typo in message"   # rewrite the LAST commit only

# Undo a commit that is already pushed/shared: add a NEW commit that reverses it
git revert <commit-sha>
~~~

git revert is the beginner-safe undo: it never deletes history, it adds a new commit that undoes a previous one — safe on shared branches. Contrast with git reset, which moves the branch pointer and can discard commits (covered once branches-as-pointers is established, later on this page).

### Remotes: talking to other copies of the repository

~~~bash
git remote -v                   # list configured remotes (usually "origin")
git remote add origin https://github.com/org/repo.git
git fetch origin                # download new commits/branches, don't touch your files
git pull                        # fetch + merge (or rebase, if configured) into your current branch
git push origin feature/login   # upload your commits to the remote branch
~~~

The single most important beginner mental model: your local repository and the remote are two independent, full copies of history. fetch and pull only bring data toward you; push only sends data away from you. Nothing happens automatically in either direction — every synchronization is an explicit command.
`,

  "intermediate-concepts": `
### Merging vs. fast-forward

~~~bash
git switch main
git merge feature/login          # combine feature/login's commits into main
~~~

If main has not moved since feature/login branched off, Git performs a **fast-forward**: it simply slides the main pointer forward to feature/login's tip — no new commit, no merge conflict possible, because there was nothing to reconcile. If main HAS moved (both branches added commits), Git creates a **merge commit** with two parents, combining both histories. Understanding which case you're in explains most "why didn't this create a merge commit" confusion.

### Resolving a conflict

~~~bash
git merge feature/pricing
# Auto-merging pricing.py
# CONFLICT (content): Merge conflict in pricing.py
~~~

Git leaves conflict markers directly in the file:

~~~text
<<<<<<< HEAD
DISCOUNT_RATE = 0.10
=======
DISCOUNT_RATE = 0.15
>>>>>>> feature/pricing
~~~

Everything between <<<<<<< HEAD and ======= is your current branch's version; everything between ======= and >>>>>>> branch-name is the incoming version. Resolve by editing the file to the correct final content, removing all three marker lines, then:

~~~bash
git add pricing.py               # mark the conflict as resolved
git commit                       # completes the merge commit
~~~

### Stashing work in progress

~~~bash
git stash                        # shelve uncommitted changes, restore a clean working directory
git stash list                   # see shelved stashes
git stash pop                    # reapply the most recent stash and remove it from the list
git stash apply stash@{1}        # reapply a specific stash, keep it in the list
git stash -u                     # also stash untracked (new) files
~~~

Use stash when you need to switch branches urgently (a production hotfix) without committing half-finished work.

### Cherry-picking a single commit

~~~bash
git cherry-pick <commit-sha>     # apply one specific commit's changes onto the current branch
git cherry-pick <sha> --no-commit   # apply the changes but let you review/amend before committing
~~~

Common use: a bugfix landed on main needs to also ship on a release/hotfix branch, without merging all of main's other in-progress work.

### Tags: marking a point in history

~~~bash
git tag v1.2.0                              # lightweight tag: just a name pointing at a commit
git tag -a v1.2.0 -m "Release 1.2.0"        # annotated tag: full object with author, date, message
git push origin v1.2.0                      # tags don't push automatically — explicit by design
git push origin --tags                      # push all tags
~~~

Prefer **annotated** tags for anything meant to represent a release: they are full Git objects (see Internal Working) with their own SHA, message, and signature support (git tag -s), so they show up properly in git describe and carry provenance. Lightweight tags are fine for personal, throwaway bookmarks.

### git bisect: binary-searching a regression

~~~bash
git bisect start
git bisect bad                   # current commit is broken
git bisect good v1.2.0            # this known-good commit worked
# Git checks out a commit halfway between; you test it, then tell it:
git bisect good                  # or:
git bisect bad
# ...repeat; Git narrows the range each time until it names the exact bad commit
git bisect reset                 # return to where you started
~~~

For a history of N commits between good and bad, bisect finds the culprit in about log2(N) steps — 1,000 commits narrows to the exact offender in roughly 10 tests. git bisect run script.sh automates the whole loop if you have a script that exits non-zero on failure.

### .gitignore strategy

~~~text
# Language/build artifacts
__pycache__/
*.pyc
node_modules/
dist/
.env
.venv/

# Editor/OS noise
.vscode/
.DS_Store

# Never commit real secrets, even in examples
*.pem
*.key
secrets.*.json
~~~

.gitignore only prevents **untracked** files from being accidentally staged — it does nothing for files already committed. This is why committed secrets and accidentally committed binaries (checked-in virtual environments, model checkpoints, database dumps) are a recurring real-world incident: by the time someone adds the pattern to .gitignore, the file is already permanently in history unless you rewrite it (see Rewriting History in Advanced Concepts, and cross-reference the **Secrets Management** skill for the full incident-response playbook once a secret is confirmed leaked — rotation is mandatory even after removal from Git, because history that was ever pushed may already be cloned elsewhere).
`,

  "advanced-concepts": `
### Branches are pointers, not copies — the correction that unlocks everything

The single most common beginner misconception is that a branch is a separate copy of the project's files. It is not. **A branch is a 41-character file containing one thing: the SHA of the commit it currently points to.** Look at .git/refs/heads/main and you will find exactly that — one line, one hash. Creating a branch is writing one new small file; switching branches is updating the working directory to match the commit that file points to; committing on a branch is updating that one file to point at the new commit. This is why branching in Git is instantaneous and cheap regardless of repository size — there is no file copying involved at any point.

### HEAD and detached HEAD

**HEAD** is Git's pointer to "where you currently are" — normally it points AT a branch (which itself points at a commit), one level of indirection. git checkout <commit-sha> directly (instead of a branch name) puts you in **detached HEAD** state: HEAD now points straight at a commit, with no branch tracking your position. New commits made here are real commits, but nothing (no branch) references them, so if you switch away without creating a branch first (git switch -c rescue-branch), those commits become unreachable and are only recoverable via the reflog.

### Merge vs. rebase — the honest tradeoff

~~~bash
# Merge: combine histories with a merge commit, preserving exactly what happened
git switch main && git merge feature/login

# Rebase: replay feature/login's commits one by one on top of main's current tip
git switch feature/login && git rebase main
~~~

**Merge** preserves true history: it records exactly when each branch diverged and rejoined, with both parent lines intact. The tradeoff is a less linear, sometimes noisy log with merge-commit clutter.

**Rebase** rewrites feature/login's commits with new SHAs (same content, new parent), producing a clean, linear history as if the feature had been built sequentially on top of the latest main. The tradeoff is that it is literally rewriting history — every rebased commit gets a brand-new hash.

**Interactive rebase** additionally lets you edit that replayed history:

~~~bash
git rebase -i HEAD~4
# opens an editor with:
#   pick a1b2c3d Add login form
#   pick e4f5a6b Fix typo
#   pick 7c8d9e0 Add validation
#   pick f1a2b3c WIP debug print
# change "pick" to: squash (meld into previous), fixup (squash, drop message),
# reword (edit message only), drop (delete the commit), or reorder the lines
~~~

This is how a messy, exploratory commit sequence becomes a small number of clean, reviewable commits before a pull request.

**The hard rule: never rebase commits that have already been pushed and that anyone else might have based work on.** Because rebase creates new SHAs for "the same" commits, anyone who already pulled the old commits now has a history that has diverged irreconcilably from yours — their next pull produces duplicated commits or forces a confusing force-push resolution on both sides. The safe boundary is simple: rebase freely on commits that exist only in your local, unpushed, unshared branch; once pushed and others may have it, only add new commits (merge, revert) or coordinate explicitly (force-push with lease, with the whole team aware) — never rewrite silently.

### The reflog — Git's safety net

~~~bash
git reflog                       # every place HEAD has pointed, in this LOCAL repo, recently
# e4f5a6b HEAD@{0}: commit: Add validation
# a1b2c3d HEAD@{1}: checkout: moving from main to feature/login
# 9f8e7d6 HEAD@{2}: reset: moving to HEAD~1

git checkout e4f5a6b              # go look at a "lost" commit directly
git branch rescue e4f5a6b          # or make a real branch point at it, permanently
~~~

The reflog is local-only (never pushed, never cloned) and time-limited (entries expire, default 90 days for reachable, 30 for unreachable), but within that window it records essentially every HEAD movement — resets, rebases, branch deletions, checkouts. This is why a hard reset "losing" commits, or deleting a branch, is almost always recoverable: the commit objects themselves are not deleted immediately, and the reflog remembers where they were.

### Rewriting history safely: interactive rebase and filter-repo

For scrubbing an accidentally committed secret from history (not just the latest commit — from ALL of history, since the file was ever committed):

~~~bash
# Modern, recommended tool (replaces the deprecated git filter-branch)
pip install git-filter-repo
git filter-repo --path secrets.json --invert-paths   # remove the file from every commit, rewriting all SHAs after it
~~~

This rewrites every commit from the point of the leaked file onward — a repository-wide history rewrite, not a targeted fix. It requires force-pushing the result and, critically, coordinating with every other clone (they must re-clone or hard-reset, not merge/pull normally). And because the secret was ever pushed, treat it as compromised regardless of the rewrite: rotate the credential (see the **Secrets Management** skill). Rewriting history removes the evidence from future clones; it does not un-leak a secret that a prior clone, cache, or CI log already captured.

### Git hooks — local automation points

~~~bash
# .git/hooks/pre-commit  (make it executable: chmod +x)
#!/bin/sh
ruff check . || exit 1     # block the commit if linting fails
~~~

Hooks are scripts Git runs automatically at specific points: pre-commit (before a commit is created — lint/format/secret-scan), commit-msg (validate message format), pre-push (before uploading — run the fast test suite). Hooks live in .git/hooks/ and are NOT cloned with the repository (they're local, per-clone), which is why teams use a shareable wrapper like the **pre-commit** framework or **husky** (Node ecosystem) to distribute and install hook configuration as a tracked file, then symlink it in during setup.

### Trunk-based development vs. Git Flow

**Git Flow** (long-lived develop, feature, release, and hotfix branches with a strict merge choreography) gives strong isolation and a clear release process, at the cost of long-lived branches that drift far from each other and produce large, high-risk merges. **Trunk-based development** (one long-lived main/trunk, short-lived feature branches merged within a day or two, feature flags for anything not ready) minimizes merge pain and integrates continuously, at the cost of requiring strong CI/CD discipline and automated testing to keep trunk always releasable. See the **CI/CD** skill for how pipeline cadence and branching strategy are two halves of the same decision: trunk-based development assumes a pipeline that runs on every commit to main and can gate merges with required checks; Git Flow assumes pipelines gated at release-branch boundaries. Most modern, CI/CD-mature teams (and virtually all teams practicing continuous deployment) favor trunk-based development; Git Flow persists mainly in shrink-wrapped/versioned software with widely spaced release trains.
`,

  "internal-working": `
Git's entire model rests on one idea: it is a **content-addressable object store**. Every piece of data Git tracks — file contents, directory structures, commits — is stored as an object, and every object's name (its SHA) is a cryptographic hash of its own content. Two objects with identical content are, by definition, the same object; Git never stores the same content twice.

There are four object types:

~~~mermaid
flowchart TB
    C["commit object\n(tree SHA, parent SHA(s), author, committer, message)"] --> T["tree object\n(list of: mode, type, SHA, filename)"]
    T --> B1["blob object\n(raw file content, no filename)"]
    T --> T2["tree object (subdirectory)"]
    T2 --> B2["blob object"]
    Tag["tag object (annotated)\n(target SHA, tagger, message, signature)"] -.points to.-> C
    Ref["ref: refs/heads/main\n(just a SHA in a text file)"] -.points to.-> C
    Head["HEAD\n(usually points to a ref)"] -.points to.-> Ref
~~~

- **Blob**: the raw bytes of one file's content. No filename, no permissions — purely content. Two files anywhere in the repo with byte-identical content share one blob.
- **Tree**: a directory listing — a list of (file mode, object type, SHA, name) entries, each pointing to a blob (for a file) or another tree (for a subdirectory). A commit's whole file layout is one tree pointing recursively at subtrees and blobs.
- **Commit**: a snapshot pointer, not a diff. It records one tree SHA (the complete state of every file at that point), zero or more parent commit SHAs (one parent for a normal commit, two for a merge commit, zero for the very first commit), plus author, committer, timestamp, and message.
- **Ref**: a human-readable name (refs/heads/main, refs/tags/v1.2.0) that is nothing more than a text file containing a SHA. This is the entire mechanism behind branches (see Advanced Concepts).

### Worked example: how a commit's SHA is actually derived

Git hashes objects with a simple, inspectable recipe: take a header describing the object's type and byte length, concatenate the content, and run it through the hash function (SHA-1 by default in most repositories today; Git also supports SHA-256 repos).

~~~bash
# 1. Hash a blob's content directly, no repo needed
echo -n "hello world" | git hash-object --stdin
# -> 95d09f2b10159347eece71399a7e2e907ea3df4

# 2. What Git actually hashes is: "blob 11\0hello world"
#    ("blob", a space, the byte length, a NUL byte, then the raw content)
printf 'blob 11\0hello world' | sha1sum
# -> 95d09f2b10159347eece71399a7e2e907ea3df4  (matches!)

# 3. A commit object is hashed the same way, over ITS OWN text format:
#    "commit <len>\0tree <tree-sha>\nparent <parent-sha>\nauthor ...\ncommitter ...\n\n<message>\n"
git cat-file -p HEAD
# tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
# parent 8f94139338f9404f26296befa88755fc2598c289
# author Ada Lovelace <ada@example.com> 1732000000 +0000
# committer Ada Lovelace <ada@example.com> 1732000000 +0000
#
# Add pricing module
~~~

Feed that exact text (with the "commit N\0" header prepended) through SHA-1 and you get precisely the commit's SHA — git cat-file just shows you the object Git already hashed. This is the concrete mechanism behind three properties that otherwise feel like magic: (1) identical content anywhere is automatically deduplicated, because identical bytes hash identically; (2) any corruption or tampering, even one flipped bit, changes the hash, so Git can detect it instantly; (3) a commit's identity depends on its **parent's** SHA, which depends on **its** parent, all the way back — so a commit's hash is a fingerprint not just of its own snapshot but of its entire ancestry. Change any commit in the past and every descendant commit's SHA changes too, which is exactly why rebasing (replaying commits onto a new parent) produces all-new SHAs for every commit that follows.

### Packing and garbage collection

Loose objects (one file per object under .git/objects/) are simple but wasteful. Periodically (and always before a push), Git runs git gc, which packs objects into compressed **packfiles** storing similar objects as deltas against each other, and prunes objects that are no longer reachable from any ref, tag, or the reflog (with a grace period — see Advanced Concepts on the reflog).
`,

  architecture: `
### Repository-level architecture: three trees plus the object database

A senior engineer's mental model of a Git repository has four moving parts:

~~~mermaid
flowchart LR
    WD["Working Directory\n(files you edit)"]
    IDX["Staging Area / Index\n(what will go into the next commit)"]
    REPO["Repository (.git/objects)\n(committed history, content-addressed)"]
    REM["Remote (origin)\na full copy of the repository elsewhere"]

    WD -- "git add" --> IDX
    IDX -- "git commit" --> REPO
    REPO -- "git checkout / restore" --> WD
    IDX -- "git restore --staged" --> WD
    REPO -- "git push" --> REM
    REM -- "git fetch" --> REPO
    REPO -- "git merge / git pull (fetch+merge)" --> WD
~~~

- **Working directory**: the actual files on disk you edit with your editor. Git compares this against the index to show "unstaged changes."
- **Staging area (the index)**: a single binary file (.git/index) recording exactly which blob SHA is planned for each path in the next commit. git add copies a snapshot of a file's current content into the index (as a new blob, if the content is new); git commit takes what's in the index and freezes it into a tree + commit object. This intermediate step is what lets you stage part of a change and commit only that part (git add -p) while leaving other edits in the working directory uncommitted.
- **Repository / HEAD**: the permanent, content-addressed object database plus the ref pointing at your current position. Once something is a commit reachable from a ref, it is durable and (nearly) impossible to lose accidentally.
- **Remote**: a separate, independent repository (often on GitHub/GitLab/Bitbucket) with its own full object database; push and fetch are the only two operations that move objects between your repository and a remote's.

### Application-level architecture: how teams structure work around Git

~~~text
Trunk-based, CI/CD-driven layout (the modern default):

main (trunk)                — always releasable, protected, required CI checks
 ├─ feature/short-lived-1    — hours to ~2 days, merged via PR, then deleted
 ├─ feature/short-lived-2
 └─ hotfix/urgent-bug        — branches from main, merged back fast, tagged on release

Supporting structures:
 - .gitignore                — keeps generated/secret/binary files untracked
 - .gitattributes             — normalizes line endings, marks binary/LFS paths
 - .github/workflows/ or Jenkinsfile — CI/CD pipeline definitions, versioned alongside code
 - CODEOWNERS                 — required reviewers by path (platform feature, not Git core)
 - branch protection rules    — require PR + passing CI before merge to main (platform feature)
~~~

Two architectural decisions matter most: (1) keep branches short-lived so merges stay small and conflicts stay rare and shallow; (2) keep the pipeline configuration itself in the repository, versioned with the code it builds — this is precisely what the **CI/CD**, **GitHub Actions**, and **Jenkins** skills build on top of Git's event model (push, tag, pull-request-opened).
`,

  "data-flow": `
Tracing one commit from an edited file to a teammate's machine, through all three trees and across the network:

~~~mermaid
sequenceDiagram
    participant Dev as Developer's editor
    participant WD as Working Directory
    participant IDX as Index (staging area)
    participant Repo as Local repo (.git/objects)
    participant Origin as Remote (origin)
    participant Team as Teammate's local repo

    Dev->>WD: Save edited pricing.py
    Dev->>IDX: git add pricing.py
    IDX->>IDX: Hash new content -> blob SHA; record path -> SHA in index
    Dev->>Repo: git commit -m "Fix discount calc"
    Repo->>Repo: Build tree object(s) from index; create commit object\n(tree SHA + parent SHA + author/message); hash it
    Repo->>Repo: Move local branch ref (e.g. refs/heads/main) to new commit SHA
    Dev->>Origin: git push origin main
    Origin->>Origin: Verify fast-forward (or reject if remote has diverged commits)
    Origin->>Origin: Store new objects; move origin/main ref to new commit SHA
    Team->>Origin: git fetch origin
    Origin-->>Team: Transfer missing objects (packed, delta-compressed)
    Team->>Team: Update local origin/main tracking ref
    Team->>Team: git merge origin/main (or pull) updates their working directory
~~~

The step most people misunderstand is the push's fast-forward check: the remote will reject a push if its refs/heads/main points to a commit that is not an ancestor of the commit you're pushing — meaning someone else pushed in between your last fetch and now. Fixing this correctly means fetching, integrating their commits (merge or rebase locally), and pushing again — never force-pushing over someone else's work on a shared branch, which silently discards their commits from the remote (see the hard rule on rewriting shared history in Advanced Concepts).

For a pipeline-triggering perspective: the push event above is exactly what the **CI/CD**, **GitHub Actions**, and **Jenkins** skills hook into — a webhook fires the instant origin's ref moves, and the pipeline checks out that exact commit SHA to build, test, and deploy it.
`,

  "production-usage": `
### Configuration every professional sets up once

~~~bash
git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase true      # pull = fetch + rebase, not fetch + merge (keeps history linear)
git config --global core.autocrlf input   # (macOS/Linux) normalize line endings; "true" on Windows
~~~

### Signed commits for provenance

~~~bash
git config --global commit.gpgsign true
git config --global user.signingkey <KEY-ID>
git commit -S -m "Signed release commit"
~~~

Signed commits let a hosting platform show "Verified" and let downstream consumers cryptographically confirm who actually authored a commit — increasingly required in supply-chain-security-conscious organizations.

### Project layout conventions

- **.gitignore** and **.gitattributes** committed at the repo root from day one (see Beginner/Intermediate Concepts and Security).
- **CODEOWNERS** and branch protection (platform features, not Git itself) requiring passing CI and at least one review before merge to main.
- **Conventional commit messages** (feat:, fix:, chore:, docs:) so changelogs and semantic version bumps can be generated automatically by tooling.
- **Monorepo vs. polyrepo**: large orgs increasingly use monorepos (Google, Meta-style) with sparse-checkout and partial clone to keep individual developer clones fast despite enormous total history; most teams use one repo per deployable service.

### Handling large files

~~~bash
git lfs install
git lfs track "*.safetensors" "*.parquet"
git add .gitattributes
~~~

Git LFS stores large binaries (model weights, datasets) outside the normal object database, committing only a small pointer file into Git history — without it, a repository that ever contained a large binary keeps that full blob in every clone forever, even after the file is deleted, unless history is rewritten (see Advanced Concepts).

### Everyday operational defaults

~~~bash
git fetch --prune              # remove local refs for branches deleted on the remote
git branch --merged main       # find local branches already merged, safe to delete
git worktree add ../hotfix main   # a second working directory from the SAME repo, no re-clone
~~~

git worktree is the professional answer to "I need to quickly check something on another branch without losing my current uncommitted state" — it checks out a second branch into a separate directory sharing the same object database.
`,

  "industry-examples": `
- **The Linux kernel**: Git's original and still largest-scale proof point — thousands of contributors, no central corporate ownership, hundreds of thousands of commits, maintained through a strict patch-and-pull-request-by-email workflow that predates GitHub.
- **GitHub / GitLab / Bitbucket**: entire companies built as a social and workflow layer (pull requests, code review, issue tracking, CI/CD) on top of plain Git — Git itself has no concept of a "pull request"; that is a platform feature these companies invented and standardized.
- **Google**: famously runs a single, enormous monorepo (using Piper internally, not raw Git, for most code) but for Git-based projects (including Android's AOSP, which uses **Repo**, a tool layered over many Git repositories) relies on partial clone and sparse-checkout patterns that later became upstream Git features.
- **Microsoft**: migrated the entire Windows codebase (one of the largest Git repositories in existence) onto Git, driving the development of **VFS for Git** (now the Scalar tooling) and major upstream performance work (partial clone, commit-graph files, multi-pack indexes) specifically to make Git viable at that scale.
- **Meta / Facebook**: uses Mercurial (and increasingly a custom system called Sapling) for its primary monorepo rather than Git, precisely because vanilla Git's per-commit and per-branch model strains at that repository size and commit velocity — an instructive case of a company choosing a different DVCS for scale reasons while still using Git broadly elsewhere.
- **Every modern AI/ML team**: model training code, data pipeline DAGs, evaluation harnesses, and infrastructure-as-code (Terraform, Kubernetes manifests) are Git-tracked, with CI/CD pipelines (GitHub Actions, Jenkins) triggered directly by Git pushes and tags to run tests, build containers, and deploy.
`,

  "best-practices": `
1. **Commit small, focused changes with a clear message.** One commit should represent one logical change; "fix stuff" commits make bisect, blame, and review nearly useless.
2. **Write commit messages in the imperative mood** ("Add retry logic," not "Added" or "Adds") — this matches Git's own generated messages (merge, revert) and reads naturally in git log.
3. **Pull with rebase, not merge, for your own feature branch** (git pull --rebase or pull.rebase true) to avoid noisy "merge remote-tracking branch" commits cluttering a branch only you're working on.
4. **Never rebase or force-push a branch other people have pulled from.** Rebase freely on private, unpushed work only.
5. **Keep feature branches short-lived** (hours to a couple of days) — the longer a branch lives, the larger and riskier its eventual merge.
6. **Use .gitignore from the first commit**, not after the first accidental commit of node_modules/ or .env.
7. **Never commit secrets** — use environment variables, a secrets manager, and pre-commit secret-scanning hooks (see Security and the **Secrets Management** skill) as a safety net, not a substitute for discipline.
8. **Tag every release with an annotated tag**, not a lightweight one, so the release carries a message, author, and (ideally) a signature.
9. **Use git revert on shared branches, git reset only on local/private ones.**
10. **Squash noisy work-in-progress commits before merging a pull request** (interactive rebase or the platform's "squash and merge" button) so main's history reads as a sequence of meaningful changes.
11. **Enable pull.rebase and fetch --prune globally** so your local view of remote branches and history stays clean without manual upkeep.
12. **Treat main/trunk as sacred**: protect it (required reviews, required passing CI) so nothing broken ever lands on the branch everyone builds from.
`,

  "anti-patterns": `
### Committing generated files and secrets

~~~bash
# WRONG: committing your virtual environment and a real API key
git add .venv/ config.py   # config.py hardcodes API_KEY = "sk-live-abc123"
git commit -m "setup"

# RIGHT: ignore generated directories, load secrets from the environment
echo ".venv/" >> .gitignore
echo "*.env" >> .gitignore
# config.py reads: API_KEY = os.environ["API_KEY"]
~~~

Once a secret is committed and pushed, deleting it in a later commit does NOT remove it from history — it is still retrievable from any earlier commit or any clone. Treat any pushed secret as compromised and rotate it (see Security).

### Giant, mixed-purpose commits

~~~bash
# WRONG: one commit touching unrelated features, hard to review, impossible to bisect cleanly
git add -A && git commit -m "stuff"

# RIGHT: stage and commit each logical change separately
git add pricing.py && git commit -m "Fix off-by-one in discount calculation"
git add tests/test_pricing.py && git commit -m "Add regression test for discount edge case"
~~~

### Force-pushing to a shared branch

~~~bash
# WRONG: silently discards a teammate's already-pushed commits
git push --force origin main

# RIGHT: if you must rewrite something you pushed yourself and are certain no one has pulled it,
# use --force-with-lease, which refuses if the remote has moved since your last fetch
git push --force-with-lease origin feature/my-own-branch
~~~

### Merging main into a feature branch as the only integration strategy, forever

Repeatedly merging main into a long-lived feature branch instead of merging the feature branch's small, complete change into main keeps the feature branch permanently diverging and produces an enormous, high-risk merge whenever it finally lands. Prefer short-lived branches integrated frequently (trunk-based development, see Advanced Concepts).

### Using git add . reflexively without reviewing the diff

~~~bash
# WRONG: stages everything blindly, including a debug print or an accidentally-added credentials file
git add . && git commit -m "changes"

# RIGHT: review what's actually being staged
git status
git diff
git add -p          # interactively choose hunks to stage
~~~
`,

  performance: `
### Measure first

~~~bash
git count-objects -v -H          # how many objects, how large is the repo
git gc --aggressive --prune=now  # repack and compress everything (slow, run occasionally)
GIT_TRACE_PERFORMANCE=1 git status   # see where a slow command's time actually goes
~~~

### The optimization hierarchy (apply in order, for large/slow repositories)

1. **Stop committing things that don't belong** — build artifacts, dependency directories, and large binaries are the single biggest cause of a repository becoming slow to clone, fetch, and check status on. A .gitignore audit is nearly always the highest-leverage first step.
2. **Move large binaries to Git LFS** (or out of Git entirely into object storage with a manifest) — every clone otherwise pays the full cost of every version of every large file that was ever committed, forever.
3. **Shallow clone for CI** (git clone --depth 1) when full history isn't needed — a build agent that only needs the current snapshot doesn't need 10 years of commit history transferred.
4. **Partial clone / sparse-checkout for huge monorepos** (git clone --filter=blob:none, git sparse-checkout set path/) — download commit and tree metadata but fetch file contents (blobs) only on demand or for the paths you actually touch. This is the technique Microsoft and Google contributed upstream to make Git viable at Windows/Android scale.
5. **Repack regularly** (git gc, or let the automatic maintenance run) — packed, delta-compressed objects are dramatically smaller and faster to transfer than thousands of loose objects.
6. **Enable the commit-graph and multi-pack-index features** (git commit-graph write, git multi-pack-index write; largely automatic in modern Git) — these precomputed indexes make log, blame, and merge-base calculations on huge histories dramatically faster by avoiding a full graph walk each time.

### Everyday facts worth knowing

- git status can be slow on very large working directories with many untracked files; a well-scoped .gitignore keeps it fast by letting Git skip whole ignored directories.
- git blame on a huge, heavily-modified file is inherently expensive (it walks history per line); -C and -M flags (detect copies/moves) make it more accurate but slower — use --since to bound the search when you only care about recent history.
- Shallow clones (--depth 1) cannot be pushed from directly in the general case and break some operations (bisect, full blame) — use them for CI checkouts, not for a developer's primary working clone.
`,

  scalability: `
Git "scales" along two independent axes: the number of contributors/commits (which Git handles natively and well — this is precisely what it was designed for), and the raw size of the repository's tracked content (which strains the default model and requires deliberate techniques).

~~~mermaid
flowchart LR
    Repo["Git repository"] --> Contrib["Contributor scale\n(thousands of parallel branches, commits/day)"]
    Repo --> Size["Content scale\n(repo size, binary assets, monorepo file count)"]
    Contrib --> Native["Handled natively:\nbranching is O(1),\nhistory is distributed,\nno central bottleneck"]
    Size --> Techniques["Requires deliberate techniques:\nLFS, partial clone,\nsparse-checkout, shallow clone"]
~~~

### Contributor/commit-volume scale

Because every clone is a full, independent repository and branching is a pointer write, Git natively supports thousands of contributors working in parallel with no central lock or bottleneck — this is exactly the Linux kernel's use case and Git's original design target. The only place a real bottleneck reappears is the hosting platform (GitHub/GitLab) handling webhook fan-out and CI triggering at very high push volume — a platform/CI concern, not a Git-core one (see the **CI/CD** skill).

### Content/size scale — the bottleneck table

| Bottleneck | Cause | Answer |
|------------|-------|--------|
| Slow clone for new developers | Enormous full history, especially with binaries | Shallow clone (--depth) for CI; partial clone (--filter=blob:none) for local dev |
| Repo balloons over years | Large binaries (datasets, model weights, media) ever committed, even if later deleted | Git LFS from day one; for existing bloat, filter-repo to purge, then educate the team |
| Huge monorepo, most devs touch a fraction of it | Every clone gets every file by default | sparse-checkout to materialize only relevant paths |
| Slow log/blame/merge-base on huge history | Full graph walk each time | commit-graph and multi-pack-index (mostly automatic in modern Git) |
| Merge conflicts at scale | Long-lived branches diverging from a fast-moving trunk | Trunk-based development with short-lived branches; feature flags instead of long branches |

### Horizontal scaling of the "review and merge" bottleneck

The actual scaling limit most organizations hit is not Git the tool but the human/process throughput of code review and CI capacity feeding into a single trunk. The answer is organizational, not technical: smaller PRs, more parallel CI capacity, and required-check automation rather than manual gatekeeping — directly interacting with the branching-strategy choice in Advanced Concepts.
`,

  security: `
### Committed secrets are the number one Git-specific incident

Because every commit is retained forever (by design — that's the whole point of version control), a credential committed once and pushed is compromised the moment it's pushed, regardless of whether it's later deleted in a following commit. Real-world pattern: a developer commits a .env file or hardcodes an API key "just to test," pushes, and the key is now retrievable by anyone who clones the repository or by any secret-scanning bot crawling public GitHub. Mitigations, layered:

1. **Prevention**: .gitignore for anything resembling a credential file from the first commit; environment variables or a dedicated secrets manager instead of hardcoded values (see the **Secrets Management** skill).
2. **Local safety net**: a pre-commit hook running a secret scanner (gitleaks, truffleHog, or the pre-commit framework's detect-secrets) that blocks the commit before it's even made.
3. **Server-side safety net**: hosting-platform secret scanning (GitHub secret scanning, GitLab secret detection) that alerts or blocks pushes containing recognizable credential patterns.
4. **Incident response if a secret IS pushed**: rotate the credential immediately — treat it as burned, full stop. THEN rewrite history with git-filter-repo to remove it from the repository going forward (see Advanced Concepts), force-push, and have every collaborator re-clone or hard-reset rather than merge/pull. Rewriting history without rotating the credential is security theater: any clone, fork, CI log, or cache made before the rewrite still has the original secret.

### Supply-chain and integrity considerations

- **Signed commits and tags** (git commit -S, git tag -s) let a GPG or SSH key cryptographically attest authorship — increasingly required for release artifacts in supply-chain-security-conscious pipelines.
- **SHA-1 collision risk**: Git's default hash, SHA-1, has known (expensive, engineered) collision attacks; Git uses a hardened SHA-1 variant (SHA-1DC) that detects the known collision-construction techniques, and Git has an ongoing, opt-in transition path to SHA-256 repositories for organizations that want a stronger guarantee.
- **Untrusted repositories and hooks**: cloning a repository does not execute its code, but checking out and RUNNING build scripts, or having Git execute hook scripts from a repository you don't control, can. Git's safe.directory setting (added after CVE-2022-24765) exists specifically to prevent a repository placed by another user/process on a shared machine from silently executing hooks in your context.
- **Submodules from untrusted sources**: a malicious .gitmodules can be crafted to point a submodule at an unexpected URL or path; Git has hardened submodule handling over time (protected-config settings) specifically against this class of attack — review .gitmodules changes in code review, don't blindly run "git submodule update" on an unreviewed change.

See the dedicated **Secrets Management** and **OWASP Top 10** skills for the broader incident-response and prevention playbook beyond what's Git-specific.
`,

  testing: `
Git itself is not "tested" by application developers the way a library is — but Git-driven **workflow correctness** is something teams absolutely should verify, and Git provides the primitives to test against real history.

### Testing that your Git-based automation behaves correctly

~~~bash
# Verify a pre-commit hook actually blocks bad commits (in a scratch/test repo)
mkdir /tmp/hook-test && cd /tmp/hook-test && git init
cp /path/to/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
echo "API_KEY = 'sk-live-abc'" > config.py
git add config.py
git commit -m "test"   # should be REJECTED by the secret-scanning hook
~~~

### Using git bisect as a regression-testing tool (see Intermediate Concepts for the mechanics)

~~~bash
git bisect start
git bisect bad HEAD
git bisect good v2.3.0
git bisect run pytest tests/test_pricing.py::test_discount_matrix
# Git automatically checks out each candidate commit, runs the test, and narrows the range
~~~

This turns "somewhere in the last 200 commits we broke discount calculation" into an automated, unattended search that names the exact commit.

### Senior testing doctrine specific to Git workflows

- **Verify CI actually blocks on required checks** — a common misconfiguration is a "required" status check that's misspelled or not actually wired to branch protection, silently allowing broken code to merge.
- **Test rebase/merge automation in a disposable clone first**, never on the team's actual shared repository, before running an unfamiliar history-rewriting command for real.
- **Dry-run destructive operations**: git clean -n (dry run) before git clean -fd; git rebase --interactive with --dry-run-style review (checking the todo list) before letting it execute; git push --dry-run before an unfamiliar push.
- **Treat .gitattributes and .gitignore as code**: review changes to them in pull requests just as carefully as application code, since a bad pattern can silently start ignoring files that should be tracked, or vice versa.
`,

  debugging: `
### The toolbox, in escalation order

1. **git status** — always the first command; shows branch, staged/unstaged state, conflicts.
2. **git log --oneline --graph --all --decorate** — visualize exactly how branches diverged and merged; the fastest way to understand "how did we get here."
3. **git diff / git diff --staged / git show <sha>** — see exactly what changed, where, and in which commit.
4. **git blame -L 10,30 -- file.py** — find which commit last touched each line in a range; the starting point for "who wrote this and why" (follow up with git show on the SHA it names).
5. **git log -S"search_string" -- path/** — the "pickaxe" search: find every commit that added or removed an exact string, invaluable for "when did this function signature change."
6. **git bisect** — binary-search a regression to the exact introducing commit (see Intermediate Concepts).
7. **git reflog** — the escalation of last resort for "my commit/branch disappeared" (see Advanced Concepts) — almost always recovers work that looks lost.
8. **git fsck --full --unreachable** — list every object not reachable from any ref, including ones still recoverable via the reflog's grace period; useful when reflog alone doesn't locate what you need.

### Debugging a confusing merge/rebase state

~~~bash
git status                        # tells you exactly what Git thinks is unresolved
git diff                          # shows conflict markers still in files
git rebase --abort                # bail out of an in-progress rebase entirely, back to before it started
git merge --abort                 # same, for an in-progress merge
git rerere status                 # if rerere is enabled, shows recorded conflict resolutions being reused
~~~

git rebase --abort and git merge --abort are the two most underused safety commands — if a conflict resolution is going badly, abort and start over rather than pushing forward into a broken state.

### Debugging "detached HEAD" panic

git status will say "You are in 'detached HEAD' state" explicitly. If you made commits here you want to keep: git branch rescue-name immediately creates a real branch pointing at your current commit before you switch away and risk the commits becoming unreachable.
`,

  monitoring: `
Git itself is not a running service to instrument with metrics/traces the way an application is (see the **Prometheus**, **Grafana**, and **OpenTelemetry** skills for that world) — but "monitoring" a Git-based workflow in production practice means watching repository health and pipeline-trigger reliability.

### Repository health signals worth tracking

~~~bash
git count-objects -v -H            # total repo size, loose vs packed object counts — trend this over time
du -sh .git/                       # raw .git directory size — a fast growth-rate signal
git log --since="1 month ago" --oneline | wc -l   # commit velocity
git branch -r | wc -l              # remote branch count — a rising, unpruned count signals process debt
~~~

A repository whose .git/ size or loose-object count grows unexpectedly fast (outside normal code growth) is very often a sign that a large binary or generated artifact was accidentally committed — worth alerting on in CI for shared/critical repositories.

### Pipeline-trigger reliability

Because CI/CD systems (see the **CI/CD**, **GitHub Actions**, and **Jenkins** skills) react to Git webhook events, the thing to actually monitor in production is: webhook delivery success rate (GitHub/GitLab show delivery logs and retries per webhook), time-from-push-to-pipeline-start (a growing lag suggests webhook or runner-capacity issues), and required-status-check enforcement (periodically audit that branch protection rules still list the correct, currently-existing check names — a renamed CI job silently stops being "required" if the protection rule wasn't updated to match).

### Auditing history for compliance

git log --all --grep, combined with signed-commit verification (git log --show-signature), lets security/compliance teams audit who committed what, when, and whether it was cryptographically attested — relevant in regulated environments needing provenance guarantees on production code and infrastructure-as-code changes.
`,

  deployment: `
Git itself isn't deployed as a service in the usual sense, but "deployment" in a Git-centric workflow means two things done well: how the **hosting/server side** of Git is run, and how a **CI/CD pipeline checks out and acts on** a specific commit.

### Self-hosted Git server considerations (when not using GitHub/GitLab SaaS)

~~~bash
# A bare repository (no working directory) is what a server hosts
git init --bare /srv/git/project.git

# Clients clone/push over SSH or HTTPS against the bare repo
git clone ssh://deploy@git.internal/srv/git/project.git
~~~

Bare repositories exist specifically to be pushed to safely — a non-bare repository with a checked-out working directory can get its working files out of sync with an incoming push in surprising ways, which is why Git refuses (by default) to push into the checked-out branch of a non-bare repository.

### A CI/CD checkout step, annotated

~~~yaml
# GitHub Actions example — see the GitHub Actions skill for the full pipeline picture
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 1        # shallow clone: this job only needs the current commit, not full history
      ref: GITHUB_SHA        # (GitHub Actions expression syntax) pin to the EXACT commit that triggered the run, not a moving branch tip
~~~

Why each choice matters: shallow fetch keeps CI checkouts fast (see Performance); pinning to the exact triggering SHA (rather than re-fetching "the branch tip" mid-run) guarantees the pipeline builds and deploys precisely what was reviewed and merged, immune to a race where someone pushes again while the pipeline is running.

### Release tagging as the deployment marker

~~~bash
git tag -a v2.4.0 -m "Release 2.4.0: pricing engine rewrite"
git push origin v2.4.0
~~~

Tagging the exact commit that was deployed (annotated, not lightweight — see Intermediate Concepts) gives a durable, unambiguous answer to "what code is running in production right now" and "what do we roll back to" — the tag itself is the audit trail, independent of any branch that may keep moving.

### Rollback

Rolling back a bad deployment is, at the Git level, either: redeploying the previous tag (fast, safe, doesn't touch history), or git revert-ing the offending commit(s) and redeploying main (also safe, adds a clear "we undid this" commit). Resetting main backward and force-pushing is not the rollback mechanism — that rewrites shared history for no benefit when revert achieves the same production outcome safely.
`,

  "production-checklist": `
Before a team's Git workflow is production-grade:

- [ ] .gitignore committed from the very first commit, covering build artifacts, dependency directories, and env/secret files
- [ ] .gitattributes configured for line-ending normalization and any LFS-tracked binary patterns
- [ ] No secrets in history — verified with a secret-scanning tool (gitleaks/truffleHog), not just assumed
- [ ] Pre-commit hooks (lint, format, secret-scan) installed via a shareable framework (pre-commit, husky), not left as an unshared local file
- [ ] Branch protection on main/trunk: required passing CI, required review, no direct pushes
- [ ] Required status check names verified to actually match current CI job names (a rename silently un-requires a check)
- [ ] Commit signing (GPG or SSH) enforced for anyone with push access to release branches, if provenance matters to your compliance posture
- [ ] Annotated tags used for every release, pushed explicitly (git push --tags or per-tag)
- [ ] Large binaries routed through Git LFS or kept out of Git entirely, not committed raw
- [ ] Team-wide agreement on branching strategy (trunk-based vs Git Flow) documented, not ad hoc per engineer
- [ ] pull.rebase configured (or an equivalent team convention) so shared branch history stays legible
- [ ] A documented, tested procedure exists for what to do if a secret IS committed (rotate first, then filter-repo, then force-push + team re-clone)
- [ ] CI checkouts pin to the exact triggering commit SHA, not a floating branch reference
- [ ] Repository size/growth is monitored; unexpected growth investigated promptly
- [ ] Every engineer knows how to use the reflog before they need it in a panic
`,

  "common-mistakes": `
1. **Believing a branch is a copy of the files.** It's a pointer to a commit — see Advanced Concepts. This misunderstanding underlies most confusion about "why did my branch change when I didn't touch it" (someone/something moved the pointer, e.g. a rebase or reset).
2. **Force-pushing to a shared branch without --force-with-lease.** Plain --force can silently discard a teammate's work pushed moments before yours; --force-with-lease refuses if the remote moved since your last fetch.
3. **Rebasing history that's already been pushed and pulled by others.** Creates duplicate-looking commits and painful reconciliation for everyone who already has the old SHAs.
4. **Assuming .gitignore removes already-tracked files.** It only prevents NEW untracked files from being staged; an already-committed file must be explicitly removed (git rm --cached) and, if sensitive, purged from history.
5. **Deleting a branch and panicking that the commits are gone.** They almost always aren't — the reflog and unreachable-but-not-yet-garbage-collected objects usually recover them (git reflog, git fsck --unreachable).
6. **Committing large binaries "just this once."** They bloat every future clone permanently unless history is later rewritten — the "just this once" file never actually leaves without deliberate effort.
7. **Writing vague commit messages** ("fix," "update," "wip") that make git log, git blame, and future debugging nearly useless.
8. **Resolving merge conflicts by blindly picking "ours" or "theirs"** without reading both sides — this silently discards someone's actual work rather than genuinely reconciling it.
9. **Not understanding fast-forward vs. true merge**, leading to confusion about why some merges create a merge commit and others don't.
10. **Treating git revert and git reset as interchangeable.** revert is safe on shared history (adds a new commit); reset moves the branch pointer and can discard commits — the wrong choice on a shared branch causes real data loss for collaborators.
`,

  "common-errors": `
| Error | Typical cause | Fix |
|-------|---------------|-----|
| "fatal: not a git repository" | Running a Git command outside any repo, or .git/ was deleted | cd into the repo, or git init if one was never created |
| "Updates were rejected because the tip of your current branch is behind" | Someone else pushed since your last fetch | git pull --rebase (or merge), resolve any conflicts, then push again |
| "CONFLICT (content): Merge conflict in file" | Two branches changed overlapping lines of the same file | Edit the file to resolve the markers, git add the file, then commit (see Intermediate Concepts) |
| "You are in 'detached HEAD' state" | Checked out a commit/tag directly instead of a branch | git branch rescue-name to save any work before switching away |
| "fatal: refusing to merge unrelated histories" | Merging two repos/branches with no common commit ancestor | git merge --allow-unrelated-histories (verify this is actually intended first) |
| "error: failed to push some refs... non-fast-forward" | Remote has commits your local branch doesn't | Fetch and integrate (merge/rebase) before pushing; never force-push reflexively |
| "warning: LF will be replaced by CRLF" | Line-ending normalization settings differ from file's actual endings | Configure core.autocrlf / .gitattributes consistently across the team |
| "fatal: pathspec did not match any files" | Typo in a filename, or the file isn't tracked/doesn't exist at that path | git status / git ls-files to check the actual tracked paths |
| "error: cannot pull with rebase: You have unstaged changes" | Working directory has uncommitted edits that would conflict with rebase | git stash, pull --rebase, git stash pop |
| "fatal: bad object <sha>" or "fatal: loose object ... is corrupt" | Repository corruption (rare) — often incomplete transfer or disk issue | git fsck --full to locate damage; restore the object from another clone or a backup remote |

The habit that matters: read the full error message (Git's are usually specific and actionable), run git status before doing anything else, and prefer the safe, additive commands (revert, stash, a rescue branch) over destructive ones (reset --hard, force push) when unsure.
`,

  faqs: `
**Q: What's the actual difference between git fetch and git pull?**
fetch downloads new commits/branches from the remote into your local repo's remote-tracking branches (origin/main) WITHOUT touching your working directory or current branch. pull is fetch immediately followed by a merge (or rebase, if configured) into your current branch. fetch is always safe to run; pull changes your working files.

**Q: Should I use merge or rebase?**
For integrating a finished feature branch into main: either is fine, and many teams use a platform's "squash and merge" button. For keeping your OWN in-progress feature branch up to date with main: rebase, for a clean linear history. The one hard rule: never rebase commits that are already pushed and that someone else might have pulled (see Advanced Concepts).

**Q: I deleted a branch / did a hard reset and lost commits — are they gone forever?**
Almost certainly not, within the reflog's retention window (default ~90 days for reachable, ~30 for unreachable history). Run git reflog, find the commit SHA, and either check it out directly or point a new branch at it.

**Q: How do I permanently remove a secret that was accidentally committed?**
Rotate the credential FIRST — treat it as already compromised, since anyone who cloned before you fix history still has it. Then use git-filter-repo to rewrite history removing the file from every commit, force-push, and have every collaborator re-clone or hard-reset (see Advanced Concepts and Security).

**Q: Lightweight or annotated tags for releases?**
Annotated (git tag -a), always, for anything meant to represent a real release — they're full Git objects with a message, author, date, and optional signature, unlike lightweight tags which are just a name pointing at a commit.

**Q: Why does Git say "refusing to merge unrelated histories"?**
You're trying to merge two branches/repos that share no common ancestor commit — often from re-initializing a repository or combining two previously separate projects. If that's genuinely intended, git merge --allow-unrelated-histories overrides the safety check; if it's unexpected, you likely have the wrong remote or branch.

**Q: Trunk-based development or Git Flow — which should my team use?**
If you have strong CI/CD (automated tests gating every merge, fast pipeline turnaround — see the **CI/CD** skill) and deploy frequently, trunk-based development with short-lived branches minimizes merge pain and integration risk. Git Flow's long-lived develop/release branches suit teams shipping infrequent, versioned releases (e.g., desktop software with widely spaced release trains) where isolating in-progress work from a stable release line matters more than continuous integration speed.
`,

  "interview-questions": `
**Junior/Mid:**

1. *What is the difference between git fetch and git pull?* fetch only downloads; pull additionally merges (or rebases) into your current branch. A strong answer notes fetch is always safe, pull touches your working directory.
2. *What does git add actually do?* Copies the current content of the named file(s) into the staging area (index) as blob objects, preparing them for the next commit — it does not touch the repository's committed history yet.
3. *Explain git merge vs git rebase in your own words.* Merge combines two histories with a new merge commit, preserving both branches' true chronology; rebase replays one branch's commits onto a new base, producing new SHAs and a linear history. Follow up: why is rebasing pushed/shared history dangerous?
4. *What is a merge conflict and how do you resolve one?* Git can't automatically reconcile two branches' overlapping line changes; it inserts <<<<<<<, =======, >>>>>>> markers in the file. You edit to the correct final content, remove the markers, git add, then commit (or continue the rebase).
5. *What's the difference between git revert and git reset?* revert creates a NEW commit that undoes a previous one — safe on shared history. reset moves the branch pointer (and optionally the index/working directory) — can discard commits, dangerous on shared branches.

**Senior:**

6. *Explain Git's object model: what are blobs, trees, and commits, and how is a commit's SHA computed?* A blob is raw file content (no name); a tree is a directory listing of blobs/subtrees; a commit points to one tree plus parent commit(s) plus metadata. The SHA is a hash of a type+length header concatenated with the object's own serialized content — should be able to sketch the "blob 11\0hello world" example from Internal Working.
7. *Why is a branch "just a pointer," and what does that explain?* refs/heads/<name> is a text file containing one commit SHA. This explains why branching/switching is instant, why a branch "moves" as you commit, why deleting a branch doesn't delete its commits immediately (reflog/reachability), and why two branches can point at the same commit.
8. *You need to remove a secret from Git history. Walk through it.* Rotate the credential first (it's compromised regardless). Use git-filter-repo to remove the file from every historical commit, force-push, and require every collaborator to re-clone or hard-reset rather than merge — explain why merging old clones back in would reintroduce the purged history.
9. *Design a branching strategy for a team practicing continuous deployment. Justify it.* Trunk-based development: one protected trunk, short-lived feature branches merged within a day or two, feature flags for incomplete work, CI required-checks gating every merge. Contrast explicitly with Git Flow's long-lived branches and explain why the latter fights continuous deployment's cadence (see the CI/CD skill cross-reference).
10. *How does git bisect work algorithmically, and what's its complexity?* Binary search over the commit graph between a known-good and known-bad commit; each test halves the remaining range, so N commits resolve in about log2(N) tests. Bonus: mention git bisect run for full automation with a pass/fail script.
11. *What actually happens to "lost" commits after a hard reset or branch deletion, and for how long are they recoverable?* The commit objects aren't deleted immediately; they become unreachable (no ref points to them) but remain in the object database and are named in the reflog until the reflog entry expires and a gc prunes unreachable objects (default ~30-90 day grace periods).
12. *When would you choose merge over rebase for integrating a long-lived branch?* When preserving the true chronological/parallel-development record matters (audit, understanding how a large feature actually evolved) more than a clean linear log — rebase's rewritten SHAs would also break anyone else with commits based on the original branch, which is disqualifying if the branch is shared.
`,

  "coding-questions": `
### 1. Implement a minimal content-addressable blob store (tests hashing + the object-model mental model)

~~~python
import hashlib
import zlib
import os

def hash_object(data: bytes, obj_type: str = "blob", write: bool = False, repo_path: str = ".") -> str:
    """Recreate Git's own object-hashing scheme: type + length header + content, SHA-1 hashed."""
    header = f"{obj_type} {len(data)}\\0".encode()
    full_data = header + data
    sha = hashlib.sha1(full_data).hexdigest()   # matches: git hash-object --stdin
    if write:
        obj_dir = os.path.join(repo_path, ".git", "objects", sha[:2])
        os.makedirs(obj_dir, exist_ok=True)
        obj_path = os.path.join(obj_dir, sha[2:])
        if not os.path.exists(obj_path):        # content-addressable: identical content -> identical path, no rewrite
            with open(obj_path, "wb") as f:
                f.write(zlib.compress(full_data))  # Git stores objects zlib-compressed
    return sha

assert hash_object(b"hello world") == "95d09f2b10159347eece71399a7e2e907ea3df4"
~~~

Complexity: O(n) in content size for hashing and compression. Follow-ups: extend to a tree object type (sorted list of mode/type/sha/name entries) and a commit object type (tree sha + parent sha + message) to fully model the chain from Internal Working; discuss why identical content anywhere in the repo automatically deduplicates under this scheme.

### 2. Simulate three-way merge on two lists of non-conflicting line edits (tests the merge model)

~~~python
def three_way_merge(base: list[str], ours: list[str], theirs: list[str]) -> list[str]:
    """
    Simplified line-based three-way merge: for a common base and two divergent
    versions, take a changed line from whichever side changed it, and flag
    a conflict if BOTH sides changed the same line differently.
    """
    result = []
    for i, base_line in enumerate(base):
        our_line = ours[i] if i < len(ours) else base_line
        their_line = theirs[i] if i < len(theirs) else base_line
        our_changed = our_line != base_line
        their_changed = their_line != base_line

        if our_changed and their_changed and our_line != their_line:
            result.append(f"<<<<<<< HEAD\\n{our_line}\\n=======\\n{their_line}\\n>>>>>>> theirs")
        elif our_changed:
            result.append(our_line)
        elif their_changed:
            result.append(their_line)
        else:
            result.append(base_line)
    return result

base = ["rate = 0.10", "name = 'x'"]
ours = ["rate = 0.15", "name = 'x'"]      # only we changed line 0
theirs = ["rate = 0.10", "name = 'y'"]    # only they changed line 1
assert three_way_merge(base, ours, theirs) == ["rate = 0.15", "name = 'y'"]
~~~

Complexity: O(n) in number of lines for this simplified model (real Git uses a more sophisticated diff3 algorithm operating on diff hunks, not fixed line indices). Follow-up: what happens when lines are inserted/deleted rather than just edited in place — why does that require an actual diff algorithm (longest common subsequence) rather than index-aligned comparison?

### 3. Implement binary-search bisect over a mock commit list (tests the bisect algorithm)

~~~python
def find_first_bad_commit(commits: list[str], is_bad: callable) -> str:
    """
    commits is ordered oldest -> newest. is_bad(commit) returns True if that
    commit exhibits the regression. Assumes monotonic: once bad, stays bad.
    Mirrors git bisect's binary search.
    """
    lo, hi = 0, len(commits) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if is_bad(commits[mid]):
            hi = mid            # the culprit is at or before mid
        else:
            lo = mid + 1        # culprit is after mid
    return commits[lo]

commits = [f"c{i}" for i in range(1000)]
bad_from = 733
result = find_first_bad_commit(commits, lambda c: int(c[1:]) >= bad_from)
assert result == "c733"
~~~

Complexity: O(log n) tests to find the culprit among n commits — for 1,000 commits, about 10 tests. Follow-up: how would you adapt this if "bad" isn't perfectly monotonic (a flaky test, or a regression that was fixed and reintroduced) — discuss git bisect skip and the limits of the monotonic assumption.
`,

  "hands-on-labs": `
### Lab 1 — Object model archaeology (beginner, ~1h)
In a scratch repository, make three commits. Use git cat-file -p on HEAD, HEAD's tree, and one of its blobs to manually trace the full chain from commit to tree to blob. Hand-verify one blob's SHA with echo -n "content" | git hash-object --stdin. Deliverable: a short written trace showing each SHA and what object it names. Skills: the content-addressable object model, viscerally.

### Lab 2 — Merge vs. rebase, side by side (intermediate, ~1.5h)
Create a repo, branch feature/a from main, add two commits to each of main and feature/a so they diverge. Merge them one way in a copy of the repo, and rebase them in another copy. Compare git log --graph --oneline --all between the two outcomes. Deliverable: a short writeup of the exact SHA and history differences, plus the scenario where each approach is the right call. Skills: real understanding of history-shape tradeoffs, not just the commands.

### Lab 3 — Break something, then git bisect it (intermediate, ~1.5h)
Write a tiny script with a passing test. Make 15 commits, one of which (somewhere in the middle) silently introduces a bug, the rest cosmetic/unrelated. Use git bisect run with your test script to find the exact bad commit automatically. Deliverable: the bad commit's SHA and message, found without manually inspecting each commit. Skills: bisect mechanics and automation.

### Lab 4 — Incident response: purge a leaked secret (production, ~2h)
In a scratch repo, commit a fake "API key" file across a few commits (mixed with unrelated changes), as if it happened for real. Then: rotate (simulate) the fake credential, use git-filter-repo to remove the file from all of history, verify with git log --all --full-history -- path/to/secret that it's gone from every commit, and force-push to a scratch remote. Deliverable: a short incident writeup covering what you'd tell collaborators to do with their existing clones, and why rotation had to happen regardless of the history rewrite. Skills: the full real-world secrets-in-git incident response, end to end.
`,

  "real-projects": `
Portfolio-grade projects (each demonstrates skills that show up directly in engineering interviews and day-one work):

1. **A minimal Git implementation ("build your own Git")** — implement init, hash-object, cat-file, a working add/commit cycle building real tree and commit objects, and log, entirely from scratch in a language of your choice, writing to a real .git/objects directory compatible with real Git's cat-file. Demonstrates: deep, provable understanding of the content-addressable object model — the single most interview-differentiating Git project.

2. **A pre-commit secret-scanning and policy-enforcement hook suite** — a shareable set of Git hooks (pre-commit: lint, format, secret-scan; commit-msg: enforce conventional-commit format; pre-push: run the fast test subset) packaged so a new repository can adopt it in one command. Demonstrates: real production Git-workflow tooling, directly relevant to platform/DevOps roles.

3. **A repository health/audit CLI** — a tool that reports repository size trends, flags large committed binaries and likely-accidental secrets in history, lists stale/merged branches ready for deletion, and checks that a project's CI required-status-check names actually match its current pipeline job names. Demonstrates: the operational, at-scale side of Git covered in Performance, Scalability, and Monitoring.

Each project: a clear README explaining the design decisions, tests where applicable, and — appropriately for this topic — a genuinely clean, well-organized commit history demonstrating the very practices the project is about.
`,

  "case-studies": `
### The Linux kernel: Git's founding proof of scale
Git was built in days by Linus Torvalds specifically to replace BitKeeper for kernel development, and the kernel remains one of the largest, most distributed collaborative software projects ever built on it — no central company, thousands of contributors, no pull-request UI (patches integrate by email through a strict maintainer-tree hierarchy). Lesson: Git's core design goals (distributed, fast, tamper-evident, cheap branching) were chosen for a specific, extreme use case, and that same design happens to serve every smaller team well too.

### Microsoft Windows: making Git work at a scale it wasn't originally built for
Migrating the Windows codebase (hundreds of thousands of files, decades of history) onto Git strained the default clone/checkout model badly enough that Microsoft built VFS for Git (virtualizing the working directory, fetching blobs on demand) and drove major upstream Git performance features — partial clone, the commit-graph file, multi-pack-index — specifically to make a single, enormous repository practical. Lesson: Git's contributor-scale story is native; its raw content-scale story required real, sustained engineering investment, and much of that investment is now upstream and available to any large repository.

### A recurring incident pattern: the committed secret
Across virtually every organization using Git, "an API key or credential was committed and pushed, sometimes to a public repository" is one of the most common real security incidents — automated scanners crawl public GitHub specifically hunting for exactly this pattern within minutes of a push. Lesson: prevention (pre-commit secret scanning, environment-based config) is far cheaper than incident response (mandatory rotation plus a full history rewrite and forced re-clone across every collaborator), and the two are not substitutes for each other — a caught secret must still be rotated even after history is cleaned.

### Meta's choice of Mercurial/Sapling over Git for its monorepo
Facebook/Meta deliberately did not standardize on vanilla Git for its primary monorepo, instead using Mercurial and later building a custom system (Sapling) — citing Git's per-commit and working-directory model straining at their specific scale and workflow shape (an enormous single repository, extremely high commit velocity). Lesson: understanding Git deeply also means understanding its design tradeoffs well enough to recognize the (rare) organizational scale at which an alternative DVCS becomes the more honest engineering choice — this is a sophisticated, not a beginner, judgment call.
`,

  comparisons: `
| Dimension | Git | Subversion (SVN) | Mercurial (hg) | Perforce (Helix Core) | Git LFS / Git + LFS |
|-----------|-----|-------------------|----------------|------------------------|------------------------|
| Model | Distributed, full history per clone | Centralized, single source of truth | Distributed, similar model to Git | Centralized, strong on huge binary/asset workflows | Git's normal model, plus pointer files for large binaries |
| Branching cost | Effectively free (pointer write) | Expensive (server-side directory copy) | Free, similar to Git | Cheap but workflow-heavy (streams) | Same as Git |
| Offline work | Full: commit, branch, diff, log all local | Very limited: needs server for most operations | Full, like Git | Limited without a local workspace cache | Same as Git for code; large-file fetch needs network |
| Large binary handling | Poor natively (every version kept forever) | Better than raw Git, still centralized-heavy | Poor natively, similar to Git | Excellent — built for game/media assets | Solves this specific Git weakness |
| Dominant ecosystem today | Overwhelming majority of open source and industry | Legacy; still used in some enterprises | Small but real (used at Meta via Sapling lineage, Mozilla historically) | Game studios, VFX, hardware/large-asset-heavy teams | Common addition wherever Git meets model weights/media |
| Learning curve | Moderate — the object model rewards learning it once, deeply | Simple centralized mental model, but limited | Very similar to Git conceptually | Distinct, workspace/stream-based mental model | Adds one concept (LFS pointers) on top of Git |

**How seniors choose**: default to Git for essentially all source code — the ecosystem (GitHub Actions, Jenkins, code review platforms, every modern CI/CD tool) assumes it. Reach for Perforce specifically when the primary asset class is huge binary files (game engines, VFX pipelines) where its centralized, checkout-lock model genuinely fits better. Consider Git LFS the moment your Git repository starts accumulating model checkpoints, datasets, or media rather than reaching for a full alternative DVCS. Subversion appears almost exclusively as legacy infrastructure being migrated away from, not chosen fresh.
`,

  "related-technologies": `
- **GitHub / GitLab / Bitbucket** — hosting platforms that add pull requests, code review, issue tracking, and (for GitLab/GitHub) native CI/CD on top of plain Git; Git itself has no concept of a "pull request."
- **CI/CD** (see the dedicated skill) — the automation layer that reacts to Git push/tag/PR events; branching strategy (this page's Advanced Concepts) and pipeline cadence are two halves of one decision.
- **GitHub Actions / Jenkins** (see the dedicated skills) — two concrete implementations of Git-triggered pipelines: GitHub Actions native to GitHub's webhook events, Jenkins as the veteran, self-hosted, plugin-driven CI server usually wired to Git via polling or webhooks.
- **Terraform** (see the dedicated skill) — infrastructure-as-code files are version-controlled with Git exactly like application code; remote Terraform state has its own locking concerns distinct from, but often coordinated alongside, Git's branch-protection workflow.
- **Docker / Kubernetes** (see the dedicated skills) — Dockerfiles and Kubernetes manifests are Git-tracked; image tags and Git commit SHAs are frequently correlated (tagging a built image with its source commit SHA) for full deployment traceability.
- **Git LFS** — the standard extension for tracking large binaries (model weights, datasets, media) without bloating the core object database.
- **git-filter-repo** — the modern, recommended tool for rewriting repository history (replacing the deprecated filter-branch and largely superseding BFG Repo-Cleaner for most use cases).
- **pre-commit (framework)** — the standard way to distribute and version-control shared Git hook configuration across a team, rather than relying on unshared local .git/hooks files.
- **Secrets Management** (see the dedicated skill) — the broader discipline (vaults, rotation, environment-based config) that Git's .gitignore and secret-scanning hooks are a local first line of defense for, not a replacement for.
- **Semantic Versioning / Conventional Commits** — commit-message and tagging conventions that let tooling automatically compute version bumps and changelogs directly from Git history.

On this platform, the natural next pages from Git: **CI/CD** → **GitHub Actions** or **Jenkins** → **Docker** → **Kubernetes**, following the exact path source code takes from a commit to running in production.
`,

  "latest-updates": `
Verified against my knowledge through early-to-mid 2025 — check the official Git release notes at git-scm.com for anything newer, since Git ships frequent point releases.

- **SHA-256 repository support** continues to mature as an opt-in alternative to SHA-1, motivated by SHA-1's known (if still practically expensive) collision-construction weaknesses; SHA-1 (hardened with collision detection, SHA-1DC) remains the default for the overwhelming majority of repositories and hosting platforms.
- **Scalar and partial-clone/sparse-checkout tooling**, originally developed at Microsoft for the Windows repository, have continued to be upstreamed and refined, making very large monorepos more practical with plain Git rather than requiring a bespoke system.
- **git-filter-repo** is firmly established as the recommended tool for history rewriting, with git filter-branch carrying an explicit deprecation warning in Git's own documentation directing users toward it.
- **Merge and rebase UX improvements** (better conflict-resolution hints, git rerere improvements, ORT as the default merge strategy replacing the older recursive strategy for better performance and correctness on renames) continue incrementally each release.
- **Ecosystem shift, not core Git**: trunk-based development, short-lived feature branches, and squash-merge-by-default have become the default advice from major hosting platforms and mature engineering organizations, reflecting CI/CD maturity rather than a Git feature change itself.

For exact version numbers and dated feature lists, verify at git-scm.com/downloads and the release notes there — Git's release cadence is frequent enough that any specific version claim here should be treated as a starting point for verification, not a final answer.
`,

  "future-roadmap": `
Where Git-adjacent practice is heading, and what's worth betting career time on:

1. **Continued SHA-256 migration groundwork.** Full ecosystem-wide (hosting platforms, tooling) support for SHA-256 repositories will keep expanding as a stronger-integrity option, though SHA-1 (hardened) is likely to remain the practical default for a long time given ecosystem inertia — understanding the object model (this page's Internal Working) transfers directly regardless of which hash function a given repository uses.
2. **Monorepo tooling keeps improving.** Partial clone, sparse-checkout, and commit-graph/multi-pack-index work will keep closing the gap between "vanilla Git" and the bespoke systems large organizations historically had to build — worth learning these techniques now if you expect to work in or design for very large repositories.
3. **Trunk-based development and CI/CD-driven workflows keep displacing Git Flow** as the default recommendation, tracking the industry-wide maturation of automated testing and deployment pipelines (see the CI/CD skill) — the skill that compounds here is less "know more Git commands" and more "understand how branching strategy and pipeline design are one decision."
4. **AI-assisted commit/PR tooling** (auto-generated commit messages and PR summaries, AI-assisted conflict resolution suggestions) is an active area of tooling investment across GitHub, GitLab, and third-party tools — useful as an accelerant, but the underlying object-model and merge-semantics understanding on this page is what lets you verify, rather than blindly trust, what such tools produce.
5. **Signed commits and supply-chain provenance** are trending from "nice to have" toward "required" in security-conscious and regulated organizations — commit/tag signing (already supported natively) is a safe, low-cost skill to build now ahead of that becoming a hard requirement more broadly.

For your career: the object model and the merge/rebase mental model (this page's Internal Working and Advanced Concepts) are durable knowledge that outlives any specific Git version or hosting platform UI — invest there first, then layer on platform-specific workflow features (GitHub Actions, GitLab CI) as needed for your actual job.
`,

  "cheat-sheet": `
~~~bash
# --- Setup & config ---
git init                          # new repo
git clone <url>                   # copy existing repo with full history
git config --global user.name "Name"
git config --global user.email "you@example.com"

# --- The three trees ---
git status                        # working dir vs index vs HEAD
git add <file>                    # working dir -> staging area (index)
git restore --staged <file>       # index -> working dir (unstage)
git restore <file>                # discard working-dir changes
git commit -m "message"           # index -> repository (new commit)

# --- Branching (branches are POINTERS, not copies) ---
git branch                        # list local branches
git switch -c <name>              # create + switch
git switch <name>                 # switch
git branch -d <name>               # delete (merged only); -D forces

# --- History ---
git log --oneline --graph --all
git show <sha>
git diff / git diff --staged
git blame -- <file>
git log -S"text" -- <path>        # pickaxe search

# --- Merge / rebase ---
git merge <branch>                 # combine, may create merge commit
git rebase <branch>                 # replay commits, new SHAs, linear history
git rebase -i HEAD~4                # squash/reword/drop/reorder
git rebase --abort / git merge --abort   # bail out safely
# RULE: never rebase pushed/shared commits

# --- Conflict resolution ---
# edit file: remove <<<<<<< / ======= / >>>>>>> markers, keep correct content
git add <file> && git commit        # (or: git rebase --continue)

# --- Undo (safe -> dangerous) ---
git revert <sha>                    # new commit that undoes one — safe, shared-branch safe
git reset --soft HEAD~1             # move branch pointer, keep changes staged
git reset --mixed HEAD~1            # move pointer, unstage (default)
git reset --hard HEAD~1             # move pointer, DISCARD working dir changes too
git reflog                          # recover "lost" commits (local safety net)

# --- Stash, cherry-pick, tags ---
git stash / git stash pop
git cherry-pick <sha>
git tag -a v1.0 -m "msg" && git push origin v1.0   # annotated (preferred for releases)

# --- Bisect ---
git bisect start && git bisect bad && git bisect good <sha>
git bisect run <test-script>

# --- Remotes ---
git remote -v
git fetch origin                    # download only, no merge
git pull --rebase                   # fetch + rebase (linear, team-friendly)
git push origin <branch>
git push --force-with-lease         # safe(r) force-push, checks remote hasn't moved

# --- Hooks & hygiene ---
# .git/hooks/pre-commit, pre-push  (or use the pre-commit framework to share them)
printf "*.env\n.venv/\n__pycache__/\n" > .gitignore
git rm --cached <file>              # untrack without deleting locally
~~~
`,

  "flash-cards": `
| Front | Back |
|-------|------|
| What is a Git blob? | The raw content of one file, content-addressed by the hash of a type+length header plus the bytes — no filename attached |
| What is a branch, really? | A 41-byte text file containing the SHA of one commit — a movable pointer, not a copy of files |
| How is a commit's SHA computed? | Hash of "commit <byte-length>\\0" concatenated with the commit's own text (tree SHA, parent SHA(s), author, committer, message) |
| Fast-forward merge vs. true merge? | Fast-forward: target branch hasn't moved, pointer just slides forward, no new commit. True merge: both branches moved, creates a merge commit with two parents |
| Merge vs. rebase, one line each | Merge preserves true (branching) history; rebase rewrites commits onto a new base for a linear history |
| The hard rule about rebase | Never rebase commits that are already pushed and that others may have pulled |
| git revert vs git reset | revert adds a new commit undoing a prior one (safe, shared-branch friendly); reset moves the branch pointer, can discard commits (dangerous if shared) |
| What recovers "lost" commits? | The reflog — records every local HEAD movement, recoverable within its retention window even after a hard reset or branch deletion |
| git bisect complexity | O(log n) tests to find a regression among n commits via binary search |
| Lightweight vs. annotated tag | Lightweight: just a name pointing at a commit. Annotated: a full Git object with message, author, date, optional signature — preferred for releases |
| Does .gitignore remove already-committed files? | No — it only prevents new, untracked files from being staged; already-tracked files need git rm --cached, and secrets need a history rewrite |
| What actually removes a secret from Git history? | git-filter-repo (rewrites every commit containing it) plus force-push plus rotating the credential — rewriting alone does not un-leak an already-cloned secret |
| Trunk-based development vs. Git Flow | Trunk-based: one trunk, short-lived branches, frequent integration, needs strong CI/CD. Git Flow: long-lived develop/release/hotfix branches, suits infrequent versioned releases |
| What does git fetch do that git pull doesn't? | Only downloads new commits/branches into remote-tracking refs — never touches your working directory or merges anything |
| Where do local Git hooks live, and are they cloned? | .git/hooks/ — NOT cloned with the repo; teams share them via a framework like pre-commit |
`,

  mcqs: `
**1. What does creating a new Git branch actually do at the file-system level?**

A) Copies every tracked file into a new directory  B) Writes a small text file (a ref) containing one commit SHA  C) Creates a new .git directory  D) Duplicates the object database

**Answer: B** — a branch is a ref, a pointer to a commit; nothing about the working files is copied.

**2. Your team pushed commits, and a teammate already pulled them. You want to clean up your last 3 commits with an interactive rebase. What should you do?**

A) Rebase and force-push — it's fine since you authored the commits  B) Rebase locally only, then merge a new cleanup commit instead of rewriting pushed history  C) Rebase and ask everyone to force-pull  D) It doesn't matter, Git resolves it automatically

**Answer: B** — the hard rule is never rewrite already-pushed, shared history; add new commits instead once others may have the old ones.

**3. Which command safely undoes a commit that has already been pushed to a shared branch?**

A) git reset --hard HEAD~1 && git push --force  B) git revert <sha>  C) git commit --amend  D) git rebase -i and drop the commit

**Answer: B** — revert adds a new commit reversing the change, without rewriting any existing shared history.

**4. A file was committed with a hardcoded API key three commits ago and has since been pushed. What is the FIRST thing you should do?**

A) Delete the file in a new commit  B) Add the file to .gitignore  C) Rotate/revoke the credential immediately  D) Run git filter-repo only

A committed-and-pushed secret is compromised the moment it's pushed. **Answer: C** — rotation must happen regardless of any later history rewrite, since prior clones/caches may already have the original value.

**5. You need to find exactly which of the last 500 commits introduced a regression, and you have an automated test that fails on the bad commits. What's the most efficient approach?**

A) git log -S to search for suspicious text  B) Manually check out each commit and test it  C) git bisect run with the test script  D) git blame on the affected file

**Answer: C** — bisect binary-searches the range (about log2(500) ≈ 9 tests) and run automates the whole loop against your test script.

**6. What is the key difference between a lightweight and an annotated tag?**

A) Lightweight tags can't be pushed  B) Annotated tags are full Git objects with message/author/date and optional signature; lightweight tags are just a name pointing at a commit  C) Annotated tags automatically trigger CI, lightweight tags don't  D) There is no functional difference

**Answer: B** — annotated tags carry real metadata and are the recommended choice for marking releases.
`,

  "revision-notes": `
**Object model in 6 lines:** Git is a content-addressable object store. A blob is raw file content, hashed by a type+length header plus bytes. A tree is a directory listing of blobs/subtrees. A commit points to one tree plus parent commit(s) plus metadata, and is itself hashed the same way — so a commit's SHA depends on its entire ancestry. A ref (branch/tag) is just a text file naming one SHA. Identical content anywhere dedupes automatically; any tampering changes the hash.

**Three trees in 4 lines:** Working directory (files you edit) → git add → staging area/index (what the next commit will contain) → git commit → repository/HEAD (permanent, content-addressed history). git restore moves data back out of the index or discards working-directory edits; git checkout/switch moves HEAD and the working directory to match a different commit or branch.

**Branches and merging in 6 lines:** A branch is a movable pointer to a commit, not a copy — this explains why branching is instant and why deleting a branch doesn't immediately delete its commits. Fast-forward merge just slides the pointer forward when nothing diverged; a true merge creates a two-parent commit when both sides moved. Rebase replays commits onto a new base, producing new SHAs and a linear history — never do this to commits already pushed and pulled by others. Conflicts appear as <<<<<<</=======/>>>>>>> markers; resolve by editing to the correct final content, then git add and commit (or continue the rebase).

**The safety net in 4 lines:** The reflog records every local HEAD movement and survives resets, rebases, and branch deletions within a retention window — almost nothing is truly lost right away. git revert is the shared-history-safe undo (new commit); git reset moves the pointer and can discard commits (private/local branches only). git bisect binary-searches a regression to the exact commit in O(log n) tests.

**Production practice in 6 lines:** .gitignore from commit one; secrets never committed, and if they are, rotate first then git-filter-repo to purge history, then force-push with full team coordination. Large binaries go through Git LFS, not raw commits. Annotated tags mark releases. Local hooks (pre-commit, pre-push) automate lint/secret-scan/test; share them via a framework since .git/hooks/ isn't cloned. Trunk-based development with short-lived branches suits teams with strong CI/CD (see the CI/CD skill); Git Flow's long-lived branches suit infrequent, versioned release trains.
`,

  "learning-roadmap": `
A realistic path to genuinely fluent, senior-level Git (adjust pace to your background):

**Week 1 — Foundations and the three trees.** Beginner Concepts + Lab 1 (object model archaeology). Daily: make real commits in a scratch repo, run git status and git log obsessively until the three-tree model is automatic. Milestone: explain add/commit/restore/checkout in terms of which tree data moves between.

**Week 2 — Branching and the pointer model.** Advanced Concepts' "branches are pointers" section, plus Intermediate Concepts' merge/conflict/stash/cherry-pick/tag material. Milestone: resolve a real merge conflict end to end without panicking.

**Week 3 — Merge vs. rebase, and the reflog.** Advanced Concepts in full; Lab 2 (merge vs rebase side by side). Deliberately break something with a hard reset, then recover it with the reflog. Milestone: state the "never rebase pushed history" rule and explain WHY, precisely, in terms of SHAs changing.

**Week 4 — Internals.** Internal Working and Architecture sections; hand-derive a blob's SHA and a commit's SHA using git hash-object and git cat-file. Milestone: you can explain to someone else why identical content dedupes and why tampering is detectable.

**Week 5 — Production workflow.** Production Usage, Security, Performance, Scalability sections; Lab 4 (secret purge incident response). Set up .gitignore, a pre-commit secret scanner, and branch protection on a real or practice repository. Milestone: a documented incident-response runbook for a leaked credential.

**Week 6 — Debugging and process design.** Debugging section; Lab 3 (bisect a regression); read the Comparisons and case studies, and write a one-page justification of trunk-based development vs. Git Flow for a hypothetical team. Milestone: confidently choose and defend a branching strategy given a team's CI/CD maturity.

Then continue to the **CI/CD** skill on this platform — everything here about branches, tags, and pushes is the trigger surface that pipeline automation builds directly on top of.
`,

  "official-docs": `
- [Git official documentation](https://git-scm.com/doc) — the reference; includes the full Pro Git book free online.
- [Pro Git book, 2nd edition](https://git-scm.com/book/en/v2) — Scott Chacon and Ben Straub's canonical, freely available book; Chapter 10 ("Git Internals") is the definitive companion to this page's Internal Working section.
- [Git reference manual (man pages)](https://git-scm.com/docs) — precise, per-command documentation; git help <command> works offline too.
- [Git release notes](https://github.com/git/git/blob/master/Documentation/RelNotes) — the authoritative source for "what changed in version X," since Git ships frequent point releases.
- [GitHub Docs](https://docs.github.com/) and [GitLab Docs](https://docs.gitlab.com/) — platform-layer documentation (pull requests, branch protection, Actions/CI) that sits on top of, but is distinct from, core Git.
- [git-filter-repo documentation](https://github.com/newren/git-filter-repo) — the recommended tool and reference for history rewriting.
`,

  books: `
- **Pro Git, 2nd ed.** — Scott Chacon & Ben Straub. Free online; the single best complete Git book, from basics through internals. Read this first.
- **Version Control with Git, 3rd ed.** — Jon Loeliger & Matthew McCullough. Strong on the internals and plumbing commands, complementary to Pro Git's more workflow-focused approach.
- **Git for Teams** — Emma Jane Hogbin Westby. Focused on the human/process side — conventions, workflows, and team communication around Git, not just commands.
- **Building Git** — James Coglan. Walks through implementing Git's core object model and commands from scratch in Ruby; superb for the "build it to truly understand it" learner, directly complementing this page's Internal Working section.
- **The Git internals book (progit "Internals" chapter)** — treat this as a standalone deep-dive if you only read one chapter of Pro Git closely.
`,

  blogs: `
- **git-scm.com/doc** — technically documentation, but the "Everyday Git" and internals guides read like high-quality long-form posts.
- **GitHub Blog** (github.blog) — frequent posts on Git internals, performance work (partial clone, commit-graph), and workflow features as they ship.
- **GitLab Blog** (about.gitlab.com/blog) — strong, practical posts on branching strategy, CI/CD-and-Git interplay, and merge-request workflow design.
- **Julia Evans' blog** (jvns.ca) — several excellent, plainly-explained deep dives into Git internals (packfiles, the index, plumbing commands) with her characteristic clarity.
- **Atlassian Git tutorials** (atlassian.com/git) — clean, example-heavy explanations of merge vs. rebase, workflows, and everyday commands; a good second source after Pro Git.
`,

  "research-papers": `
Git itself is an engineering artifact more than a research subject, so the closest useful "papers" are foundational algorithmic references and Git's own design writing, plus systems papers on version control at scale:

- **Torvalds' original Git design goals and mailing-list posts (2005)** are the closest thing to a founding "paper" — not a formal publication, but the direct primary source for Git's design rationale (distributed, fast, tamper-evident, cheap branching). Worth reading in the git mailing list archives for the authentic reasoning.
- **"An Empirical Study of Long-Lived Code Clones" and similar software-evolution research** using Git histories as their data source illustrate how Git's object model (specifically, its ability to trace exact historical states) enables an entire subfield of empirical software engineering research.
- **The three-way merge algorithm** traces to classic version-control literature predating Git (notably work on diff3 in the Unix/CVS lineage) — if this topic is thin specifically "about Git," the closest foundational reading is the original diff/diff3 algorithm papers (Myers' "An O(ND) Difference Algorithm," 1986) that underlie every modern VCS's merge logic, including Git's.
- **Systems papers on monorepo-scale version control** (Microsoft's published engineering write-ups on VFS for Git and the Windows migration, Google's internal Piper system descriptions) are the closest thing to research-grade material specifically on making a Git-like model work at extreme scale, and are worth reading alongside this page's Scalability section.

Honestly: Git is better studied through its own source code and Pro Git's internals chapter than through an academic literature that mostly doesn't exist for "Git" specifically — treat the above as adjacent foundational reading, not a Git-specific research canon.
`,

  videos: `
- **Linus Torvalds' Google Tech Talk on Git (2007)** — the original "why Git, and why it works this way" talk, straight from the creator; blunt, opinionated, and still substantially accurate about the core design.
- **Scott Chacon's Git talks (various conferences)** — the Pro Git co-author explaining the object model and workflows with the same clarity as the book.
- **"Git From the Bits Up" — Tekin Süleyman** — a well-regarded live-coding walkthrough building up Git's object model conceptually from first principles, an excellent visual companion to this page's Internal Working section.
- **GitHub's official YouTube channel** — regular deep dives into specific features (partial clone, merge queues, Actions) as they ship.
- **Atlassian's Git tutorial video series** — clean, example-driven explanations of merge vs. rebase and common workflows, good for visual learners after reading Pro Git.
`,

  "github-repos": `
- [git/git](https://github.com/git/git) — the actual Git source code; browse builtin/commit.c and the Documentation/technical/ directory for the real, authoritative object-model specification.
- [progit/progit2](https://github.com/progit/progit2) — the Pro Git book's own source, free and open.
- [newren/git-filter-repo](https://github.com/newren/git-filter-repo) — the recommended modern history-rewriting tool.
- [pre-commit/pre-commit](https://github.com/pre-commit/pre-commit) — the standard framework for sharing and installing Git hooks across a team.
- [gitleaks/gitleaks](https://github.com/gitleaks/gitleaks) — a widely used secret-scanning tool for both local pre-commit use and CI.
- [git-lfs/git-lfs](https://github.com/git-lfs/git-lfs) — the large-file-storage extension for tracking model weights, datasets, and media without bloating the core object database.
- [jcoglan/building_git](https://github.com/jcoglan/building_git) — companion code to the "Building Git" book, implementing Git's core model from scratch.
- [k88hudson/git-flight-rules](https://github.com/k88hudson/git-flight-rules) — an excellent, extremely practical "what to do when X goes wrong" reference covering recovery scenarios (detached HEAD, bad rebase, lost commits) directly relevant to this page's Debugging section.
- [git-tips/tips](https://github.com/git-tips/tips) — a large, well-organized collection of everyday and advanced Git command tips.
`,

  "practice-problems": `
**Ordered by skill focus:**

1. *Object model fluency*: in a scratch repo, manually reconstruct — by hand, using hash-object and cat-file only, without git add/commit — a full tree and commit object, then verify git log shows exactly the commit you built.
2. *Three-way merge intuition*: create two branches that each edit different, then the same, lines of one file; predict which will fast-forward, which will auto-merge cleanly, and which will conflict, before running the merge and checking your prediction.
3. *Rebase mechanics*: take a 5-commit branch, interactively rebase to squash 3 of them into one, reword another, and drop the last — verify the resulting single, clean commit's diff is identical to the sum of the originals.
4. *Reflog recovery drill*: intentionally git reset --hard to an earlier commit, then recover the "lost" later commit purely from git reflog without looking up any external reference.
5. *Bisect automation*: given a repo with a script-detectable regression buried in the middle of 50 commits, find it using only git bisect run and a test script — no manual inspection.
6. *History surgery*: given a scratch repo with a committed fake secret three commits back, fully purge it with git-filter-repo and prove (via git log --all --full-history -- path) that no reachable commit still contains it.
7. *Branching-strategy design*: given a hypothetical team's release cadence and CI/CD maturity (provided as a short scenario), write a one-page justified recommendation of trunk-based development vs. Git Flow.

External sets: GitHub's own "Learn Git Branching" (visual, interactive branch/merge/rebase simulator — excellent for building the pointer-mental-model fast), Atlassian's Git tutorials (practical, example-driven), Oh My Git! (a genuinely fun game that teaches the object model and commands through play).
`,

  "architecture-diagram": `
The reference shape of how Git sits inside a modern engineering organization's delivery pipeline — the map every other Cloud & DevOps skill on this platform plugs into:

~~~mermaid
flowchart TB
    Dev["Developer's local repo\n(working dir + index + .git/objects)"] -->|git push| Remote["Hosting platform repo\n(GitHub / GitLab / Bitbucket)"]
    Remote -->|webhook: push / tag / PR opened| CI["CI/CD pipeline\n(GitHub Actions / Jenkins)"]
    CI -->|checkout exact commit SHA| Build["Build & test\nlint, unit tests, security scan"]
    Build -->|image tagged with commit SHA| Registry["Container registry"]
    Registry --> Deploy["Deployment\n(Kubernetes manifests / Terraform-provisioned infra)"]
    Remote -->|branch protection: required review + required checks| Gate["Merge gate on main/trunk"]
    Gate --> Remote
    subgraph "Local safety nets"
        Hooks["pre-commit / pre-push hooks\nlint, secret-scan, fast tests"]
    end
    Dev -.enforced before commit/push.-> Hooks
~~~

Every arrow in this diagram is triggered by, or gated on, a Git event or Git metadata (a push, a tag, a required status check, a commit SHA) — this is the concrete reason the CI/CD, GitHub Actions, Jenkins, Docker, Kubernetes, and Terraform skills all assume Git fluency as a prerequisite.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Git))
    Object model
      Blobs
      Trees
      Commits
      Refs (branches, tags)
      Content-addressing (SHA)
    Three trees
      Working directory
      Staging area / index
      Repository / HEAD
    Branching & integration
      Branches as pointers
      Fast-forward vs true merge
      Rebase & interactive rebase
      Cherry-pick
      Conflict resolution
    Safety nets
      Reflog
      Revert vs reset
      Stash
    Investigation tools
      Bisect
      Blame
      Log pickaxe (-S)
    Production practice
      .gitignore / .gitattributes
      Secrets & history rewriting
      Git LFS for large files
      Hooks (pre-commit, pre-push)
      Tags: lightweight vs annotated
    Scale & performance
      Shallow / partial clone
      Sparse-checkout
      Packfiles & gc
      Commit-graph / multi-pack-index
    Strategy & ecosystem
      Trunk-based development
      Git Flow
      CI/CD triggers
      Hosting platforms (GitHub/GitLab)
~~~
`,
};

export default git;
