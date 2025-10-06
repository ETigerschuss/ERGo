# ✅ IMPORTANT: Which Git to Use

## Always use this Git command:
```powershell
& "C:\Program Files\Git\bin\git.exe" <command>
```

## Why?
- The default `git` command uses: `C:\ProgramFiles\nrn\mingw\usr\bin\git.exe` ❌
- This version is **BROKEN** - missing `git-remote-https` helper
- The Program Files version **WORKS** ✅

## Examples:
```powershell
# Check status
& "C:\Program Files\Git\bin\git.exe" status

# Push to GitHub
& "C:\Program Files\Git\bin\git.exe" push origin main

# Switch branches
& "C:\Program Files\Git\bin\git.exe" checkout v0.02-dev
```

## What Just Worked:
✅ Successfully pushed v0.01 to GitHub Pages!
- Commit: 035ae3d
- Branch: main
- URL: https://etigerschuss.github.io/ERGo/
- Your friends can now test the working 16-species version!

---

**Remember:** Always use the full path to Program Files Git!
