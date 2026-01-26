# PowerShell Environment Rules

**CRITICAL: These rules MUST be followed for ALL command executions in this workspace.**

## Environment Details
- **Current System:** Windows 11 64-bit
- **Shell:** PowerShell (cmd)
- **Platform:** Windows (win32)
- **Script Execution:** DISABLED by default
- **Authorization:** GRANTED to bypass execution restrictions

### Cross-Platform Notes
- **Linux:** May be Ubuntu 25.04 or latest version
- **Linux Shell:** Bash (standard Unix commands work)
- **Linux Scripts:** No execution policy restrictions
- On Linux: Use `&&` for command chaining, `./script.sh` works directly

## Mandatory Rules

### 1. Command Separators
- ❌ **NEVER use ampersand (`&`)** - it does NOT work in PowerShell
- ✅ **ALWAYS use semicolon (`;`)** for command separation
- Example: `command1 ; command2 ; command3`

### 2. Script Execution
- ❌ **NEVER run scripts directly** - execution policy will block them
- ✅ **ALWAYS use bypass** for script execution:
  - PowerShell scripts: `powershell -ExecutionPolicy Bypass -File script.ps1`
  - Inline commands: `powershell -ExecutionPolicy Bypass -Command "command"`
  - Batch files: Can run directly (`.bat` files work)

### 3. Execution Strategy
- ❌ **NEVER run raw command → wait for failure → fetch output → fix → retry**
- ✅ **ALWAYS apply fixes BEFORE first execution**
- ✅ **Get it right the FIRST time** - saves 2+ minutes per command

### 4. Common Fixes to Apply BEFORE Running

#### NPM/Node Commands
```powershell
# ❌ BAD (will fail)
npm install && npm run build

# ✅ GOOD (works first time)
npm install ; npm run build
```

#### Running Scripts
```powershell
# ❌ BAD (will fail)
./setup.ps1

# ✅ GOOD (works first time)
powershell -ExecutionPolicy Bypass -File setup.ps1
```

#### Multiple Commands
```powershell
# ❌ BAD (will fail)
cd src && npm test && cd ..

# ✅ GOOD (works first time)
cd src ; npm test ; cd ..
```

#### Docker Commands
```powershell
# ❌ BAD (will fail)
docker build -t app . && docker run app

# ✅ GOOD (works first time)
docker build -t app . ; docker run app
```

## Authorization Status
✅ **AUTHORIZED** to automatically bypass PowerShell execution restrictions
- No need to ask permission each time
- Apply bypasses automatically
- User confirmed on: 2026-01-27

## Time Savings
Following these rules saves approximately **2 minutes per command** by:
1. Avoiding initial failure (0 seconds vs 30 seconds)
2. Avoiding output fetch (0 seconds vs 60 seconds)
3. Avoiding fix and retry (0 seconds vs 30 seconds)

**Total: 2 seconds (correct first time) vs 120 seconds (fail-fetch-fix-retry)**

## Quick Reference

| Scenario | ❌ Wrong | ✅ Correct |
|----------|---------|-----------|
| Command separator | `cmd1 && cmd2` | `cmd1 ; cmd2` |
| Run PS script | `./script.ps1` | `powershell -ExecutionPolicy Bypass -File script.ps1` |
| Inline PS command | `powershell "Get-Date"` | `powershell -ExecutionPolicy Bypass -Command "Get-Date"` |
| Multiple commands | `npm i && npm test` | `npm i ; npm test` |

---

**Remember: ALWAYS check and fix BEFORE running. Never waste time on preventable failures.**
