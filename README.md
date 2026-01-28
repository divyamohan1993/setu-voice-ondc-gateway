# Setu - Voice-to-ONDC Gateway (India)

<div align="center">

![Setu Logo](https://img.shields.io/badge/Setu-Voice%20to%20ONDC-green?style=for-the-badge&logo=voice&logoColor=white)

**Bridging the Digital Divide for Indian Farmers**

[![CI](https://github.com/divyamohan1993/setu-voice-ondc-gateway/actions/workflows/ci.yml/badge.svg)](https://github.com/divyamohan1993/setu-voice-ondc-gateway/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

</div>

---

**Setu** is a voice-to-protocol translation system designed to enable illiterate farmers to participate in the **Open Network for Digital Commerce (ONDC)**. By converting vernacular voice commands into valid Beckn Protocol catalogs, Setu removes the barriers of language, literacy, and technical complexity.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

### The Problem
Millions of Indian farmers are excluded from digital commerce due to:
- **Language barriers**: Complex English interfaces.
- **Literacy challenges**: Text-heavy applications.
- **Technical complexity**: Complicated catalog creation processes.

### The Solution
Setu transforms the farmer experience by providing:
- **Voice-First Interface**: Farmers speak in their native language (Hindi/Hinglish).
- **AI-Powered Translation**: Converts voice to structured Beckn Protocol JSON.
- **Visual Verification**: Icon-based interface requiring zero reading ability.
- **ONDC Integration**: Generates compliant catalogs for the Open Network.
- **Network Simulation**: Demonstrates buyer interactions and responses.

### Key Features
- **Zero-Text Interface**: Visual icons and symbols replace all text.
- **Vernacular Voice Input**: Supports Hindi and Hinglish commands.
- **Beckn Protocol Compliance**: Generates valid ONDC catalog entries.
- **Real-time Translation**: AI-powered voice-to-JSON conversion.
- **One-Click Deployment**: Complete setup in under 5 minutes.

---

## Quick Start

### One-Click Setup (Recommended)

We provide a single entry point to auto-configure your environment, install dependencies, and start the app.

#### Windows
Double-click **`START.bat`** in the root directory.

*Or run via PowerShell:*
```powershell
.\setup.ps1
```

#### Linux / macOS
```bash
chmod +x setup.sh
./setup.sh
```

**What this script does:**
- [OK] Checks/Installs Node.js & dependencies.
- [OK] Configures Docker or Local SQLite mode automatically.
- [OK] Sets up `.env` with secure defaults.
- [OK] Runs database migrations and seeds data.
- [OK] Launches the application.

---

## Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        VI[Voice Injector]
        VV[Visual Verifier]
        NLV[Network Logs]
    end
    
    subgraph "Server Layer"
        SA[Server Actions]
        TA[Translation Agent]
        NS[Network Simulator]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL / SQLite)]
        PRISMA[Prisma ORM]
    end
    
    subgraph "AI Services"
        OpenAI[OpenAI GPT-4]
    end
    
    VI -->|Voice Input| SA
    SA -->|Text| TA
    TA -->|Prompt| OpenAI
    OpenAI -->|JSON| TA
    TA -->|Beckn Catalog| SA
    SA -->|Save| DB
    SA -->|Catalog| VV
```

---

## Technology Stack

| Category | Technologies |
|----------|--------------|
| **Core Framework** | [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) (Prod), SQLite (Dev), [Prisma](https://www.prisma.io/) |
| **AI & Logic** | [Vercel AI SDK](https://sdk.vercel.ai/), OpenAI GPT-4, Beckn Protocol |
| **DevOps** | Docker, Docker Compose, GitHub Actions |
| **Testing** | [Vitest](https://vitest.dev/), Fast-Check |

---

## Installation

For detailed installation instructions, including manual setup and troubleshooting, please refer to the documentation:

- **[Installation Guide](docs/guides/INSTALLATION.md)**
- **[Local Setup Guide](docs/guides/LOCAL_SETUP.md)**

### Environment Variables

The setup scripts will create a `.env` file for you. Key variables include:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
OPENAI_API_KEY="sk-..."  # Optional (Fallback mode available)
NODE_ENV="development"
```

---

## Usage Guide

1.  **Select Voice Scenario**: Choose a pre-recorded Hindi command (e.g., "500kg onions from Nasik").
2.  **AI Transformation**: Watch as the system converts speech to a structured ONDC catalog.
3.  **Visual Verification**: The farmer sees an icon-based card (Product Image + Price + Quantity).
4.  **Broadcast**: Click the **Thumbprint** button to publish to the network.
5.  **Simulate Bid**: Wait for a simulated buyer bid (e.g., from "Reliance Fresh").

Access the **Debug Interface** at `/debug` to view raw Beckn Protocol JSON logs.

---

## API Documentation

Our Server Actions provide the core logic:

- `translateVoiceAction(text)`: Converts vernacular text to Beckn JSON.
- `broadcastCatalogAction(id)`: Publishes catalog to the mock ONDC network.
- `getNetworkLogsAction(filter)`: Retrieves transaction logs.

See [API Documentation](docs/api.md) for full details.

---

## Testing

We use **Vitest** for unit and integration testing.

```bash
npm test              # Run all tests
npm run test:coverage # Generate coverage report
```

---

## Contributing

We welcome contributions! Please follow our guidelines:

1.  Read the [Code of Conduct](CODE_OF_CONDUCT.md).
2.  Check [CONTRIBUTING.md](CONTRIBUTING.md) for workflow details.
3.  Open an Issue or Pull Request.

**Contributors:**
- [@divyamohan1993](https://github.com/divyamohan1993)
- [@kumkum-thakur](https://github.com/kumkum-thakur)

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

<div align="center">
  <sub>Built with love for AI for Bharat Hackathon 2026</sub>
</div>

