# Environment Variables Documentation

This document describes all environment variables used in the Setu Voice-to-ONDC Gateway application.

## Required Variables

### Database Configuration

#### `DATABASE_URL`
- **Type**: String (Connection URL)
- **Required**: Yes
- **Format**: 
  - SQLite (Development): `file:./dev.db`
  - PostgreSQL (Production): `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Description**: Database connection string used by Prisma ORM
- **Used By**: Prisma Client, all database operations

### AI Configuration (Google Gemini)

#### `GOOGLE_GENERATIVE_AI_API_KEY`
- **Type**: String (API key)
- **Required**: Yes (Critical for Voice & Translation)
- **Format**: `AIzaSy...` (Google API Key format)
- **Description**: Google Gemini API key for:
  - Voice command understanding
  - Multi-language translation
  - Commodity recognition
  - Quality assessment
- **Used By**: `lib/voice-conversation-agent.ts`, `lib/translation-agent.ts`
- **How to Obtain**: https://aistudio.google.com/apikey

### Government APIs

#### `DATA_GOV_IN_API_KEY`
- **Type**: String
- **Required**: Yes
- **Description**: API key for Open Government Data (OGD) Platform India
- **Purpose**: Fetching live mandi prices from AGMARKNET
- **How to Obtain**: https://data.gov.in/developer

#### `GOOGLE_MAPS_API_KEY`
- **Type**: String
- **Required**: Yes
- **Description**: Google Maps API Key (Geocoding + Distance Matrix)
- **Purpose**: Finding nearest mandis based on location
- **How to Obtain**: https://console.cloud.google.com/google/maps-apis

## Optional Variables

### Application Configuration

#### `NODE_ENV`
- **Type**: String (enum)
- **Default**: `development`
- **Values**: `development`, `production`
- **Description**: Application environment mode
- **Effects**:
  - `production`: Enables security headers, performance optimizations, minified logs
  - `development`: Verbose logging, debug features

#### `PORT`
- **Type**: Number
- **Default**: `3001`
- **Description**: Port number for the application server

### ONDC Network Simulation

#### `ONDC_SIMULATION_MODE`
- **Type**: Boolean
- **Default**: `true`
- **Description**: Controls whether to use the internal network simulator or attempt real ONDC calls
- **Values**: `true` (use simulator), `false` (use real network - requires credentials)

## Environment File Templates

### Development (.env)

```env
# Database
DATABASE_URL="file:./dev.db"

# AI & APIs
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
DATA_GOV_IN_API_KEY=579b...
GOOGLE_MAPS_API_KEY=AIzaSy...

# App Config
NODE_ENV=development
PORT=3001
ONDC_SIMULATION_MODE=true
```

### Production (.env.production)

```env
# Database (PostgreSQL recommended)
DATABASE_URL="postgresql://setu:secure_password@db:5432/setu_db"
POSTGRES_USER=setu
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=setu_db

# AI & APIs
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
DATA_GOV_IN_API_KEY=579b...
GOOGLE_MAPS_API_KEY=AIzaSy...

# App Config
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3001
ONDC_SIMULATION_MODE=true
```

## Security Best Practices

### 1. API Key Protection
- Never commit `.env` files to version control
- Rotate `GOOGLE_GENERATIVE_AI_API_KEY` regularly
- Restrict Google Maps API keys to specific domains/IPs

### 2. Database Security
- Use strong, random passwords for production databases
- Ensure database ports (5432) are not exposed to the public internet
- Use SSL connections for PostgreSQL in production

### 3. ONDC Credentials (Future)
- When switching `ONDC_SIMULATION_MODE=false`, store signing keys in secure secret managers (e.g., AWS Secrets Manager, HashiCorp Vault), never in plain text env files.

## Troubleshooting

### "Gemini API Error"
- **Check**: Is `GOOGLE_GENERATIVE_AI_API_KEY` valid?
- **Test**: Curl the Gemini API manually to verify quota.

### "No Live Prices"
- **Check**: Is `DATA_GOV_IN_API_KEY` valid?
- **Note**: The API has rate limits. The app will fall back to historical averages if the live API fails.

### "Location Service Failed"
- **Check**: Does `GOOGLE_MAPS_API_KEY` have Geocoding and Distance Matrix APIs enabled?
- **Check**: Is billing enabled on the Google Cloud Project?
