# Setu Voice-to-ONDC Gateway - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- PostgreSQL 16 (via Docker)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database

```bash
docker-compose up -d postgres
```

Wait for PostgreSQL to be ready (about 10 seconds).

### 3. Initialize Database

```bash
npx prisma db push
npx prisma db seed
```

This creates the database schema and populates it with sample data:
- 2 farmers (Ramesh, Suresh)
- 2 sample catalogs (Onions, Mangoes)
- 3 network log entries

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:3001

## Using the Application

### Home Page (/)

1. **Select a Voice Scenario**
   - Choose from 3 pre-configured scenarios:
     - Onions from Nasik (500 kg, Grade A)
     - Alphonso Mangoes (20 crates, organic)
     - Wheat from Punjab (1000 kg, fresh harvest)

2. **View Translated Catalog**
   - After selection, the system translates voice to Beckn Protocol JSON
   - Visual card displays:
     - Large commodity icon
     - Price badge
     - Quantity information
     - Quality grade
     - Logistics provider

3. **Broadcast Catalog**
   - Click the large thumbprint button
   - Wait 12-25 seconds for production-grade network simulation
   - View buyer bid notification

### Debug Console (/debug)

1. **View System Stats**
   - Farmer profile information
   - Catalog statistics
   - Database connection status

2. **Browse Catalogs**
   - See all catalogs created by the farmer
   - Status indicators (Draft, Broadcasted, Sold)
   - Product details and timestamps

3. **Monitor Network Logs**
   - View all network events
   - Filter by type (All, Outgoing, Incoming)
   - Expand entries to see raw JSON
   - Auto-refresh every 10 seconds

## Architecture Overview

```

                         Frontend                            
           
   VoiceInjector  VisualVerifier  NetworkLogView     
           

                            
                            

                    Server Actions                           
           
    Translate      Save Catalog     Broadcast        
           

                            
                            

                      Backend Services                       
           
  Translation        Prisma          Network         
     Agent             ORM          Simulator        
           

                            
                            

                    PostgreSQL Database                      
           
     Farmers         Catalogs      NetworkLogs       
           

```

## Key Features

### 1. Voice-to-Protocol Translation
- Simulated voice input through dropdown scenarios
- AI-powered translation to Beckn Protocol JSON
- Fallback mechanism for reliability

### 2. Visual Verification
- Accessibility-first design for illiterate users
- Large icons and high-contrast colors
- Minimal text, maximum visual communication

### 3. Network Simulation (Production Grade)
- 12-25 second delay simulating real network latency
- Multi-phase transaction tracking (Auth -> Validation -> Broadcast)
- Mock buyer bids from realistic buyers (JioMart, BigBasket, Amazon)
- Complete network event logging with Transaction IDs

### 4. Developer Tools
- Debug console with system stats
- Raw JSON traffic viewer
- Real-time log updates

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS 4.0, Shadcn/UI
- **Animations**: Framer Motion
- **Backend**: Next.js Server Actions
- **AI**: Google Gemini (Vercel AI SDK)
- **Database**: PostgreSQL 16, Prisma ORM
- **Validation**: Zod schemas
- **Notifications**: Sonner

## Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://setu:setu123@localhost:5432/setu_db"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-key"  # Optional, fallback available
DATA_GOV_IN_API_KEY="your-key"                  # Optional, for live prices
GOOGLE_MAPS_API_KEY="your-key"                  # Optional, for location
PORT=3001
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# View PostgreSQL logs
docker-compose logs postgres
```

### Port Already in Use

```bash
# Kill process on port 3001
npx kill-port 3001

# Or use a different port
PORT=3002 npm run dev
```

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
npx prisma db seed
```

## Development Workflow

1. **Make Changes**: Edit files in `app/`, `components/`, or `lib/`
2. **Hot Reload**: Next.js automatically reloads changes
3. **Check Logs**: View console for errors or debug info
4. **Test Flow**: Use voice scenarios to test end-to-end
5. **Debug**: Use `/debug` page to inspect data

## Testing

### Manual Testing
1. Test all 3 voice scenarios
2. Verify catalog display
3. Test broadcast functionality
4. Check debug console
5. Test filtering and pagination

### Automated Testing (Future)
- Unit tests with Vitest
- Property-based tests with fast-check
- E2E tests with Playwright

## Next Steps

1. **Phase 8**: Add actual commodity and logo images
2. **Phase 9**: Create one-click deployment script
3. **Phase 10**: Implement comprehensive testing
4. **Phase 11**: Write documentation
5. **Phase 12**: Final polish and optimization

## Support

For issues or questions:
1. Check the implementation summary documents
2. Review the design document
3. Inspect the debug console
4. Check database logs

## License

This project is part of the Setu Voice-to-ONDC Gateway system.
