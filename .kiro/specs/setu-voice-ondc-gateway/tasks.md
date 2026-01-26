# Implementation Tasks: Setu - Voice-to-ONDC Gateway

## Phase 1: Project Setup and Infrastructure

### 1.1 Initialize Next.js Project
- [x] 1.1.1 Create Next.js 15 app with TypeScript, Tailwind CSS, and ESLint
- [x] 1.1.2 Configure TypeScript strict mode in tsconfig.json
- [x] 1.1.3 Set up Tailwind CSS 4.0 configuration
- [x] 1.1.4 Initialize Git repository with .gitignore

### 1.2 Install Core Dependencies
- [x] 1.2.1 Install Zod for schema validation
- [x] 1.2.2 Install Vercel AI SDK (@ai-sdk/openai, ai)
- [x] 1.2.3 Install Framer Motion for animations
- [x] 1.2.4 Install Prisma and PostgreSQL client
- [x] 1.2.5 Install utility libraries (clsx, tailwind-merge, lucide-react)

### 1.3 Setup Shadcn/UI
- [x] 1.3.1 Initialize Shadcn/UI configuration
- [x] 1.3.2 Install button component
- [x] 1.3.3 Install card component
- [x] 1.3.4 Install toast/sonner component
- [x] 1.3.5 Install badge component
- [x] 1.3.6 Install dialog component
- [x] 1.3.7 Install select/dropdown component

### 1.4 Docker Configuration
- [~] 1.4.1 Create Dockerfile for Next.js application
- [~] 1.4.2 Create docker-compose.yml with app and PostgreSQL services
- [~] 1.4.3 Configure environment variables in docker-compose.yml
- [~] 1.4.4 Set up volume mounts for database persistence

### 1.5 Database Setup
- [~] 1.5.1 Create Prisma schema with Farmer, Catalog, and NetworkLog models
- [~] 1.5.2 Configure PostgreSQL connection in .env
- [~] 1.5.3 Generate Prisma client
- [~] 1.5.4 Create database seed script with sample data

## Phase 2: Core Data Layer

### 2.1 Beckn Protocol Schema Definition
- [~] 2.1.1 Create lib/beckn-schema.ts file
- [~] 2.1.2 Define BecknDescriptorSchema with Zod
- [~] 2.1.3 Define BecknPriceSchema with Zod
- [~] 2.1.4 Define BecknQuantitySchema with Zod
- [~] 2.1.5 Define BecknTagsSchema with Zod
- [~] 2.1.6 Define BecknCatalogItemSchema combining all schemas
- [~] 2.1.7 Export TypeScript types from Zod schemas

### 2.2 Prisma Models Implementation
- [x] 2.2.1 Implement Farmer model with all required fields
- [x] 2.2.2 Implement Catalog model with JSON field for Beckn data
- [x] 2.2.3 Implement NetworkLog model with type enum
- [x] 2.2.4 Define CatalogStatus enum (DRAFT, BROADCASTED, SOLD)
- [x] 2.2.5 Define NetworkLogType enum (OUTGOING_CATALOG, INCOMING_BID)
- [x] 2.2.6 Add indexes for performance optimization
- [x] 2.2.7 Configure cascade delete for farmer-catalog relationship

### 2.3 Database Utilities
- [x] 2.3.1 Create lib/db.ts with Prisma client singleton
- [x] 2.3.2 Implement connection error handling
- [x] 2.3.3 Add database health check utility function

## Phase 3: AI Translation Engine

### 3.1 Translation Agent Core
- [x] 3.1.1 Create lib/translation-agent.ts file
- [x] 3.1.2 Implement translateVoiceToJson function using Vercel AI SDK
- [x] 3.1.3 Configure generateObject with BecknCatalogItemSchema
- [x] 3.1.4 Build prompt template for voice-to-JSON conversion
- [x] 3.1.5 Implement commodity name mapping (Hindi/Hinglish to English)
- [x] 3.1.6 Implement location extraction logic
- [x] 3.1.7 Implement quality grade extraction logic

### 3.2 Fallback Mechanism
- [x] 3.2.1 Define FALLBACK_CATALOG constant with valid Beckn data
- [x] 3.2.2 Implement API key check before AI call
- [x] 3.2.3 Implement retry logic with exponential backoff (3 attempts)
- [x] 3.2.4 Implement fallback return on all failures
- [x] 3.2.5 Add comprehensive error logging

### 3.3 Validation Layer
- [x] 3.3.1 Implement validateCatalog function using Zod
- [x] 3.3.2 Add error handling for validation failures
- [x] 3.3.3 Implement default value application for optional fields
- [x] 3.3.4 Add validation result logging

