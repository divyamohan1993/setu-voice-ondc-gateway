# 🌱 AgriVox: Smart Agriculture Voice Platform

<p align="center">
  <img src="https://img.shields.io/badge/AgriVox-Smart%20Agriculture-10B981?style=for-the-badge&logo=leaf&logoColor=white" alt="AgriVox Logo">
  <br>
  <strong>AI-Powered Smart Agriculture with Voice, Vision & Weather Intelligence</strong>
  <br>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/AI-Gemini%203.0%20Flash-4285F4?logo=google" alt="Gemini AI">
  <img src="https://img.shields.io/badge/Weather-OpenWeatherMap-orange" alt="Weather API">
</p>

---

## 🎯 Problem Statement

India's agricultural sector faces critical challenges:
- **65% of farmers** cannot access digital marketplaces due to literacy barriers
- **Real-time weather data** exists but isn't actionable for farmers
- **Crop diseases** cause ₹50,000 crore losses annually from late detection
- **Market price information** is scattered and hard to access

## 💡 Our Solution: AgriVox

**AgriVox** is a comprehensive AI-powered platform that brings smart agriculture capabilities to every farmer through **Voice AI**, **Vision AI**, and **Environmental Intelligence**.

---

## ⭐ Key Differentiating Features

### 🔥 Feature 1: Weather-Based Smart Farming (NEW)

Real-time agricultural weather intelligence with actionable recommendations:

```typescript
// lib/weather-service.ts
const weather = await getWeatherData("Nashik");
// Returns:
// - Current conditions (temp, humidity, wind)
// - 5-day forecast with precipitation
// - Agricultural alerts (frost, heat, drought, rain)
// - Smart recommendations (irrigation, spraying, harvest timing)
```

**Capabilities:**
- ☀️ Real-time weather for 20+ major agricultural regions
- 🌧️ 5-day forecast with precipitation predictions
- ⚠️ Agricultural alerts (frost, heat stress, storms, drought)
- 💧 Irrigation scheduling based on soil moisture estimates
- 🌾 Harvest condition assessment
- 💨 Spraying conditions for pesticide application

### 🔥 Feature 2: Crop Health Analyzer with Vision AI (NEW)

AI-powered disease detection using Gemini's multi-modal capabilities:

```typescript
// lib/crop-health-analyzer.ts
const analysis = await analyzeCropHealth(imageBase64, "image/jpeg");
// Returns:
// - Crop identification with confidence score
// - Disease/pest detection
// - Treatment recommendations
// - Voice response in 12+ languages
```

**Capabilities:**
- 📸 Upload crop images for instant analysis
- 🔬 Detect 50+ common diseases and pests
- 💊 Get treatment recommendations (organic + chemical)
- 🌿 Identify nutrient deficiencies
- 🔊 Voice responses in farmer's language
- 📋 Offline disease database for common crops

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AgriVox Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Voice AI  │  │  Vision AI  │  │  Weather AI │              │
│  │  (Speech)   │  │  (Images)   │  │  (Forecast) │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────┬───────┴────────┬───────┘                      │
│                  ▼                ▼                              │
│         ┌─────────────────────────────────┐                      │
│         │     Google Gemini 3.0 Flash     │                      │
│         │   (Multi-Modal AI Engine)       │                      │
│         └─────────────────────────────────┘                      │
│                        │                                         │
│         ┌──────────────┼──────────────┐                         │
│         ▼              ▼              ▼                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Mandi     │  │   ONDC      │  │  OpenWeather │             │
│  │   Prices    │  │   Network   │  │     API      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### AI & ML
| Component | Technology | Purpose |
|:----------|:-----------|:--------|
| **Voice AI** | Gemini 3.0 Flash | Multi-language voice understanding |
| **Vision AI** | Gemini Vision | Crop disease detection from images |
| **Weather AI** | OpenWeatherMap + ML | Agricultural forecasting |
| **NLP** | Zod Schema | Structured output generation |

