# Setu - Voice-to-ONDC Gateway

<div align="center">

![Setu Logo](https://img.shields.io/badge/Setu-Voice%20to%20ONDC-green?style=for-the-badge&logo=voice&logoColor=white)

**Bridging the Digital Divide for Indian Farmers**

A voice-to-protocol translation system that enables illiterate farmers to participate in the Open Network for Digital Commerce (ONDC) by converting vernacular voice commands into valid Beckn Protocol catalogs.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)

</div>

---

## 📖 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🚀 Quick Start](#-quick-start)
- [🏗️ Architecture](#️-architecture)
- [💻 Technology Stack](#-technology-stack)
- [📦 Installation](#-installation)
- [🎮 Usage Guide](#-usage-guide)
- [🔌 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)

---

## 🎯 Project Overview

### The Problem

Millions of Indian farmers are excluded from digital commerce due to:
- **Language barriers** - Complex English interfaces
- **Literacy challenges** - Text-heavy applications
- **Technical complexity** - Complicated catalog creation processes
- **Protocol knowledge** - Unfamiliarity with ONDC/Beckn standards

### The Solution

Setu transforms the farmer experience by providing:

🎤 **Voice-First Interface** - Farmers speak in their native language (Hindi/Hinglish)  
🤖 **AI-Powered Translation** - Converts voice to structured Beckn Protocol JSON  
👁️ **Visual Verification** - Icon-based interface requiring zero reading ability  
📡 **ONDC Integration** - Generates compliant catalogs for the Open Network  
🌐 **Network Simulation** - Demonstrates buyer interactions and responses  

### Key Features

- **Zero-Text Interface**: Visual icons and symbols replace all text
- **Vernacular Voice Input**: Supports Hindi and Hinglish commands
- **Beckn Protocol Compliance**: Generates valid ONDC catalog entries
- **Real-time Translation**: AI-powered voice-to-JSON conversion
- **Accessibility First**: Designed for illiterate users
- **Network Simulation**: Mock buyer responses for demonstration
- **One-Click Deployment**: Complete setup in under 5 minutes

### Screenshots

<div align="center">

#### Voice Scenario Selection
![Voice Injector Interface](docs/screenshots/voice-injector.png)
*Dropdown interface with pre-configured voice scenarios*

#### Visual Catalog Verification
![Visual Verifier Card](docs/screenshots/visual-verifier.png)
*Icon-based catalog display with large touch targets*

#### Buyer Bid Notification
![Buyer Bid Response](docs/screenshots/buyer-bid.png)
*Simulated buyer response with bid details*

#### Network Log Viewer (Debug)
![Network Logs](docs/screenshots/network-logs.png)
*Raw JSON traffic for debugging and transparency*

</div>

### Live Demo

🎥 **[Watch Demo Video](docs/demo/setu-demo.mp4)** - See Setu in action

🌐 **[Try Live Demo](https://setu-demo.vercel.app)** - Experience the interface

---

## 🚀 Quick Start

### ⚡ One-Click Deployment (Works on Blank Systems!)

The installation script **automatically handles everything**, including Docker installation if needed.

#### Option 1: Docker Deployment (Recommended)

**Linux / macOS:**
```bash
chmod +x install_setu.sh
./install_setu.sh
```

**Windows:**
```cmd
install_setu.bat
```

#### Option 2: Local Development (No Docker Required)

**If Docker virtualization is not supported:**

**Linux / macOS:**
```bash
chmod +x setup_local.sh
./setup_local.sh
```

**Windows:**
```cmd
setup_local.bat
```

This uses SQLite instead of PostgreSQL. See [LOCAL_SETUP.md](LOCAL_SETUP.md) for details.

### What the Script Does Automatically

The deployment script is **fully automated** and handles:

- ✅ **Installs Docker** if not present (Windows/macOS/Linux)
- ✅ **Starts Docker daemon** if not running
- ✅ **Manages port conflicts** (3000, 5432) - offers to free ports
- ✅ **Creates .env file** with secure defaults
- ✅ **Builds and starts Docker containers**
- ✅ **Initializes PostgreSQL database**
- ✅ **Runs Prisma migrations**
- ✅ **Seeds sample data** (2 farmers, 2 catalogs)
- ✅ **Verifies deployment** and displays success banner

**Total deployment time**: 
- First run (with Docker installation): 5-10 minutes
- Subsequent runs: 2-3 minutes

### Access the Application

After installation completes:

- **Main Application**: http://localhost:3000
- **Debug Interface**: http://localhost:3000/debug
- **Database**: PostgreSQL on localhost:5432

### System Requirements

**Minimum**:
- 4GB RAM (8GB recommended)
- 2GB free disk space
- Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+, Debian 10+, Fedora 32+, Arch)

**No prerequisites needed** - the script installs Docker automatically!

### Detailed Installation Guide

For troubleshooting, manual installation, and advanced options:
- **[Complete Installation Guide](INSTALLATION.md)** - Detailed installation instructions, troubleshooting, and Docker installation
- **[Quick Reference Card](QUICK_REFERENCE.md)** - Common commands, workflows, and troubleshooting at a glance

### Helper Scripts

The project includes automated helper scripts:

| Script | Purpose | Platform |
|--------|---------|----------|
| `install_setu.bat` | Complete automated installation | Windows |
| `install_setu.sh` | Complete automated installation | Linux/macOS |
| `start_docker.bat` | Start Docker Desktop and wait for ready | Windows |
| `verify_installation.bat` | Verify installation is working | Windows |
| `verify_installation.sh` | Verify installation is working | Linux/macOS |

---

## 🏗️ Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        VI[Voice Injector Component]
        VV[Visual Verifier Component]
        NLV[Network Log Viewer]
    end
    
    subgraph "Server Layer"
        SA[Server Actions]
        TA[Translation Agent]
        NS[Network Simulator]
    end
    
    subgraph "Data Layer"
        PRISMA[Prisma ORM]
        PG[(PostgreSQL 16)]
    end
    
    subgraph "External Services"
        AI[Vercel AI SDK]
        OPENAI[OpenAI GPT-4]
    end
    
    VI -->|Select Scenario| SA
    SA -->|Voice Text| TA
    TA -->|Request| AI
    AI -->|API Call| OPENAI
    OPENAI -->|Structured JSON| TA
    TA -->|Validate| SA
    SA -->|Save| PRISMA
    PRISMA -->|Store| PG
    SA -->|Return Catalog| VV
    VV -->|Broadcast Action| SA
    SA -->|Trigger| NS
    NS -->|Mock Response| SA
    SA -->|Log Event| PRISMA
    NLV -->|Query Logs| PRISMA
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Voice      │  │   Visual     │  │   Network    │     │
│  │  Injector    │  │  Verifier    │  │ Log Viewer   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Server Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Server     │  │ Translation  │  │   Network    │     │
│  │   Actions    │  │    Agent     │  │  Simulator   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌──────────────┐  ┌──────────────────────────────────┐   │
│  │   Prisma     │──│      PostgreSQL 16               │   │
│  │     ORM      │  │  (Farmers, Catalogs, Logs)       │   │
│  └──────────────┘  └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Voice Input**: Farmer selects pre-configured voice scenario
2. **AI Translation**: Vercel AI SDK converts text to Beckn Protocol JSON
3. **Validation**: Zod schemas ensure protocol compliance
4. **Visual Display**: Catalog rendered as accessibility-focused card
5. **Broadcast**: User confirms and publishes to network
6. **Simulation**: Mock buyer responses demonstrate ONDC interactions
7. **Logging**: All events stored for debugging and transparency

### Deployment Architecture

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "App Container (Port 3000)"
            NEXT[Next.js Application]
            PRISMA[Prisma Client]
        end
        
        subgraph "DB Container (Port 5432)"
            PG[PostgreSQL 16]
        end
        
        NEXT -->|Database Queries| PRISMA
        PRISMA -->|TCP Connection| PG
    end
    
    subgraph "External Services"
        OPENAI[OpenAI API]
    end
    
    USER[User Browser] -->|HTTP :3000| NEXT
    NEXT -->|AI Requests| OPENAI
    
    SCRIPT[install_setu.sh] -.->|Orchestrates| NEXT
    SCRIPT -.->|Initializes| PG
```

### User Flow Diagram

```mermaid
sequenceDiagram
    participant F as Farmer
    participant UI as Voice Injector
    participant SA as Server Action
    participant TA as Translation Agent
    participant AI as OpenAI API
    participant DB as Database
    participant VV as Visual Verifier
    participant NS as Network Simulator
    
    F->>UI: Select voice scenario
    UI->>SA: translateVoiceAction(text)
    SA->>TA: translateVoiceToJson(text)
    
    alt API Key Available
        TA->>AI: Generate structured JSON
        AI-->>TA: Beckn Protocol JSON
    else No API Key / Failure
        TA-->>TA: Use fallback catalog
    end
    
    TA-->>SA: Validated catalog
    SA->>DB: Save catalog (DRAFT)
    DB-->>SA: Catalog ID
    SA-->>UI: Catalog data
    UI->>VV: Display visual card
    
    F->>VV: Click thumbprint button
    VV->>SA: broadcastCatalogAction(id)
    SA->>DB: Update status (BROADCASTED)
    SA->>NS: simulateBroadcast(id)
    
    Note over NS: Wait 8 seconds
    
    NS->>DB: Log INCOMING_BID
    NS-->>SA: Buyer bid data
    SA-->>VV: Show notification
    VV->>F: Display buyer bid
```

---

## 💻 Technology Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript (strict mode)
- **[React 19](https://react.dev/)** - UI library with latest features

### Database & ORM
- **[PostgreSQL 16](https://www.postgresql.org/)** - Robust relational database
- **[Prisma](https://www.prisma.io/)** - Type-safe database ORM
- **[Zod](https://zod.dev/)** - Schema validation and type inference

### AI & Translation
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - Structured AI output generation
- **[OpenAI GPT-4](https://openai.com/)** - Language model for translation
- **Beckn Protocol** - ONDC-compliant catalog structure

### UI & Styling
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/UI](https://ui.shadcn.com/)** - Accessible component library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library

### Development & Deployment
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container orchestration
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[fast-check](https://fast-check.dev/)** - Property-based testing

---

## 📦 Installation

### Method 1: One-Click Deployment (Recommended)

**Linux / macOS:**
```bash
# Clone the repository
git clone <repository-url>
cd setu-voice-ondc-gateway

# Make script executable and run
chmod +x install_setu.sh
./install_setu.sh
```

**Windows:**
```cmd
# Clone the repository
git clone <repository-url>
cd setu-voice-ondc-gateway

# Run deployment script
install_setu.bat
```

### Method 2: Manual Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd setu-voice-ondc-gateway

# 2. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 3. Start services with Docker
docker compose up -d --build

# 4. Wait for database to be ready
docker compose exec db pg_isready -U setu -d setu_db

# 5. Initialize database
docker compose exec app npx prisma db push
docker compose exec app node prisma/seed.js

# 6. Verify deployment
curl http://localhost:3000
```

### Method 3: Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up database (requires local PostgreSQL)
npx prisma db push
npx prisma db seed

# 3. Start development server
npm run dev

# 4. Open browser
open http://localhost:3000
```

### Environment Configuration

Create `.env` file with the following variables:

```env
# Database Configuration
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db

# AI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Application Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**Note**: The system works without an OpenAI API key using fallback responses, but AI-powered translation provides better results.

---

## 🎮 Usage Guide

### 1. Voice Scenario Selection

1. Open http://localhost:3000
2. Click the dropdown menu to see available voice scenarios:
   - **Nasik Onions - Grade A**: "Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai"
   - **Alphonso Mangoes - Organic**: "20 crate Alphonso aam hai, Ratnagiri ka, organic certified hai"
3. Select a scenario to trigger AI translation

### 2. Visual Verification

After translation, the system displays a visual card with:
- **Large commodity icon** (128x128px) - Visual product representation
- **Price badge** - High-contrast price display with currency
- **Quantity indicator** - Visual representation with bag icons
- **Logistics logo** - Provider identification (India Post, Delhivery, etc.)
- **Thumbprint button** - Large (120x120px) broadcast confirmation

### 3. Broadcast Confirmation

1. Review the visual catalog card
2. Click the large thumbprint button to broadcast
3. Wait for 8-second network simulation
4. View buyer bid notification with:
   - Buyer name (Reliance Fresh, BigBasket, Paytm Mall, etc.)
   - Bid amount (catalog price ± 5-10%)
   - Timestamp

### 4. Debug Interface

Access http://localhost:3000/debug to view:
- **Network Log Viewer** - Raw JSON traffic with syntax highlighting
- **Catalog List** - All farmer catalogs with status indicators
- **Farmer Profiles** - Sample farmer data from seed script

### 5. Sample Voice Commands

The system recognizes these patterns in Hindi/Hinglish:

```
Product + Quantity + Location + Quality + Urgency

Examples:
- "500 kilo pyaaz hai Nasik se, Grade A hai"
- "20 crate aam hai, Alphonso variety, organic certified"
- "100 kg tomato hai, fresh hai, aaj hi bechna hai"
```

---

## 🔌 API Documentation

### Server Actions

Setu uses Next.js Server Actions for type-safe client-server communication.

#### `translateVoiceAction(voiceText: string)`

Translates voice text to Beckn Protocol JSON.

**Parameters:**
- `voiceText` (string): Raw voice input text

**Returns:**
```typescript
interface TranslateVoiceResult {
  success: boolean;
  catalog?: BecknCatalogItem;
  error?: string;
}
```

**Example:**
```typescript
const result = await translateVoiceAction("500 kilo pyaaz hai Nasik se, Grade A hai");
if (result.success) {
  console.log("Catalog:", result.catalog);
}
```

#### `saveCatalogAction(farmerId: string, catalog: BecknCatalogItem)`

Saves a catalog to the database.

**Parameters:**
- `farmerId` (string): Unique farmer identifier
- `catalog` (BecknCatalogItem): Valid Beckn Protocol catalog object

**Returns:**
```typescript
interface SaveCatalogResult {
  success: boolean;
  catalogId?: string;
  error?: string;
}
```

**Example:**
```typescript
const result = await saveCatalogAction("farmer-123", catalogData);
if (result.success) {
  console.log("Catalog ID:", result.catalogId);
}
```

#### `broadcastCatalogAction(catalogId: string)`

Broadcasts a catalog and triggers network simulation.

**Parameters:**
- `catalogId` (string): Unique catalog identifier

**Returns:**
```typescript
interface BroadcastResult {
  success: boolean;
  bid?: BuyerBid;
  error?: string;
}

interface BuyerBid {
  buyerName: string;
  bidAmount: number;
  timestamp: Date;
  buyerLogo: string;
}
```

**Example:**
```typescript
const result = await broadcastCatalogAction("catalog-456");
if (result.success) {
  console.log("Buyer bid:", result.bid);
}
```

#### `getNetworkLogsAction(filter?: string, page?: number)`

Fetches network logs with pagination and filtering.

**Parameters:**
- `filter` (string, optional): Filter by log type ("ALL", "OUTGOING_CATALOG", "INCOMING_BID")
- `page` (number, optional): Page number (default: 1)

**Returns:**
```typescript
interface NetworkLogsResult {
  logs: NetworkLog[];
  totalPages: number;
}

interface NetworkLog {
  id: string;
  type: "OUTGOING_CATALOG" | "INCOMING_BID";
  payload: any;
  timestamp: Date;
}
```

**Example:**
```typescript
const result = await getNetworkLogsAction("INCOMING_BID", 1);
console.log("Logs:", result.logs);
```

### Beckn Protocol Schema

All catalogs conform to the Beckn Protocol specification:

```typescript
interface BecknCatalogItem {
  descriptor: {
    name: string;        // Product name
    symbol: string;      // Icon URL
  };
  price: {
    value: number;       // Price amount
    currency: string;    // Currency code (default: "INR")
  };
  quantity: {
    available: {
      count: number;     // Available quantity
    };
    unit: string;        // Unit of measurement (kg, crate, etc.)
  };
  tags: {
    grade?: string;              // Quality grade (A, B, C)
    perishability?: string;      // Perishability level (low, medium, high)
    logistics_provider?: string; // Logistics provider name
  };
}
```

### Database Schema

**Farmer Model:**
```prisma
model Farmer {
  id              String    @id @default(cuid())
  name            String
  locationLatLong String?
  languagePref    String    @default("hi")
  upiId           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  catalogs        Catalog[]
}
```

**Catalog Model:**
```prisma
model Catalog {
  id          String        @id @default(cuid())
  farmerId    String
  becknJson   Json
  status      CatalogStatus @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  farmer      Farmer        @relation(fields: [farmerId], references: [id])
}

enum CatalogStatus {
  DRAFT
  BROADCASTED
  SOLD
}
```

**NetworkLog Model:**
```prisma
model NetworkLog {
  id        String         @id @default(cuid())
  type      NetworkLogType
  payload   Json
  timestamp DateTime       @default(now())
}

enum NetworkLogType {
  OUTGOING_CATALOG
  INCOMING_BID
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- translation-agent.test.ts
```

### Test Structure

```
tests/
├── unit/                    # Unit tests for specific functions
│   ├── translation-agent.test.ts
│   ├── beckn-schema.test.ts
│   └── network-simulator.test.ts
├── property/                # Property-based tests
│   └── beckn-schema.property.test.ts
└── fixtures/                # Test data and mocks
    └── sample-catalogs.ts
```

### Unit Tests

Unit tests verify specific examples and edge cases:

```typescript
// Example: Testing translation fallback
test("uses fallback when API key is missing", async () => {
  delete process.env.OPENAI_API_KEY;
  const result = await translateVoiceToJson("test input");
  expect(result).toBeDefined();
  expect(result.descriptor.name).toBe("Nasik Onions");
});
```

### Property-Based Tests

Property tests verify universal properties across all inputs:

```typescript
// Example: Testing Beckn schema round-trip
test("Beckn catalog serialization preserves structure", () => {
  fc.assert(
    fc.property(becknCatalogArbitrary, (catalog) => {
      const serialized = JSON.stringify(catalog);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(catalog);
    }),
    { numRuns: 100 }
  );
});
```

### Testing Guidelines

- **Write both unit and property-based tests** for comprehensive coverage
- **Test edge cases**: empty inputs, boundary values, error conditions
- **Use descriptive test names** that explain what is being tested
- **Mock external dependencies** (AI API, database) when appropriate
- **Aim for 80%+ code coverage** on critical paths

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem:** Port 3000 or 5432 is already occupied.

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5432
lsof -ti:5432 | xargs kill -9

# Or use the deployment script which handles this automatically
./install_setu.sh
```

#### 2. Docker Not Running

**Problem:** Docker daemon is not running.

**Solution:**
```bash
# Start Docker Desktop (macOS/Windows)
# Or start Docker service (Linux)
sudo systemctl start docker

# Verify Docker is running
docker ps
```

#### 3. Database Connection Failed

**Problem:** Application cannot connect to PostgreSQL.

**Solution:**
```bash
# Check if database container is running
docker compose ps

# Check database logs
docker compose logs db

# Restart database container
docker compose restart db

# Verify database is ready
docker compose exec db pg_isready -U setu -d setu_db
```

#### 4. Prisma Schema Sync Issues

**Problem:** Database schema is out of sync with Prisma schema.

**Solution:**
```bash
# Push schema changes to database
docker compose exec app npx prisma db push

# Or reset database (WARNING: deletes all data)
docker compose exec app npx prisma migrate reset

# Regenerate Prisma client
docker compose exec app npx prisma generate
```

#### 5. AI Translation Not Working

**Problem:** Translation returns fallback data instead of AI-generated catalogs.

**Solution:**
```bash
# Check if OpenAI API key is set
docker compose exec app printenv | grep OPENAI_API_KEY

# Add API key to .env file
echo "OPENAI_API_KEY=your-key-here" >> .env

# Restart application
docker compose restart app
```

**Note:** The system works without an API key using fallback responses, but AI provides better results.

#### 6. Build Failures

**Problem:** Docker build fails or application won't start.

**Solution:**
```bash
# Clean Docker cache and rebuild
docker compose down -v
docker system prune -a
docker compose up -d --build

# Check application logs
docker compose logs app

# Verify Node modules are installed
docker compose exec app ls node_modules
```

#### 7. Seed Data Not Loading

**Problem:** Database is empty after deployment.

**Solution:**
```bash
# Run seed script manually
docker compose exec app node prisma/seed.js

# Verify data was inserted
docker compose exec db psql -U setu -d setu_db -c "SELECT * FROM farmers;"
```

#### 8. UI Not Updating

**Problem:** Changes not reflected in the browser.

**Solution:**
```bash
# Clear Next.js cache
docker compose exec app rm -rf .next

# Rebuild application
docker compose restart app

# Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
```

### Debug Mode

Access the debug interface at http://localhost:3000/debug to:
- View raw network logs
- Inspect catalog data
- Check farmer profiles
- Monitor system state

### Logs and Monitoring

```bash
# View all logs
docker compose logs

# View application logs only
docker compose logs app

# View database logs only
docker compose logs db

# Follow logs in real-time
docker compose logs -f app

# View last 100 lines
docker compose logs --tail=100 app
```

### Getting Help

If you encounter issues not covered here:

1. **Check the logs** using `docker compose logs`
2. **Review the requirements** in `.kiro/specs/setu-voice-ondc-gateway/requirements.md`
3. **Check the design document** in `.kiro/specs/setu-voice-ondc-gateway/design.md`
4. **Open an issue** on the project repository with:
   - Error messages
   - Steps to reproduce
   - System information (OS, Docker version)
   - Relevant log output

---

## 📚 Documentation

### Project Documentation

- **[Requirements Document](.kiro/specs/setu-voice-ondc-gateway/requirements.md)** - Complete project requirements and acceptance criteria
- **[Design Document](.kiro/specs/setu-voice-ondc-gateway/design.md)** - Architecture, component design, and technical specifications
- **[Tasks Document](.kiro/specs/setu-voice-ondc-gateway/tasks.md)** - Implementation tasks and progress tracking

### Component Documentation

- **[Beckn Schema](lib/beckn-schema.README.md)** - Beckn Protocol schema definitions and validation
- **[Icon Mapper](lib/icon-mapper.README.md)** - Commodity icon mapping logic
- **[Network Simulator](lib/network-simulator.README.md)** - Network simulation implementation
- **[Components](components/README.md)** - Frontend component documentation

### Additional Resources

- **[Beckn Protocol Specification](https://developers.becknprotocol.io/)** - Official Beckn Protocol documentation
- **[ONDC Documentation](https://ondc.org/)** - Open Network for Digital Commerce resources
- **[Next.js 15 Documentation](https://nextjs.org/docs)** - Next.js framework documentation
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI SDK documentation
- **[Prisma Documentation](https://www.prisma.io/docs)** - Prisma ORM documentation

---

## 🤝 Contributing

We welcome contributions to Setu! Here's how you can help:

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone <your-fork-url>
   cd setu-voice-ondc-gateway
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Run tests**
   ```bash
   npm test
   npm run test:coverage
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Ensure all tests pass

### Code Style Guidelines

- **TypeScript**: Use strict mode, explicit types, and avoid `any`
- **React**: Use functional components with hooks
- **Naming**: Use descriptive names (camelCase for variables, PascalCase for components)
- **Comments**: Add JSDoc comments for public functions
- **Formatting**: Use Prettier (runs automatically on commit)

### Testing Requirements

- Write unit tests for all new functions
- Write property-based tests for data transformations
- Ensure 80%+ code coverage for new code
- All tests must pass before merging

### Commit Message Format

Follow conventional commits:

```
feat: add new feature
fix: fix bug in component
docs: update documentation
test: add tests for feature
refactor: refactor code structure
style: format code
chore: update dependencies
```

### Areas for Contribution

- **Voice Recognition**: Implement actual voice input (currently simulated)
- **Language Support**: Add support for more Indian languages
- **UI Enhancements**: Improve accessibility and visual design
- **Testing**: Increase test coverage
- **Documentation**: Improve guides and examples
- **Performance**: Optimize database queries and rendering
- **Features**: Add new functionality (see open issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **ONDC Team** - For creating the Open Network for Digital Commerce
- **Beckn Protocol** - For the open protocol specification
- **Vercel** - For the AI SDK and Next.js framework
- **Indian Farmers** - The inspiration and target users of this system

---

## 📞 Contact

For questions, suggestions, or support:

- **Project Repository**: [GitHub Repository URL]
- **Documentation**: [Documentation URL]
- **Issues**: [GitHub Issues URL]

---

<div align="center">

**Built with ❤️ for Indian Farmers**

*Empowering the backbone of India's economy through technology*

</div
