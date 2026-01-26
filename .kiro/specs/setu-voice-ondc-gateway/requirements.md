# Requirements Document: Setu - Voice-to-ONDC Gateway

## Introduction

Setu is a voice-to-protocol translation system that enables illiterate farmers to participate in the Open Network for Digital Commerce (ONDC) by converting vernacular voice commands into valid Beckn Protocol catalogs. The system acts as a seller node that translates voice input into structured catalog data and simulates buyer network interactions.

## Glossary

- **System**: The Setu Voice-to-ONDC Gateway application
- **Beckn_Protocol**: The open protocol specification used by ONDC for catalog and transaction data
- **Catalog_Item**: A structured JSON object representing a product listing in Beckn Protocol format
- **Voice_Injector**: The development mode component that simulates voice input through pre-set scenarios
- **Translation_Agent**: The AI-powered component that converts text to Beckn Protocol JSON
- **Visual_Verifier**: The accessibility-focused UI component that displays catalog data as visual cards
- **Network_Simulator**: The component that simulates buyer network interactions and responses
- **Deployment_Script**: The automated installation script (install_setu.sh) that sets up the entire system
- **Farmer**: The end user who creates product listings through voice input
- **Buyer_Network**: The simulated network of potential buyers (e.g., Paytm, BigBasket, Reliance Fresh)
- **Broadcast**: The action of publishing a catalog item to the buyer network
- **Beckn_Catalog**: A complete product catalog conforming to Beckn Protocol specifications

## Requirements

### Requirement 1: Voice Input Simulation

**User Story:** As a developer, I want to simulate voice input through pre-set scenarios, so that I can test the system without implementing actual voice recognition.

#### Acceptance Criteria

1. WHEN the Voice_Injector component loads, THE System SHALL display a dropdown interface with selectable voice scenarios
2. THE System SHALL provide at least two pre-configured scenarios with realistic farmer voice commands
3. WHEN a user selects Scenario 1, THE System SHALL inject the text "Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai"
4. WHEN a user selects Scenario 2, THE System SHALL inject the text "20 crate Alphonso aam hai, Ratnagiri ka, organic certified hai"
5. WHEN a scenario is selected, THE System SHALL trigger the translation process immediately

### Requirement 2: Beckn Protocol Translation

**User Story:** As a farmer, I want my voice commands automatically converted to valid Beckn Protocol JSON, so that I can list products on ONDC without technical knowledge.

#### Acceptance Criteria

1. WHEN voice text is received, THE Translation_Agent SHALL parse the input and extract product attributes
2. THE Translation_Agent SHALL generate a Catalog_Item with descriptor, price, quantity, and tags fields
3. THE System SHALL validate all generated JSON against Beckn Protocol Zod schemas
4. WHEN validation fails, THE System SHALL log the error and retry translation with corrected parameters
5. THE Translation_Agent SHALL use Vercel AI SDK with streamObject or generateObject for strictly typed output
6. THE System SHALL map commodity names to standardized Beckn Protocol product categories
7. WHEN location information is provided, THE System SHALL include it in the catalog metadata
8. WHEN quality grades are mentioned, THE System SHALL encode them in the tags field

### Requirement 3: Catalog Data Structure

**User Story:** As a system integrator, I want all catalogs to conform to Beckn Protocol specifications, so that they can be consumed by any ONDC-compliant buyer application.

#### Acceptance Criteria

1. THE System SHALL include a descriptor object with name and symbol fields in every Catalog_Item
2. THE System SHALL include a price object with value and currency fields in every Catalog_Item
3. THE System SHALL include a quantity object with available count and unit fields in every Catalog_Item
4. THE System SHALL include a tags array with grade, perishability, and logistics_provider in every Catalog_Item
5. THE System SHALL use INR as the default currency for all price values
6. THE System SHALL validate that all required Beckn Protocol fields are present before saving
7. WHEN optional fields are not provided in voice input, THE System SHALL use sensible defaults

### Requirement 4: Visual Verification Interface

**User Story:** As an illiterate farmer, I want to verify my product listing through visual icons and images, so that I can confirm accuracy without reading text.

#### Acceptance Criteria

1. WHEN a Catalog_Item is generated, THE Visual_Verifier SHALL display it as a visual card
2. THE Visual_Verifier SHALL display a large commodity icon representing the product type
3. THE Visual_Verifier SHALL display the price as a prominent badge with currency symbol
4. THE Visual_Verifier SHALL display the logistics provider logo as a recognizable image
5. THE Visual_Verifier SHALL use high-contrast colors for all visual elements
6. THE Visual_Verifier SHALL minimize text content to essential information only
7. WHEN displaying quantity, THE Visual_Verifier SHALL use visual indicators (e.g., bag icons for weight)
8. THE Visual_Verifier SHALL render all icons at minimum 64x64 pixels for visibility

