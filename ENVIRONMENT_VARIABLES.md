# Environment Variables Documentation

This document describes all environment variables used in the Setu Voice-to-ONDC Gateway application.

## Required Variables

### Database Configuration

#### `DATABASE_URL`
- **Type**: String (Connection URL)
- **Required**: Yes
- **Description**: PostgreSQL database connection string
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://postgres:password@localhost:5432/setu_db`
- **Docker Example**: `postgresql://postgres:password@postgres:5432/setu_db`
- **Notes**: 
  - Used by Prisma for database connections
  - Must include authentication credentials
  - Host should be `postgres` when using Docker Compose

### AI/Translation Configuration

#### `OPENAI_API_KEY`
- **Type**: String (API Key)
- **Required**: Yes (for AI translation features)
- **Description**: OpenAI API key for voice-to-JSON translation
- **Format**: `sk-...` (OpenAI API key format)
- **Example**: `sk-1234567890abcdef1234567890abcdef`
- **Notes**: 
  - Required for AI-powered voice translation
  - Application will use fallback catalog if missing
  - Get from: https://platform.openai.com/api-keys
  - Keep secure and never commit to version control

## Optional Variables

### Application Configuration

#### `NODE_ENV`
- **Type**: String (Environment)
- **Required**: No
- **Default**: `development`
- **Values**: `development`, `production`, `test`
- **Description**: Node.js environment mode
- **Example**: `NODE_ENV=production`
- **Notes**: 
  - Affects logging levels and error handling
  - Set to `production` for deployment

#### `PORT`
- **Type**: Number
- **Required**: No
- **Default**: `3000`
- **Description**: Port number for the Next.js application
- **Example**: `PORT=3000`
- **Notes**: 
  - Used by Next.js server
  - Docker Compose maps this to host port

#### `HOSTNAME`
- **Type**: String
- **Required**: No
- **Default**: `localhost`
- **Description**: Hostname for the application server
- **Example**: `HOSTNAME=0.0.0.0`
- **Notes**: 
  - Set to `0.0.0.0` for Docker deployment
  - Allows external connections in containerized environment

### Development Configuration

#### `NEXT_TELEMETRY_DISABLED`
- **Type**: Boolean (as string)
- **Required**: No
- **Default**: `false`
- **Values**: `1`, `true` (to disable)
- **Description**: Disables Next.js telemetry collection
- **Example**: `NEXT_TELEMETRY_DISABLED=1`
- **Notes**: 
  - Privacy-focused setting
  - Recommended for production deployments

#### `PRISMA_CLI_QUERY_ENGINE_TYPE`
- **Type**: String
- **Required**: No
- **Default**: `binary`
- **Values**: `binary`, `library`
- **Description**: Prisma query engine type
- **Example**: `PRISMA_CLI_QUERY_ENGINE_TYPE=binary`
- **Notes**: 
  - Affects Prisma performance and compatibility
  - `binary` is recommended for production

### Logging and Monitoring

#### `LOG_LEVEL`
- **Type**: String
- **Required**: No
- **Default**: `info`
- **Values**: `error`, `warn`, `info`, `debug`
- **Description**: Application logging level
- **Example**: `LOG_LEVEL=debug`
- **Notes**: 
  - Controls verbosity of application logs
  - Use `debug` for development, `error` for production

#### `ENABLE_QUERY_LOGGING`
- **Type**: Boolean (as string)
- **Required**: No
- **Default**: `false`
- **Values**: `true`, `false`
- **Description**: Enables Prisma query logging
- **Example**: `ENABLE_QUERY_LOGGING=true`
- **Notes**: 
  - Useful for debugging database issues
  - Should be disabled in production for performance

## Environment Files

### `.env` (Local Development)
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/setu_db"

# AI/Translation
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Application
NODE_ENV="development"
PORT=3000
HOSTNAME="localhost"

# Development
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL="debug"
ENABLE_QUERY_LOGGING=true
```

### `.env.production` (Production)
```bash
# Database
DATABASE_URL="postgresql://username:password@production-host:5432/setu_production"

# AI/Translation
OPENAI_API_KEY="sk-production-openai-api-key"

# Application
NODE_ENV="production"
PORT=3000
HOSTNAME="0.0.0.0"

# Production
NEXT_TELEMETRY_DISABLED=1
LOG_LEVEL="error"
ENABLE_QUERY_LOGGING=false
```

### Docker Compose Environment
```yaml
# docker-compose.yml environment section
environment:
  - DATABASE_URL=postgresql://postgres:password@postgres:5432/setu_db
  - OPENAI_API_KEY=${OPENAI_API_KEY}
  - NODE_ENV=production
  - HOSTNAME=0.0.0.0
  - NEXT_TELEMETRY_DISABLED=1
```

## Security Considerations

### Sensitive Variables
The following variables contain sensitive information and should be handled securely:

1. **`DATABASE_URL`**: Contains database credentials
2. **`OPENAI_API_KEY`**: Contains API authentication

### Security Best Practices

#### Local Development
- Use `.env` file (already in `.gitignore`)
- Never commit `.env` files to version control
- Use different credentials for development and production

#### Production Deployment
- Use environment variable injection (Docker secrets, Kubernetes secrets)
- Rotate API keys regularly
- Use least-privilege database users
- Enable SSL/TLS for database connections

#### Docker Deployment
- Use Docker secrets for sensitive variables
- Mount secrets as files instead of environment variables
- Use multi-stage builds to avoid exposing secrets in layers

## Validation and Defaults

The application includes validation for required environment variables:

```typescript
// Environment validation (conceptual)
const requiredEnvVars = [
  'DATABASE_URL',
  // OPENAI_API_KEY is optional - app uses fallback
];

const optionalEnvVars = {
  NODE_ENV: 'development',
  PORT: '3000',
  HOSTNAME: 'localhost',
  LOG_LEVEL: 'info',
};
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
- **Issue**: `Error: P1001: Can't reach database server`
- **Solution**: Check `DATABASE_URL` format and database server status
- **Docker**: Ensure database service is running and accessible

#### Missing API Key Warnings
- **Issue**: `Warning: OPENAI_API_KEY not found, using fallback`
- **Solution**: Set valid OpenAI API key or accept fallback behavior
- **Impact**: AI translation disabled, fallback catalog used

#### Port Conflicts
- **Issue**: `Error: listen EADDRINUSE :::3000`
- **Solution**: Change `PORT` variable or stop conflicting process
- **Docker**: Check port mapping in docker-compose.yml

### Environment Variable Debugging

#### Check Current Values
```bash
# List all environment variables
printenv | grep -E "(DATABASE_URL|OPENAI_API_KEY|NODE_ENV)"

# Check specific variable
echo $DATABASE_URL
```

#### Validate Database Connection
```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"
```

#### Test API Key
```bash
# Test OpenAI API key (requires curl and jq)
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models | jq '.data[0].id'
```

## Migration and Updates

### Updating Environment Variables

1. **Development**: Update `.env` file
2. **Production**: Update deployment configuration
3. **Docker**: Update `docker-compose.yml` or environment files
4. **Restart**: Restart application to pick up changes

### Adding New Variables

1. Update this documentation
2. Add validation in application code
3. Update `.env.example` file
4. Update deployment scripts
5. Communicate changes to team

## Related Documentation

- [Installation Guide](README.md#installation)
- [Docker Setup](DOCKER_SETUP.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Troubleshooting](README.md#troubleshooting)