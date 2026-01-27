# Password Synchronization in setup.bat

## Overview

The `setup.bat` script ensures **complete password synchronization** across all configuration points for business continuity. This document explains how passwords are managed and synchronized.

## Password Synchronization Points

The database password must be synchronized across **4 critical points**:

### 1. `.env` File - POSTGRES_PASSWORD
```env
POSTGRES_PASSWORD=<generated_secure_password>
```
- Used by Docker Compose to set the PostgreSQL container password
- Generated using cryptographically secure random bytes

### 2. `.env` File - DATABASE_URL
```env
DATABASE_URL=postgresql://setu:<same_password>@localhost:5432/setu_db
```
- Used by Prisma ORM to connect to the database
- **MUST** contain the exact same password as POSTGRES_PASSWORD

### 3. Docker Compose Configuration
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
```
- Reads password from `.env` file via environment variable substitution
- Automatically synchronized when `.env` is correct

### 4. Prisma Schema
```prisma
datasource db {
  provider = "postgresql"
}
```
- Uses `DATABASE_URL` environment variable from `.env`
- Automatically synchronized when DATABASE_URL is correct

## How setup.bat Ensures Synchronization

### On First Run (No .env exists)
1. Generates a secure random password using PowerShell cryptographic functions
2. Creates `.env` file with:
   - `POSTGRES_PASSWORD=<generated_password>`
   - `DATABASE_URL=postgresql://setu:<generated_password>@localhost:5432/setu_db`
3. Both use the **same password** - synchronized from the start

### On Subsequent Runs (.env exists)
1. **Checks for missing keys**:
   - If `POSTGRES_PASSWORD` is missing → generates new password and adds it
   - If `DATABASE_URL` is missing → generates new password and adds it with matching credentials

2. **Validates password synchronization**:
   - Extracts password from `POSTGRES_PASSWORD`
   - Checks if `DATABASE_URL` contains the same password
   - If mismatch detected → triggers regeneration

3. **Regeneration on mismatch**:
   - Backs up existing `.env` to `.env.backup.<timestamp>`
   - Preserves `OPENAI_API_KEY` if it exists
   - Generates new secure password
   - Recreates `.env` with synchronized credentials
   - Logs the regeneration with timestamp

### Post-Deployment Verification
After Docker containers start:
1. Waits for PostgreSQL to be ready (`pg_isready` check)
2. **Tests authentication** with actual database connection
3. Verifies the password from `.env` works with the running database
4. Fails fast if authentication fails (indicates synchronization issue)

## Password Generation

Passwords are generated using:
```batch
powershell -Command "$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]', '' | Select-Object -First 32"
```

This produces:
- 32 characters long
- Alphanumeric only (safe for URLs)
- Cryptographically secure random bytes
- No special characters that could break connection strings

## Business Continuity Features

### 1. Idempotent Operation
- Safe to run multiple times
- Detects existing configuration
- Only updates what's missing or broken

### 2. Automatic Backup
- Creates timestamped backup before regeneration
- Format: `.env.backup.YYYYMMDD_HHMMSS`
- Preserves previous configuration for rollback

### 3. Preserves User Data
- Keeps `OPENAI_API_KEY` during regeneration
- Doesn't overwrite working configuration
- Only fixes detected issues

### 4. Verification at Multiple Stages
- ✅ Checks password exists in `.env`
- ✅ Validates password matches in DATABASE_URL
- ✅ Tests actual database authentication
- ✅ Verifies Prisma can connect

### 5. Clear Error Messages
```
[WARNING] Password mismatch detected between POSTGRES_PASSWORD and DATABASE_URL
[INFO] Regenerating .env file for consistency...
[OK] .env file regenerated with synchronized credentials
```

## Manual Password Rotation

If you need to manually rotate the password:

### Option 1: Delete .env and Re-run
```batch
del .env
setup.bat
```
- Generates completely new password
- Recreates all containers with new credentials

### Option 2: Edit .env Manually
```batch
1. Stop containers: docker compose down -v
2. Edit .env:
   - Update POSTGRES_PASSWORD=<new_password>
   - Update DATABASE_URL=postgresql://setu:<new_password>@localhost:5432/setu_db
3. Run setup.bat
```
- Script will validate synchronization
- If correct, uses your password
- If mismatch, regenerates with backup

### Option 3: Let Script Detect and Fix
```batch
1. Intentionally break .env (mismatched passwords)
2. Run setup.bat
3. Script detects mismatch and regenerates
```

## Troubleshooting

### Error: "Database authentication failed"
**Cause**: Password in `.env` doesn't match Docker container password

**Solution**:
```batch
docker compose down -v
del .env
setup.bat
```

### Error: "Prisma connection failed"
**Cause**: DATABASE_URL has wrong password

**Solution**: Script will auto-detect and fix on next run, or:
```batch
setup.bat
```

### Warning: "Password mismatch detected"
**Cause**: POSTGRES_PASSWORD and DATABASE_URL have different passwords

**Solution**: Script automatically regenerates with backup - no action needed

## Security Considerations

1. **Never commit `.env` to version control**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Backup files contain passwords**
   - `.env.backup.*` files also contain credentials
   - Should be deleted after verification
   - Not committed to git

3. **Password rotation best practices**
   - Rotate passwords periodically
   - Use `setup.bat` to ensure synchronization
   - Test application after rotation

4. **Production deployments**
   - Use stronger passwords (64+ characters)
   - Consider using secrets management (Azure Key Vault, AWS Secrets Manager)
   - Enable SSL/TLS for database connections

## Summary

The `setup.bat` script ensures **100% password synchronization** across:
- ✅ Environment variables
- ✅ Docker Compose configuration  
- ✅ Prisma connection strings
- ✅ Running database containers

With features:
- ✅ Automatic detection and correction
- ✅ Backup before changes
- ✅ Verification at multiple stages
- ✅ Clear error messages
- ✅ Idempotent operation

**Result**: Business continuity is maintained - the application always has consistent credentials across all components.
