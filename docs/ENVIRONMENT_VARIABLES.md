# Environment Variables Documentation

This document describes all environment variables used in the Setu Voice-to-ONDC Gateway application.

## Required Variables

### Database Configuration

#### `DATABASE_URL`
- **Type**: String (PostgreSQL connection URL)
- **Required**: Yes
- **Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Example**: `postgresql://setu:setu_password@localhost:5432/setu_db`
- **Description**: PostgreSQL database connection string used by Prisma ORM
- **Used By**: Prisma Client, all database operations

#### `POSTGRES_USER`
- **Type**: String
- **Required**: Yes (for Docker deployment)
- **Default**: `setu`
- **Description**: PostgreSQL database username
- **Used By**: Docker Compose PostgreSQL container

#### `POSTGRES_PASSWORD`
- **Type**: String
- **Required**: Yes (for Docker deployment)
- **Default**: `setu_password`
- **Description**: PostgreSQL database password
- **Security**: Should be changed in production environments
- **Used By**: Docker Compose PostgreSQL container

#### `POSTGRES_DB`
- **Type**: String
- **Required**: Yes (for Docker deployment)
- **Default**: `setu_db`
- **Description**: PostgreSQL database name
- **Used By**: Docker Compose PostgreSQL container

### AI Configuration

#### `OPENAI_API_KEY`
- **Type**: String (API key)
- **Required**: No (fallback mechanism available)
- **Format**: `sk-...` (OpenAI API key format)
- **Example**: `sk-proj-abc123...`
- **Description**: OpenAI API key for AI-powered voice translation
- **Fallback**: System uses hardcoded fallback catalog if missing
- **Used By**: Translation Agent (`lib/translation-agent.ts`)
- **How to Obtain**: 
  1. Sign up at https://platform.openai.com/
  2. Navigate to API Keys section
  3. Create new secret key
- **Cost**: Pay-per-use based on OpenAI pricing
- **Note**: Application works without this key using fallback responses

## Optional Variables

### Application Configuration

#### `NODE_ENV`
- **Type**: String (enum)
- **Required**: No
- **Default**: `development`
- **Values**: `development`, `production`, `test`
- **Description**: Node.js environment mode
- **Effects**:
  - `development`: Enables verbose logging, hot reloading
  - `production`: Optimized builds, minimal logging
  - `test`: Test-specific configurations
- **Used By**: Next.js, Prisma, logging systems

#### `NEXT_TELEMETRY_DISABLED`
- **Type**: String (boolean)
- **Required**: No
- **Default**: `0` (enabled)
- **Values**: `0` (enabled), `1` (disabled)
- **Description**: Disables Next.js anonymous telemetry collection
- **Recommended**: `1` for privacy
- **Used By**: Next.js framework

#### `PORT`
- **Type**: Number
- **Required**: No
- **Default**: `3000`
- **Description**: Port number for the Next.js application server
- **Used By**: Next.js server
- **Note**: Docker Compose maps this to host port 3000

### Logging Configuration

#### `LOG_LEVEL`
- **Type**: String (enum)
- **Required**: No
- **Default**: `info`
- **Values**: `error`, `warn`, `info`, `debug`
- **Description**: Application logging verbosity level
- **Used By**: Custom logging utilities

## Environment File Setup

### Development (.env.local)

```env
# Database Configuration
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db

# AI Configuration (optional)
OPENAI_API_KEY=sk-your-key-here

# Application Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

### Production (.env)

```env
# Database Configuration
DATABASE_URL=postgresql://setu:STRONG_PASSWORD_HERE@db:5432/setu_db
POSTGRES_USER=setu
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
POSTGRES_DB=setu_db

# AI Configuration
OPENAI_API_KEY=sk-your-production-key-here

# Application Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Docker Deployment (.env)

```env
# Database Configuration
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db
DATABASE_URL=postgresql://setu:setu_password@db:5432/setu_db

# AI Configuration (optional)
OPENAI_API_KEY=

# Application Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Security Best Practices

### 1. Never Commit .env Files
- Add `.env`, `.env.local`, `.env.production` to `.gitignore`
- Use `.env.example` as a template without sensitive values

### 2. Use Strong Passwords
- Generate random passwords for `POSTGRES_PASSWORD`
- Minimum 16 characters with mixed case, numbers, symbols
- Example: `openssl rand -base64 32`

### 3. Rotate API Keys
- Regularly rotate `OPENAI_API_KEY`
- Use separate keys for development and production
- Monitor API usage for anomalies

### 4. Restrict Database Access
- Use firewall rules to limit database port access
- Only allow connections from application containers
- Use SSL/TLS for database connections in production

### 5. Environment-Specific Values
- Never use development credentials in production
- Use different database names per environment
- Implement proper secret management (e.g., AWS Secrets Manager, HashiCorp Vault)

## Validation

### Checking Environment Variables

```bash
# Check if all required variables are set
docker compose exec app printenv | grep -E "DATABASE_URL|POSTGRES_|OPENAI_API_KEY|NODE_ENV"

# Verify database connection
docker compose exec app npx prisma db execute --stdin <<< "SELECT 1"

# Test OpenAI API key (if set)
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Common Issues

#### Database Connection Failed
- **Symptom**: `P1001: Can't reach database server`
- **Check**: Verify `DATABASE_URL` format and credentials
- **Solution**: Ensure PostgreSQL container is running and accessible

#### OpenAI API Errors
- **Symptom**: Translation fails with API errors
- **Check**: Verify `OPENAI_API_KEY` is valid and has credits
- **Solution**: System automatically falls back to hardcoded catalog

#### Port Conflicts
- **Symptom**: `EADDRINUSE: address already in use`
- **Check**: Port 3000 or 5432 already occupied
- **Solution**: Stop conflicting services or change port in docker-compose.yml

## Deployment Script Integration

The `install_setu.sh` deployment script automatically:

1. **Checks for .env file existence**
2. **Creates .env with defaults if missing**
3. **Validates required variables**
4. **Prompts for missing critical values**
5. **Sets up database connection string**

### Script-Generated .env

```bash
# Generated by install_setu.sh
DATABASE_URL=postgresql://setu:setu_password@db:5432/setu_db
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db
OPENAI_API_KEY=
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Troubleshooting

### Variable Not Loading

**Problem**: Environment variable not accessible in application

**Solutions**:
1. Restart application: `docker compose restart app`
2. Rebuild containers: `docker compose up -d --build`
3. Check variable name spelling and case sensitivity
4. Verify `.env` file is in project root directory

### Database URL Format Errors

**Problem**: Invalid `DATABASE_URL` format

**Correct Format**:
```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

**Examples**:
```
# Local development
postgresql://setu:password@localhost:5432/setu_db

# Docker container
postgresql://setu:password@db:5432/setu_db

# With SSL
postgresql://setu:password@db:5432/setu_db?sslmode=require
```

### OpenAI API Key Issues

**Problem**: API key not working

**Checks**:
1. Key format starts with `sk-`
2. Key has not expired
3. Account has available credits
4. No extra spaces or quotes in `.env` file

**Testing**:
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY_HERE"
```

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
