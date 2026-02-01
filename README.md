# Setu: Voice-to-ONDC Gateway

<p align="center">
  <img src="https://img.shields.io/badge/Setu-Voice%20to%20ONDC-green?style=for-the-badge&logo=voice&logoColor=white" alt="Setu Logo">
  <br>
  <strong>Bridging the Digital Divide for Indian Farmers</strong>
  <br>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
</p>

---

## The Problem
**260 Million Indian farmers are invisible to the digital economy.**

Despite the revolution in digital commerce (ONDC) and UPI payments, the average Indian farmer remains excluded. Why?
1.  **Language**: Interfaces are in English, not their mother tongue.
2.  **Literacy**: They cannot read complex forms or type descriptions.
3.  **Complexity**: Uploading catalogs requires technical skills they don't possess.

They are forced to sell to local middlemen at a fraction of the fair market price.

## The Solution
**A single button.**

What if a farmer could sell their crop just by speaking? No typing. No forms. No reading.
Just **Voice**. In their own language.

## The Product: Setu
**Setu** is a production-grade Voice-to-ONDC Gateway that allows illiterate farmers to list their produce on the Government of India's Open Network for Digital Commerce (ONDC) using only voice commands.

It handles the complexity so the farmer doesn't have to.

### How It Works
1.  **Tap & Speak**: The farmer presses one big button and speaks: "Nasik se 500 kilo pyaaz hai, 25 rupaye mein."
2.  **AI Processing**: Our **Google Gemini** integration translates, cleans, and structures this voice data into a standardised Beckn Protocol catalog.
3.  **ONDC Broadcast**: The system instantly broadcasts this catalog to thousands of buyers on the ONDC network (Simulated in v1.0).
4.  **Best Bid**: The farmer receives the best bid from buyers like Reliance Retail or BigBasket instantly.

---

## Key Innovations

| Feature | Description |
|---------|-------------|
| **🎙️ Voice First** | Built for the illiterate. Supports 12 Indian languages including Hindi, Tamil, Telugu, and Marathi. |
| **🧠 Google AI Core** | Powered by **Gemini 1.5 Flash** for understanding nuances, dialects, and agricultural context. |
| **📡 ONDC Ready** | Fully compliant with **Beckn Protocol v1.2.0**. Generates valid JSON schemas ready for the national network. |
| **📈 Live Mandi Prices** | Integrated with **data.gov.in (AGMARKNET)** to fetch real-time government mandi prices for fair valuation. |
| **⚡ Production Sim** | Includes a **Production-Grade Network Simulator (v3.0)** that realistically mimics ONDC latency, buyer competition, and GST logic. |
| **📍 Hyper-Local** | Uses **Google Maps API** to automatically detect the nearest Mandi and logistics partners. |

---

## Quick Start

You don't need to configure databases, API keys, or Docker manually. We have automated everything.

### Windows (Recommended)
Run the automated setup script. It installs Docker, Node.js, and DBs for you.
```powershell
.\setup.ps1
```

### Linux / macOS
```bash
./setup.sh
```

The app will start at **http://localhost:3001**.

---

## Technology Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, Framer Motion
- **AI Engine**: Google Gemini (via Vercel AI SDK)
- **Database**: PostgreSQL 16 (Production), SQLite (Dev)
- **Protocol**: Beckn Protocol v1.2.0 (ONDC Standard)
- **DevOps**: Docker, Docker Compose

---

## Compliance & Status

- **Status**: Production Ready (Version 1.0.0)
- **ONDC Compliance**: [Full Protocol Compliance Document](docs/GOI_PROTOCOL_COMPLIANCE.md)
- **Network**: [Real vs Simulated Components](docs/REAL_VS_SIMULATED.md)

*Note: Access to the live ONDC mainnet requires government registration and digital signing keys. This version runs in "Simulation Mode" by default but produces 100% compliant payloads ready for the mainnet.*

---

<div align="center">
  <sub>Built with ❤️ for the AI for Bharat Hackathon 2026</sub>
</div>