## Phase 4: Server Actions

### 4.1 Translation Action
- [x] 4.1.1 Create app/actions.ts file with "use server" directive
- [x] 4.1.2 Implement translateVoiceAction function
- [x] 4.1.3 Add input validation for voice text
- [x] 4.1.4 Call translation agent and handle errors
- [x] 4.1.5 Return typed result object with success flag

### 4.2 Catalog Management Actions
- [x] 4.2.1 Implement saveCatalogAction to persist catalog to database
- [x] 4.2.2 Add farmer ID validation
- [x] 4.2.3 Implement error handling for database constraints
- [x] 4.2.4 Return catalog ID on success
- [x] 4.2.5 Implement getCatalogAction to fetch catalog by ID
- [x] 4.2.6 Implement getCatalogsByFarmerAction for farmer's catalog list

### 4.3 Broadcast Action
- [x] 4.3.1 Implement broadcastCatalogAction function
- [x] 4.3.2 Update catalog status to BROADCASTED
- [x] 4.3.3 Log OUTGOING_CATALOG event to NetworkLog
- [x] 4.3.4 Trigger network simulator
- [x] 4.3.5 Return broadcast result with bid data

### 4.4 Network Log Actions
- [x] 4.4.1 Implement getNetworkLogsAction with pagination
- [x] 4.4.2 Add filter parameter for log type
- [x] 4.4.3 Implement sorting by timestamp (descending)
- [x] 4.4.4 Calculate total pages for pagination
- [x] 4.4.5 Return logs array and pagination metadata

## Phase 5: Network Simulator

### 5.1 Simulator Core Logic
- [x] 5.1.1 Create lib/network-simulator.ts file
- [x] 5.1.2 Implement simulateBroadcast function
- [x] 5.1.3 Add 8-second delay using setTimeout
- [x] 5.1.4 Define buyer pool with names and logos
- [x] 5.1.5 Implement random buyer selection
- [x] 5.1.6 Implement bid amount calculation (catalog price ± 5-10%)

### 5.2 Logging and Persistence
- [x] 5.2.1 Fetch catalog details from database
- [x] 5.2.2 Create NetworkLog entry for INCOMING_BID
- [x] 5.2.3 Store bid payload with buyer name, amount, and timestamp
- [x] 5.2.4 Return BuyerBid object for UI notification

## Phase 6: Frontend Components

### 6.1 Voice Injector Component
- [x] 6.1.1 Create components/VoiceInjector.tsx
- [x] 6.1.2 Define VoiceScenario interface and sample scenarios
- [x] 6.1.3 Implement dropdown UI using Shadcn Select
- [x] 6.1.4 Add scenario icons using Lucide React
- [x] 6.1.5 Implement onScenarioSelect handler
- [x] 6.1.6 Add loading state during processing
- [x] 6.1.7 Style with Tailwind for large touch targets and high contrast
- [x] 6.1.8 Add Framer Motion animations for dropdown

### 6.2 Visual Verifier Component
- [x] 6.2.1 Create components/VisualVerifier.tsx
- [x] 6.2.2 Implement commodity icon mapping logic
- [x] 6.2.3 Create price badge with large font and currency symbol
- [x] 6.2.4 Create quantity indicator with visual representation
- [x] 6.2.5 Add logistics provider logo display
- [x] 6.2.6 Implement thumbprint broadcast button (120x120px)
- [x] 6.2.7 Add Framer Motion animations for card entrance
- [x] 6.2.8 Implement button hover and press animations
- [x] 6.2.9 Add broadcast success animation (confetti or checkmark)
- [x] 6.2.10 Style with high-contrast colors and minimal text

### 6.3 Network Log Viewer Component
- [x] 6.3.1 Create components/NetworkLogViewer.tsx
- [x] 6.3.2 Implement log list UI with chronological ordering
- [x] 6.3.3 Add color coding for event types (green/blue)
- [x] 6.3.4 Implement expandable log entries
- [x] 6.3.5 Add JSON syntax highlighting
- [x] 6.3.6 Implement filter dropdown for event types
- [x] 6.3.7 Add pagination controls
- [x] 6.3.8 Fetch logs using getNetworkLogsAction
- [x] 6.3.9 Handle loading and error states

### 6.4 Utility Components
- [x] 6.4.1 Create components/ui/LoadingSpinner.tsx
- [x] 6.4.2 Create components/ui/ErrorNotification.tsx
- [x] 6.4.3 Create components/ui/BroadcastLoader.tsx with animation
- [x] 6.4.4 Create components/ui/BuyerBidNotification.tsx

