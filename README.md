# Setu: Voice-to-ONDC Gateway

<p align="center">
  <img src="https://img.shields.io/badge/Setu-Voice%20to%20ONDC-green?style=for-the-badge&logo=voice&logoColor=white" alt="Setu Logo">
  <br>
  <strong>Democratizing Digital Commerce for the Rural Billion</strong>
  <br>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
</p>

---

## The Vision
**We believe that the ability to sell should not be limited by the ability to read.**

Digital commerce (ONDC) and payments (UPI) have revolutionized India, yet 260 million farmers remain excluded. The interface of the internet—typing, reading, navigating forms—is fundamentally alien to them.

**Setu** bridges this divide. It is a Voice-First ONDC Gateway that transforms the most natural human interaction—speech—into complex digital commerce protocols.

## The Solution
**No Forms. No Typing. Just Voice.**

Setu allows an illiterate farmer to list their produce on the Government of India's Open Network for Digital Commerce (ONDC) simply by speaking in their native dialect.

**"Nashik se 500 kilo pyaaz hai, 25 rupaye mein."**

In milliseconds, Setu:
1.  **Understands** the intent using **Google Gemini 3 Flash**.
2.  **Structures** the data into the rigid **Beckn Protocol (v1.2.0)**.
3.  **Broadcasts** the catalog to the national ONDC network.

It turns a simple sentence into a global business transaction.

---

## Implementation & Impact

### Core Technology
We have built a robust, scalable architecture that marries advanced AI with strict government protocols.

| Component | Technology | Role |
|:---|:---|:---|
| **Cognitive Engine** | **Google Gemini 3 Flash** | Understands 12+ Indian languages, dialects, and mixed-speech (Hinglish/Tanglish). |
| **Protocol Layer** | **Beckn v1.2.0** | Ensures strict compliance with ONDC standards for interoperability. |
| **Real-Time Data** | **Agmarknet API** | Fetches live government Mandi prices to empower farmers with fair market data. |
| **Infrastructure** | **Docker & GCP** | Enterprise-grade deployment readiness with containerized services. |

### How It Works
1.  **Tap & Speak**: The farmer presses one big button and speaks naturally.
2.  **AI Processing**: Gemini translates, cleans, and extracts structured data (Commodity, Quantity, Price, Quality).
3.  **Validation**: The system validates the data against ONDC schemas.
4.  **Network Broadcast**: The catalog is instantly visible to thousands of buyers (Retailers, Wholesalers) on the network.

---

## Quick Start

We have automated the entire setup process. You don't need to manually configure Docker, Node.js, or Databases.

### Windows (Recommended)
Run the automated setup script. It installs Docker, Node.js, and DBs for you.
```powershell
.\autoconfig.bat
```

### Linux / macOS
```bash
./autoconfig.sh
```

The app will start at **http://localhost:3001**.

---

## Technology Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, Framer Motion
- **AI Engine**: Google Gemini 3 Flash (via Vercel AI SDK)
- **Database**: PostgreSQL 16 (Production), SQLite (Dev)
- **Protocol**: Beckn Protocol v1.2.0 (ONDC Standard)
- **DevOps**: Docker, Docker Compose

---

## Compliance & Status

- **Status**: Research Prototype (Version 1.0.0)
- **ONDC Compliance**: [Full Protocol Compliance Document](docs/GOI_PROTOCOL_COMPLIANCE.md)
- **Network**: [Real vs Simulated Components](docs/REAL_VS_SIMULATED.md)

*Note: Access to the live ONDC mainnet requires government registration and digital signing keys. This version runs in "Simulation Mode" by default but produces 100% compliant payloads ready for the mainnet.*

---

<div align="center">
  <sub>Built with ❤️ for the AI for Bharat Hackathon 2026</sub>
</div>