### Requirement 5: Broadcast Confirmation

**User Story:** As a farmer, I want to confirm and broadcast my listing with a simple action, so that I can publish without complex interactions.

#### Acceptance Criteria

1. THE Visual_Verifier SHALL display a large "Thumbprint" style button for broadcast confirmation
2. THE System SHALL make the broadcast button at least 120x120 pixels in size
3. WHEN the broadcast button is pressed, THE System SHALL save the catalog with status BROADCASTED
4. WHEN the broadcast button is pressed, THE System SHALL trigger the Network_Simulator
5. THE System SHALL provide haptic or visual feedback when the broadcast button is activated
6. WHEN broadcast is successful, THE System SHALL display a confirmation animation
7. IF broadcast fails, THEN THE System SHALL display a high-contrast error indicator

### Requirement 6: Network Simulation

**User Story:** As a farmer, I want to see simulated buyer responses, so that I can understand how the ONDC network would respond to my listing.

#### Acceptance Criteria

1. WHEN a catalog is broadcasted, THE Network_Simulator SHALL wait 8 seconds before generating a response
2. WHILE waiting for response, THE System SHALL display an animated loader
3. THE Network_Simulator SHALL generate a mock buyer bid from a realistic buyer name
4. THE System SHALL display the buyer bid as a high-contrast notification or toast
5. THE System SHALL include buyer name, bid amount, and timestamp in the notification
6. THE System SHALL log all network interactions to the NetworkLog table
7. WHEN multiple catalogs are broadcasted, THE Network_Simulator SHALL handle them independently

### Requirement 7: Database Persistence

**User Story:** As a system administrator, I want all farmer data and catalogs persisted reliably, so that the system maintains state across sessions.

#### Acceptance Criteria

1. THE System SHALL store farmer profiles in the Farmer table with id, name, location, language preference, and UPI ID
2. THE System SHALL store catalogs in the Catalog table with id, farmerId, beckn_json, and status fields
3. THE System SHALL store network events in the NetworkLog table with id, type, payload, and timestamp
4. WHEN a catalog is created, THE System SHALL set its status to DRAFT
5. WHEN a catalog is broadcasted, THE System SHALL update its status to BROADCASTED
6. THE System SHALL use PostgreSQL 16 as the database engine
7. THE System SHALL use Prisma ORM for all database operations
8. THE System SHALL enforce referential integrity between Farmer and Catalog tables

### Requirement 8: Type Safety and Validation

**User Story:** As a developer, I want strict TypeScript typing throughout the codebase, so that I can catch errors at compile time.

#### Acceptance Criteria

1. THE System SHALL use Zod schemas for all Beckn Protocol data structures
2. THE System SHALL validate all incoming data against Zod schemas before processing
3. THE System SHALL use TypeScript strict mode in all configuration files
4. THE System SHALL define Prisma models with explicit type annotations
5. THE System SHALL use typed Server Actions for all client-server communication
6. WHEN validation fails, THE System SHALL return typed error objects with descriptive messages
7. THE System SHALL generate TypeScript types from Prisma schema automatically

### Requirement 9: One-Click Deployment

**User Story:** As a system administrator, I want to deploy the entire system with a single command, so that I can set up Setu on any machine quickly.

#### Acceptance Criteria

1. THE Deployment_Script SHALL check for Docker and Docker Compose dependencies before proceeding
2. WHEN port 3000 is occupied, THE Deployment_Script SHALL either kill the process or warn the user
3. WHEN port 5432 is occupied, THE Deployment_Script SHALL either kill the process or warn the user
4. WHEN .env file is missing, THE Deployment_Script SHALL create it with working default values
5. THE Deployment_Script SHALL execute docker compose down -v to clean previous state
6. THE Deployment_Script SHALL execute docker compose up -d --build to start services
7. THE Deployment_Script SHALL wait for database health check before proceeding
8. THE Deployment_Script SHALL execute prisma db push to create database schema
9. THE Deployment_Script SHALL execute seed script to populate initial data
10. WHEN deployment succeeds, THE Deployment_Script SHALL display an ASCII art success banner with application URL
11. THE Deployment_Script SHALL be idempotent and safe to run multiple times
12. IF any step fails, THEN THE Deployment_Script SHALL display a clear error message and exit

