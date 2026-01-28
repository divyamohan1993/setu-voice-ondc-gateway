# Setu Demo Guide

This guide provides instructions for demonstrating the Setu Voice-to-ONDC Gateway application.

## Demo Overview

**Duration**: 5-7 minutes  
**Audience**: Stakeholders, investors, potential users  
**Goal**: Showcase how Setu enables illiterate farmers to participate in ONDC

---

## Pre-Demo Checklist

### Technical Setup

- [ ] Application running at http://localhost:3000
- [ ] Database seeded with sample data
- [ ] Network connection stable
- [ ] Browser window maximized (1920x1080 recommended)
- [ ] Screen recording software ready (if recording)
- [ ] Audio working (for narration)

### Environment Verification

```bash
# Verify application is running
curl http://localhost:3000

# Check database connection
docker compose ps

# Verify all services healthy
docker compose logs --tail=10 app
```

### Browser Setup

- **Recommended**: Chrome or Firefox
- **Zoom Level**: 100%
- **Extensions**: Disable ad blockers
- **DevTools**: Close (unless showing technical details)

---

## Demo Script

### Introduction (30 seconds)

**Narration:**
> "Setu is a voice-to-protocol translation system that bridges the digital divide for Indian farmers. It enables illiterate farmers to participate in the Open Network for Digital Commerce by converting vernacular voice commands into valid Beckn Protocol catalogs."

**Actions:**
- Show home page
- Highlight the clean, visual interface
- Point out the absence of text-heavy elements

---

### Part 1: Voice Input Simulation (1 minute)

**Narration:**
> "Let's see how a farmer would create a product listing. In this demo, we're simulating voice input through pre-configured scenarios. In production, this would use actual voice recognition."

**Actions:**
1. Click the voice scenario dropdown
2. Show the two available scenarios:
   - Nasik Onions - Grade A
   - Alphonso Mangoes - Organic
3. Highlight the icons next to each scenario

**Narration:**
> "Let's select the first scenario: 'Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai' - which means 'Hey brother, I have 500 kilos of onions from Nasik, Grade A quality, need to sell today.'"

**Actions:**
4. Select "Nasik Onions - Grade A"
5. Show the loading state (2-3 seconds)

---

### Part 2: AI Translation (1 minute)

**Narration:**
> "Behind the scenes, our AI-powered translation agent is converting this vernacular voice command into a structured Beckn Protocol JSON catalog. It extracts the product name, quantity, location, quality grade, and estimates a market price."

**Actions:**
1. Wait for translation to complete
2. Show success toast notification

**Technical Details** (if audience is technical):
- Uses Vercel AI SDK with GPT-4
- Validates against Zod schemas
- Has fallback mechanism for reliability
- Retry logic with exponential backoff

---

### Part 3: Visual Verification (1.5 minutes)

**Narration:**
> "Now the farmer sees their listing as a visual card. Notice there's minimal text - everything is communicated through icons, colors, and visual elements. This is crucial for users who cannot read."

**Actions:**
1. Point out the large onion icon (128x128px)
2. Highlight the price badge: 40 per kg
3. Show the quantity indicator: 500 kg
4. Point to the India Post logistics logo
5. Emphasize the large thumbprint broadcast button (120x120px)

**Narration:**
> "The farmer can verify their listing visually - they see the onion icon, the price, the quantity, and the logistics provider. Everything is clear without reading a single word."

---

### Part 4: Broadcast to Network (2 minutes)

**Narration:**
> "When the farmer is satisfied with their listing, they simply press this large thumbprint button to broadcast it to the ONDC network."

**Actions:**
1. Click the thumbprint broadcast button
2. Show the broadcast loader animation
3. Wait for 8-second network simulation

**Narration:**
> "The system is now broadcasting the catalog to the ONDC network. In a real scenario, this would reach thousands of potential buyers across India. For this demo, we're simulating the network response."

**Actions:**
4. Show the buyer bid notification when it appears
5. Highlight:
   - Buyer name (e.g., "BigBasket")
   - Bid amount (e.g., 38.50)
   - Buyer logo
   - Timestamp

**Narration:**
> "Within seconds, the farmer receives a bid from a major buyer. The bid amount is 38.50 per kg - slightly below the asking price, which is typical in market negotiations. The farmer can now decide whether to accept this bid or wait for other offers."

---

### Part 5: Debug Console (1 minute)

**Narration:**
> "For developers and administrators, we have a debug console that shows all the technical details."

**Actions:**
1. Click "Debug Console" button
2. Show farmer profile section
3. Scroll to catalog listings
4. Point out the catalog status badges (DRAFT, BROADCASTED)
5. Scroll to network logs

**Narration:**
> "Here we can see all the network traffic - the outgoing catalog broadcast and the incoming buyer bid. This provides complete transparency and helps with debugging."

**Actions:**
6. Click to expand a network log entry
7. Show the formatted JSON payload
8. Highlight the syntax highlighting

---

### Part 6: Second Scenario (Optional, 1 minute)

**Narration:**
> "Let's quickly demonstrate another scenario with a different product."

**Actions:**
1. Navigate back to home page
2. Select "Alphonso Mangoes - Organic"
3. Show the translation
4. Point out the mango icon
5. Show different price and quantity
6. Optionally broadcast to show another buyer bid

---

### Conclusion (30 seconds)

**Narration:**
> "Setu demonstrates how technology can be truly inclusive. By removing language and literacy barriers, we're enabling millions of Indian farmers to participate in digital commerce. The system is built with modern technologies - Next.js 15, TypeScript, Prisma, and Vercel AI SDK - but the interface is designed for users who may have never used a computer before."

