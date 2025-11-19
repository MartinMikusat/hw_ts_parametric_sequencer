# Force Push Guide

## Problem
The remote repository still contains the old git history with `node_modules/` and `dist/` directories, making it too large. The local repository has been cleaned (only 72KB), but pushing fails with 502/503 errors.

## Solution: Force Push with Lease

Since we've rewritten history locally, we need to force push. However, GitHub might reject a regular force push if the remote repository is too large.

### Option 1: Force Push with Lease (Recommended)

```bash
# First, try to fetch to see what's on remote (might fail if repo is too large)
git fetch origin

# If fetch works, use force-with-lease (safer - only pushes if remote hasn't changed)
git push --force-with-lease origin main

# If that doesn't work, use regular force push
git push --force origin main
```

### Option 2: If Force Push Fails

If GitHub continues to reject the push due to repository size:

1. **Create a fresh repository:**
   ```bash
   # On GitHub, delete the old repository
   # Create a new repository with the same name
   # Then push:
   git remote remove origin
   git remote add origin https://github.com/MartinMikusat/hw_ts_parametric_sequencer.git
   git push -u origin main
   ```

2. **Or use BFG Repo-Cleaner** (if you have access to the remote):
   ```bash
   # Install BFG: brew install bfg (or download from https://rtyley.github.io/bfg-repo-cleaner/)
   bfg --delete-folders node_modules --delete-folders dist
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   git push --force origin main
   ```

### Option 3: Incremental Cleanup

If the repository is accessible but large:

```bash
# Try pushing in smaller chunks
git push origin main --force

# If that fails, try:
git push origin main --force --no-verify
```

## Verification

After pushing, verify the remote is clean:

```bash
git ls-remote origin
git clone --depth=1 https://github.com/MartinMikusat/hw_ts_parametric_sequencer.git test-clone
cd test-clone
du -sh .git
# Should be small (~72KB)
```

## Current Local State

- ✅ Local repository: 72KB (clean)
- ✅ No node_modules or dist in history
- ✅ All commits cleaned
- ⚠️ Remote: Unknown state (likely still has old history)

## Notes

- **502/503 errors** from GitHub usually mean:
  - The repository is too large
  - GitHub is rate-limiting
  - Temporary GitHub issues
  
- **Force pushing rewrites remote history** - make sure no one else is working on this repo, or coordinate with them first.