### Requirement 10: User Interface Accessibility

**User Story:** As an illiterate farmer, I want an interface that requires zero reading ability, so that I can use the system independently.

#### Acceptance Criteria

1. THE System SHALL use icons and images as primary navigation elements
2. THE System SHALL use color coding to indicate status (green for success, red for error)
3. THE System SHALL provide visual feedback for all user interactions
4. THE System SHALL use animations to guide user attention and build trust
5. THE System SHALL maintain minimum touch target size of 44x44 pixels for all interactive elements
6. THE System SHALL use high contrast ratios (minimum 4.5:1) for all visual elements
7. WHEN displaying numbers, THE System SHALL use large, clear fonts (minimum 24px)
8. THE System SHALL avoid text-heavy interfaces and use visual metaphors instead

### Requirement 11: Network Log Viewer

**User Story:** As a developer, I want to view raw JSON traffic for debugging, so that I can troubleshoot protocol issues.

#### Acceptance Criteria

1. THE System SHALL provide a NetworkLogViewer component for displaying network events
2. THE NetworkLogViewer SHALL display events in chronological order with timestamps
3. THE NetworkLogViewer SHALL show event type (OUTGOING_CATALOG or INCOMING_BID)
4. THE NetworkLogViewer SHALL display formatted JSON payloads with syntax highlighting
5. THE NetworkLogViewer SHALL allow filtering by event type
6. THE NetworkLogViewer SHALL support pagination for large log sets
7. WHEN a log entry is clicked, THE System SHALL expand it to show full payload details

### Requirement 12: Application Architecture

**User Story:** As a developer, I want a well-structured codebase following Next.js 15 best practices, so that the application is maintainable and scalable.

#### Acceptance Criteria

1. THE System SHALL use Next.js 15 App Router for all routing
2. THE System SHALL use Server Actions for server-side data mutations
3. THE System SHALL organize UI components in a components directory with subdirectories for ui and feature components
4. THE System SHALL place utility functions in a lib directory
5. THE System SHALL use Tailwind CSS 4.0 for styling
6. THE System SHALL use Shadcn/UI for base UI components
7. THE System SHALL use Framer Motion for animations
8. THE System SHALL containerize the application using Docker
9. THE System SHALL use Docker Compose to orchestrate application and database containers

### Requirement 13: AI Integration

**User Story:** As a system architect, I want reliable AI-powered translation using industry-standard tools, so that the system produces consistent results.

#### Acceptance Criteria

1. THE System SHALL use Vercel AI SDK Core for all AI operations
2. THE Translation_Agent SHALL use streamObject or generateObject functions for structured output
3. THE System SHALL define Zod schemas for all AI-generated data structures
4. THE System SHALL handle AI API errors gracefully with retry logic
5. THE System SHALL log all AI requests and responses for debugging
6. IF the AI API key is missing or all retries fail, THEN THE System SHALL return a hardcoded valid Beckn Protocol JSON response
7. THE System SHALL configure appropriate timeout values for AI operations
8. THE hardcoded fallback response SHALL represent a successful catalog creation to ensure live demos cannot fail

### Requirement 14: Performance and Responsiveness

**User Story:** As a farmer with limited connectivity, I want the application to respond quickly, so that I can complete tasks efficiently.

#### Acceptance Criteria

1. WHEN a user interacts with the interface, THE System SHALL provide visual feedback within 100ms
2. THE System SHALL complete voice-to-JSON translation within 5 seconds
3. THE System SHALL load the Visual_Verifier within 1 second of translation completion
4. THE System SHALL use optimistic UI updates for better perceived performance
5. THE System SHALL implement loading states for all asynchronous operations
6. THE System SHALL cache commodity icons and logos for faster rendering
7. WHEN network is slow, THE System SHALL display progress indicators

### Requirement 15: Data Seeding and Initial Setup

**User Story:** As a developer, I want the database pre-populated with sample data, so that I can test the system immediately after deployment.

#### Acceptance Criteria

1. THE System SHALL include a seed script that runs during deployment
2. THE seed script SHALL create at least one sample Farmer record
3. THE seed script SHALL create at least two sample Catalog records in different states
4. THE seed script SHALL create sample NetworkLog entries demonstrating the flow
5. THE seed script SHALL be idempotent and safe to run multiple times
6. THE seed script SHALL use realistic Indian farmer names and locations
7. THE seed script SHALL include sample data for common agricultural products