## Phase 7: Main Application Pages

### 7.1 Home Page
- [x] 7.1.1 Create app/page.tsx with App Router structure
- [x] 7.1.2 Implement main layout with header and content area
- [x] 7.1.3 Add VoiceInjector component
- [x] 7.1.4 Add VisualVerifier component with conditional rendering
- [x] 7.1.5 Implement translation flow on scenario selection
- [x] 7.1.6 Implement broadcast flow on button click
- [x] 7.1.7 Add toast notifications for success/error states
- [x] 7.1.8 Implement loading states for async operations

### 7.2 Debug/Admin Page
- [x] 7.2.1 Create app/debug/page.tsx
- [x] 7.2.2 Add NetworkLogViewer component
- [x] 7.2.3 Add catalog list view with status indicators
- [x] 7.2.4 Add farmer profile display
- [x] 7.2.5 Style as developer-focused debug interface

### 7.3 Layout and Styling
- [x] 7.3.1 Create app/layout.tsx with metadata and fonts
- [x] 7.3.2 Add Toaster component for notifications
- [x] 7.3.3 Configure global styles in app/globals.css
- [x] 7.3.4 Add responsive design breakpoints
- [x] 7.3.5 Implement dark mode support (optional)

## Phase 8: Assets and Static Resources

### 8.1 Commodity Icons
- [x] 8.1.1 Add onion.png icon (128x128px) to public/icons/
- [x] 8.1.2 Add mango.png icon (128x128px) to public/icons/
- [x] 8.1.3 Add tomato.png icon (128x128px) to public/icons/
- [x] 8.1.4 Add potato.png icon (128x128px) to public/icons/
- [x] 8.1.5 Add wheat.png icon (128x128px) to public/icons/
- [x] 8.1.6 Create icon mapping utility in lib/icon-mapper.ts

### 8.2 Logistics Logos
- [x] 8.2.1 Add india-post.png logo (64x64px) to public/logos/
- [x] 8.2.2 Add delhivery.png logo (64x64px) to public/logos/
- [x] 8.2.3 Add bluedart.png logo (64x64px) to public/logos/

### 8.3 Buyer Logos
- [x] 8.3.1 Add reliance.png logo (64x64px) to public/logos/
- [x] 8.3.2 Add bigbasket.png logo (64x64px) to public/logos/
- [x] 8.3.3 Add paytm.png logo (64x64px) to public/logos/
- [x] 8.3.4 Add flipkart.png logo (64x64px) to public/logos/

## Phase 9: Deployment Script

### 9.1 Script Structure
- [x] 9.1.1 Create install_setu.sh with bash shebang
- [x] 9.1.2 Add script header with description and usage
- [x] 9.1.3 Set script to exit on error (set -e)

### 9.2 Dependency Checks
- [x] 9.2.1 Check for Docker installation
- [x] 9.2.2 Check for Docker Compose installation
- [x] 9.2.3 Display installation instructions if missing
- [x] 9.2.4 Check Docker daemon is running

### 9.3 Port Management
- [x] 9.3.1 Check if port 3000 is in use
- [x] 9.3.2 Implement port 3000 cleanup logic (kill process or warn)
- [x] 9.3.3 Check if port 5432 is in use
- [x] 9.3.4 Implement port 5432 cleanup logic (kill process or warn)
- [x] 9.3.5 Add user confirmation prompts for port cleanup

### 9.4 Environment Setup
- [x] 9.4.1 Check for .env file existence
- [x] 9.4.2 Create .env with default values if missing
- [x] 9.4.3 Set DATABASE_URL with PostgreSQL connection string
- [x] 9.4.4 Set OPENAI_API_KEY placeholder
- [x] 9.4.5 Add other required environment variables

### 9.5 Docker Operations
- [x] 9.5.1 Execute docker compose down -v for clean slate
- [x] 9.5.2 Execute docker compose up -d --build
- [x] 9.5.3 Implement health check loop for PostgreSQL
- [x] 9.5.4 Wait for pg_isready before proceeding
- [x] 9.5.5 Add timeout for health check (max 60 seconds)

### 9.6 Database Initialization
- [x] 9.6.1 Execute npx prisma db push for schema sync
- [x] 9.6.2 Execute node prisma/seed.js for data seeding
- [x] 9.6.3 Handle errors in database initialization
- [x] 9.6.4 Verify seed data was inserted successfully

### 9.7 Success Output
- [x] 9.7.1 Create ASCII art banner "SETU LIVE"
- [x] 9.7.2 Display application URL in green color
- [x] 9.7.3 Display database connection info
- [x] 9.7.4 Display next steps for user
- [x] 9.7.5 Add script completion timestamp

