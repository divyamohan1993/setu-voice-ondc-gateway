# Setu - Voice-to-ONDC Gateway

A voice-to-protocol translation system that enables illiterate farmers to participate in the Open Network for Digital Commerce (ONDC) by converting vernacular voice commands into valid Beckn Protocol catalogs.

## 🚀 Quick Start

### One-Click Deployment

**Linux / macOS:**
```bash
chmod +x install_setu.sh
./install_setu.sh
```

**Windows:**
```cmd
install_setu.bat
```

The deployment script will automatically:
- ✅ Check dependencies (Docker, Docker Compose)
- ✅ Manage port conflicts
- ✅ Set up environment variables
- ✅ Build and start Docker containers
- ✅ Initialize database with Prisma
- ✅ Seed sample data
- ✅ Display success banner with URLs

**Total deployment time**: 2-5 minutes

### Access the Application

- **Main Application**: http://localhost:3000
- **Debug Interface**: http://localhost:3000/debug

## 📋 Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **4GB RAM** minimum (8GB recommended)
- **2GB free disk space**

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** PostgreSQL 16 (Alpine)
- **ORM:** Prisma
- **AI:** Vercel AI SDK with OpenAI
- **Styling:** Tailwind CSS 4.0
- **UI Components:** Shadcn/UI
- **Animation:** Framer Motion
- **Validation:** Zod
- **Containerization:** Docker & Docker Compose

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment instructions
- **[Quick Reference](DEPLOYMENT_QUICK_REFERENCE.md)** - Common commands and troubleshooting
- **[Requirements](/.kiro/specs/setu-voice-ondc-gateway/requirements.md)** - Detailed requirements
- **[Design Document](/.kiro/specs/setu-voice-ondc-gateway/design.md)** - Architecture and design
- **[Implementation Summary](/.kiro/specs/setu-voice-ondc-gateway/IMPLEMENTATION_SUMMARY.md)** - Development progress

## 🏗️ Architecture

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

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── app/                  # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components (to be added)
├── lib/                 # Utility functions (to be added)
├── public/              # Static assets (to be added)
└── prisma/              # Database schema (to be added)
```

## Development

This project uses:
- TypeScript strict mode for type safety
- Tailwind CSS for styling
- ESLint for code quality

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