**Key Points to Emphasize:**
- [OK] Zero-text interface
- [OK] Visual-first design
- [OK] AI-powered translation
- [OK] Beckn Protocol compliance
- [OK] One-click deployment
- [OK] Production-ready

---

## Q&A Preparation

### Common Questions

**Q: Does this work with actual voice input?**  
A: Currently, we're simulating voice input for demo purposes. In production, we would integrate with speech recognition APIs like Google Speech-to-Text or Azure Speech Services. The translation agent is already designed to handle real voice input.

**Q: What languages are supported?**  
A: Currently Hindi and Hinglish. The system is designed to be extensible to other Indian languages like Marathi, Gujarati, Tamil, Telugu, etc.

**Q: How accurate is the AI translation?**  
A: The translation uses GPT-4 with structured output, which provides high accuracy. We also have a fallback mechanism that ensures the system never fails - if AI translation fails, it uses a pre-validated catalog.

**Q: Is this compliant with ONDC standards?**  
A: Yes, all catalogs conform to the Beckn Protocol specification, which is the standard used by ONDC. We validate all data against Zod schemas to ensure compliance.

**Q: How do you handle errors?**  
A: We have comprehensive error handling at every level - retry logic for AI calls, fallback mechanisms, user-friendly error messages, and detailed error logging for debugging.

**Q: Can this scale to millions of users?**  
A: Yes, the architecture is designed for scale. We use Next.js for server-side rendering, PostgreSQL for reliable data storage, and Docker for easy deployment. The system can be deployed on cloud platforms like AWS, Azure, or GCP.

**Q: What about security?**  
A: We use industry-standard security practices - parameterized queries to prevent SQL injection, input validation with Zod, secure authentication (to be implemented), and HTTPS for all communications.

**Q: How long does deployment take?**  
A: With our one-click deployment script, the entire system can be set up in 2-5 minutes on any machine with Docker installed.

---

## Demo Variations

### Short Demo (3 minutes)
1. Introduction (30s)
2. Voice input and translation (1m)
3. Visual verification and broadcast (1m)
4. Show buyer bid (30s)

### Technical Demo (10 minutes)
1. Full demo script (7m)
2. Show code structure (1m)
3. Explain architecture (1m)
4. Show database schema (1m)

### Investor Demo (5 minutes)
1. Problem statement (1m)
2. Solution overview (1m)
3. Live demo (2m)
4. Market opportunity (1m)

---

## Recording Tips

### Video Recording

**Software Recommendations:**
- OBS Studio (free, cross-platform)
- Loom (easy to use, cloud-based)
- Camtasia (professional, paid)

**Settings:**
- Resolution: 1920x1080 (Full HD)
- Frame Rate: 30 fps
- Audio: 44.1 kHz, stereo
- Format: MP4 (H.264)

**Recording Checklist:**
- [ ] Close unnecessary applications
- [ ] Disable notifications
- [ ] Hide desktop icons
- [ ] Use clean browser profile
- [ ] Test audio levels
- [ ] Do a practice run

### GIF Creation

**For Quick Demos:**
1. Record with OBS or QuickTime
2. Convert to GIF with:
   - GIPHY Capture (macOS)
   - ScreenToGif (Windows)
   - Peek (Linux)

**Optimization:**
- Max size: 10 MB
- Resolution: 1280x720
- Frame rate: 15 fps
- Duration: 10-30 seconds

---

## Presentation Slides

### Slide Deck Structure

**Slide 1: Title**
- Setu: Voice-to-ONDC Gateway
- Bridging the Digital Divide for Indian Farmers

**Slide 2: The Problem**
- 140M+ farmers in India
- 70% have limited literacy
- Excluded from digital commerce
- Language and technical barriers

**Slide 3: The Solution**
- Voice-first interface
- AI-powered translation
- Visual verification
- ONDC integration

**Slide 4: Live Demo**
- [Embedded video or live demo]

**Slide 5: Technology Stack**
- Next.js 15
- TypeScript
- Prisma + PostgreSQL
- Vercel AI SDK
- Docker

**Slide 6: Key Features**
- Zero-text interface
- Beckn Protocol compliance
- Network simulation
- One-click deployment

**Slide 7: Impact**
- Enable digital commerce access
- Increase farmer income
- Reduce middlemen
- Transparent pricing

**Slide 8: Roadmap**
- Actual voice recognition
- Multi-language support
- Mobile app
- ONDC network integration

**Slide 9: Call to Action**
- Try the demo
- Contribute on GitHub
- Partner with us

---

## Post-Demo Follow-Up

### Materials to Share

- [ ] Demo video link
- [ ] GitHub repository
- [ ] Documentation
- [ ] Deployment guide
- [ ] Contact information

### Feedback Collection

Ask attendees:
1. Was the demo clear and easy to follow?
2. What features impressed you most?
3. What concerns or questions do you have?
4. Would you use or recommend this system?
5. What improvements would you suggest?

---

## Demo Troubleshooting

### Issue: Application not loading

**Solution:**
```bash
docker compose restart app
docker compose logs app
```

### Issue: Translation taking too long

**Cause**: API rate limiting or network issues  
**Solution**: Use fallback catalog (automatic)

### Issue: Buyer bid not appearing

**Cause**: Network simulator delay  
**Solution**: Wait full 8 seconds

### Issue: Database connection error

**Solution:**
```bash
docker compose restart db
docker compose exec db pg_isready -U setu -d setu_db
```

---

## Success Metrics

Track demo effectiveness:
- [ ] Audience engagement (questions, reactions)
- [ ] Technical issues encountered
- [ ] Time taken (target: 5-7 minutes)
- [ ] Key messages communicated
- [ ] Follow-up interest generated

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Next Review**: Before each major demo