### 9.8 Error Handling
- [x] 9.8.1 Implement error trapping for all critical steps
- [x] 9.8.2 Display clear error messages with context
- [x] 9.8.3 Provide troubleshooting suggestions
- [x] 9.8.4 Clean up partial deployments on failure

## Phase 10: Testing

### 10.1 Unit Tests Setup
- [x] 10.1.1 Install Vitest and React Testing Library
- [x] 10.1.2 Configure vitest.config.ts
- [x] 10.1.3 Set up test utilities and helpers

### 10.2 Translation Agent Tests
- [x] 10.2.1 Test fallback mechanism with missing API key
- [x] 10.2.2 Test specific Hinglish phrase translations
- [x] 10.2.3 Test commodity name mapping
- [x] 10.2.4 Test validation error handling
- [-] 10.2.5 Test retry logic with mock failures

### 10.3 Beckn Schema Tests
- [ ] 10.3.1 Test schema validation with valid data
- [ ] 10.3.2 Test schema validation with invalid data
- [ ] 10.3.3 Test edge cases (zero prices, empty strings)
- [ ] 10.3.4 Test default value application

### 10.4 Component Tests
- [ ] 10.4.1 Test VoiceInjector rendering and interactions
- [ ] 10.4.2 Test VisualVerifier rendering with various catalog data
- [ ] 10.4.3 Test NetworkLogViewer filtering and pagination
- [ ] 10.4.4 Test broadcast button interactions

### 10.5 Server Action Tests
- [ ] 10.5.1 Test translateVoiceAction with valid input
- [ ] 10.5.2 Test saveCatalogAction with valid data
- [ ] 10.5.3 Test broadcastCatalogAction flow
- [ ] 10.5.4 Test getNetworkLogsAction pagination

### 10.6 Property-Based Tests
- [x] 10.6.1 Install fast-check library
- [ ] 10.6.2 Create Beckn catalog arbitrary generator
- [ ] 10.6.3 Test round-trip serialization/deserialization
- [ ] 10.6.4 Test all translations produce valid Beckn JSON
- [ ] 10.6.5 Test all catalogs render without errors
- [ ] 10.6.6 Test bid amounts are within valid range

## Phase 11: Documentation

### 11.1 README
- [x] 11.1.1 Create comprehensive README.md
- [x] 11.1.2 Add project overview and objectives
- [x] 11.1.3 Add architecture diagram
- [x] 11.1.4 Add installation instructions
- [x] 11.1.5 Add usage guide with screenshots
- [x] 11.1.6 Add API documentation
- [x] 11.1.7 Add troubleshooting section

### 11.2 Code Documentation
- [x] 11.2.1 Add JSDoc comments to all public functions
- [x] 11.2.2 Add inline comments for complex logic
- [x] 11.2.3 Document environment variables
- [x] 11.2.4 Document database schema

### 11.3 Developer Guide
- [x] 11.3.1 Create CONTRIBUTING.md
- [x] 11.3.2 Document development workflow
- [x] 11.3.3 Document testing procedures
- [x] 11.3.4 Document deployment process

## Phase 12: Final Polish

### 12.1 Performance Optimization
- [x] 12.1.1 Implement image optimization for icons and logos
- [x] 12.1.2 Add loading skeletons for async content
- [x] 12.1.3 Implement code splitting for large components
- [x] 12.1.4 Optimize bundle size

### 12.2 Accessibility Enhancements
- [x] 12.2.1 Add ARIA labels to all interactive elements
- [x] 12.2.2 Verify keyboard navigation works
- [x] 12.2.3 Test with screen readers
- [x] 12.2.4 Verify color contrast ratios

### 12.3 Error Handling Polish
- [x] 12.3.1 Add user-friendly error messages throughout
- [x] 12.3.2 Implement error boundaries for React components
- [x] 12.3.3 Add retry mechanisms for failed operations
- [x] 12.3.4 Improve error logging and monitoring

### 12.4 Final Testing
- [x] 12.4.1 Run full test suite and verify all tests pass
- [x] 12.4.2 Test deployment script on clean machine
- [x] 12.4.3 Test complete user flow end-to-end
- [x] 12.4.4 Verify all requirements are met
- [x] 12.4.5 Test with different screen sizes and devices

### 12.5 Demo Preparation
- [x] 12.5.1 Prepare demo script with realistic scenarios
- [x] 12.5.2 Create demo video or GIF
- [x] 12.5.3 Prepare presentation slides
- [x] 12.5.4 Test demo flow multiple times