### Backend
- **Framework**: Next.js 15 (App Router + Server Actions)
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL 16 / SQLite
- **ORM**: Prisma 7

### APIs & Protocols
- **Commerce**: ONDC Beckn Protocol v1.2.0
- **Pricing**: Government Agmarknet API
- **Weather**: OpenWeatherMap API
- **Real-time**: WebSocket + Server-Sent Events

### DevOps
- **Container**: Docker + Docker Compose
- **Cloud**: GCP (Cloud Run, Cloud SQL)
- **CI/CD**: GitHub Actions

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+ or Docker
- Google AI API Key ([Get here](https://makersuite.google.com/app/apikey))
- OpenWeatherMap API Key ([Get here](https://openweathermap.org/api)) - *optional*

### Setup

**Windows:**
```powershell
.\autoconfig.bat
```

**Linux/macOS:**
```bash
chmod +x autoconfig.sh && ./autoconfig.sh
```

### Manual Setup

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Add your API keys:
# GEMINI_API_KEY=your_gemini_key
# OPENWEATHERMAP_API_KEY=your_weather_key (optional)

# Initialize database
npm run prisma:generate
npm run prisma:push

# Start development
npm run dev
```

Visit **http://localhost:3001**

---

## 📁 Project Structure

```
agrivox/
├── app/
│   ├── page.tsx                    # Main entry
│   ├── actions.ts                  # Voice actions
│   ├── smart-agriculture-actions.ts # Weather + Health actions (NEW)
│   └── globals.css                 # Design system
├── components/
│   └── AgriVoxInterface.tsx        # Main voice interface
├── lib/
│   ├── weather-service.ts          # Weather API (NEW)
│   ├── crop-health-analyzer.ts     # Vision AI (NEW)
│   ├── voice-conversation-agent.ts # Voice AI
│   └── mandi-price-service.ts      # Price service
├── prisma/
│   └── schema.prisma               # Database schema
└── docs/
    └── submission/                 # Hackathon docs
```

---

## 🌍 Supported Languages

| Language | Code | Voice | Vision | Weather |
|:---------|:-----|:-----:|:------:|:-------:|
| Hindi | hi-IN | ✅ | ✅ | ✅ |
| Marathi | mr-IN | ✅ | ✅ | ✅ |
| Tamil | ta-IN | ✅ | ✅ | ✅ |
| Telugu | te-IN | ✅ | ✅ | ✅ |
| Kannada | kn-IN | ✅ | ✅ | ✅ |
| Bengali | bn-IN | ✅ | ✅ | ✅ |
| Gujarati | gu-IN | ✅ | ✅ | ✅ |
| Punjabi | pa-IN | ✅ | ✅ | ✅ |
| Odia | or-IN | ✅ | ✅ | ✅ |
| Assamese | as-IN | ✅ | ✅ | ✅ |
| Malayalam | ml-IN | ✅ | ✅ | ✅ |
| English | en-IN | ✅ | ✅ | ✅ |

---

## 📊 Unique Value Proposition

| Feature | AgriVox | Traditional Apps |
|:--------|:-------:|:----------------:|
| Voice-First Interface | ✅ | ❌ |
| Multi-Modal AI (Voice + Vision) | ✅ | ❌ |
| Weather-Based Recommendations | ✅ | ❌ |
| Crop Disease Detection | ✅ | ❌ |
| 12+ Indian Languages | ✅ | Limited |
| Zero Literacy Barrier | ✅ | ❌ |
| ONDC Integration | ✅ | ❌ |
| IoT Ready | ✅ | ❌ |

---

## 🔒 Security & Compliance

- ✅ ONDC Protocol Compliance (Beckn v1.2.0)
- ✅ Data encryption at rest and in transit
- ✅ GDPR-ready data handling
- ✅ Government API integration standards

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built for Hacksagon 2026 - Open Innovation Track</sub>
  <br>
  <sub>🌱 Voice AI + Vision AI + Weather Intelligence = Smart Agriculture</sub>
</div>
