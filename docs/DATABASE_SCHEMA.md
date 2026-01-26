# Database Schema Documentation

This document provides comprehensive documentation for the Setu Voice-to-ONDC Gateway database schema.

## Overview

The database uses **PostgreSQL 16** with **Prisma ORM** for type-safe database access. The schema consists of three main models:

1. **Farmer** - Represents farmer users who create product listings
2. **Catalog** - Stores Beckn Protocol-compliant product catalogs
3. **NetworkLog** - Logs all network interactions for debugging and transparency

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│            Farmer                   │
│─────────────────────────────────────│
│ id: String (PK)                     │
│ name: String                        │
│ locationLatLong: String?            │
│ languagePref: String                │
│ upiId: String?                      │
│ createdAt: DateTime                 │
│ updatedAt: DateTime                 │
└─────────────────────────────────────┘
              │
              │ 1:N
              │
              ▼
┌─────────────────────────────────────┐
│            Catalog                  │
│─────────────────────────────────────│
│ id: String (PK)                     │
│ farmerId: String (FK)               │
│ becknJson: Json                     │
│ status: CatalogStatus               │
│ createdAt: DateTime                 │
│ updatedAt: DateTime                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          NetworkLog                 │
│─────────────────────────────────────│
│ id: String (PK)                     │
│ type: NetworkLogType                │
│ payload: Json                       │
│ timestamp: DateTime                 │
└─────────────────────────────────────┘
```

## Models

### Farmer Model

Represents a farmer user in the system.

#### Schema Definition

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
  
  @@map("farmers")
}
```

#### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | Yes | `cuid()` | Unique identifier (CUID format) |
| `name` | String | Yes | - | Farmer's full name |
| `locationLatLong` | String | No | `null` | GPS coordinates in "lat,long" format |
| `languagePref` | String | Yes | `"hi"` | Preferred language (ISO 639-1 code) |
| `upiId` | String | No | `null` | UPI ID for payments (e.g., "farmer@upi") |
| `createdAt` | DateTime | Yes | `now()` | Record creation timestamp |
| `updatedAt` | DateTime | Yes | Auto | Last update timestamp |

#### Relationships

- **One-to-Many** with `Catalog`: A farmer can have multiple catalogs
- **Cascade Delete**: Deleting a farmer deletes all their catalogs

#### Indexes

- Primary key on `id`

#### Example Data

```json
{
  "id": "clx123abc456",
  "name": "Ramesh Kumar",
  "locationLatLong": "19.9975,73.7898",
  "languagePref": "hi",
  "upiId": "ramesh.kumar@paytm",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Supported Language Codes

| Code | Language |
|------|----------|
| `hi` | Hindi |
| `en` | English |
| `mr` | Marathi |
| `gu` | Gujarati |
| `pa` | Punjabi |
| `ta` | Tamil |
| `te` | Telugu |
| `kn` | Kannada |

---

### Catalog Model

Stores Beckn Protocol-compliant product catalogs created by farmers.

#### Schema Definition

```prisma
model Catalog {
  id          String        @id @default(cuid())
  farmerId    String
  becknJson   Json
  status      CatalogStatus @default(DRAFT)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  farmer      Farmer        @relation(fields: [farmerId], references: [id], onDelete: Cascade)
  
  @@index([farmerId])
  @@index([status])
  @@map("catalogs")
}
```

#### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | Yes | `cuid()` | Unique identifier (CUID format) |
| `farmerId` | String | Yes | - | Foreign key to Farmer model |
| `becknJson` | Json | Yes | - | Beckn Protocol catalog item (JSON) |
| `status` | CatalogStatus | Yes | `DRAFT` | Current catalog status |
| `createdAt` | DateTime | Yes | `now()` | Record creation timestamp |
| `updatedAt` | DateTime | Yes | Auto | Last update timestamp |

#### Status Enum (CatalogStatus)

```prisma
enum CatalogStatus {
  DRAFT        // Catalog created but not broadcasted
  BROADCASTED  // Catalog broadcasted to network
  SOLD         // Product sold (future use)
}
```

| Status | Description | Transitions |
|--------|-------------|-------------|
| `DRAFT` | Initial state after catalog creation | → `BROADCASTED` |
| `BROADCASTED` | Catalog published to ONDC network | → `SOLD` |
| `SOLD` | Product has been sold | Terminal state |

#### Beckn JSON Structure

The `becknJson` field stores a complete Beckn Protocol catalog item:

```typescript
interface BecknCatalogItem {
  descriptor: {
    name: string;        // Product name
    symbol: string;      // Icon URL
  };
  price: {
    value: number;       // Price amount
    currency: string;    // Currency code (INR)
  };
  quantity: {
    available: {
      count: number;     // Available quantity
    };
    unit: string;        // Unit (kg, crate, etc.)
  };
  tags: {
    grade?: string;              // Quality grade
    perishability?: string;      // Perishability level
    logistics_provider?: string; // Logistics provider
  };
}
```

#### Relationships

- **Many-to-One** with `Farmer`: Each catalog belongs to one farmer
- **Cascade Delete**: Deleting the farmer deletes all their catalogs

#### Indexes

- Primary key on `id`
- Index on `farmerId` for efficient farmer catalog queries
- Index on `status` for filtering by status

#### Example Data

```json
{
  "id": "clx789def012",
  "farmerId": "clx123abc456",
  "becknJson": {
    "descriptor": {
      "name": "Nasik Onions",
      "symbol": "/icons/onion.png"
    },
    "price": {
      "value": 40,
      "currency": "INR"
    },
    "quantity": {
      "available": {
        "count": 500
      },
      "unit": "kg"
    },
    "tags": {
      "grade": "A",
      "perishability": "medium",
      "logistics_provider": "India Post"
    }
  },
  "status": "BROADCASTED",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:05:00Z"
}
```

---

### NetworkLog Model

Logs all network interactions for debugging, transparency, and audit trails.

#### Schema Definition

```prisma
model NetworkLog {
  id        String         @id @default(cuid())
  type      NetworkLogType
  payload   Json
  timestamp DateTime       @default(now())
  
  @@index([type])
  @@index([timestamp])
  @@map("network_logs")
}
```

#### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | Yes | `cuid()` | Unique identifier (CUID format) |
| `type` | NetworkLogType | Yes | - | Type of network event |
| `payload` | Json | Yes | - | Event-specific data (JSON) |
| `timestamp` | DateTime | Yes | `now()` | Event timestamp |

#### Type Enum (NetworkLogType)

```prisma
enum NetworkLogType {
  OUTGOING_CATALOG  // Catalog broadcasted to network
  INCOMING_BID      // Buyer bid received
}
```

| Type | Description | Payload Structure |
|------|-------------|-------------------|
| `OUTGOING_CATALOG` | Catalog broadcast event | `{ catalogId, farmerId, becknJson, timestamp }` |
| `INCOMING_BID` | Buyer bid received | `{ buyerName, bidAmount, catalogId, timestamp }` |

#### Payload Structures

**OUTGOING_CATALOG Payload:**
```json
{
  "catalogId": "clx789def012",
  "farmerId": "clx123abc456",
  "becknJson": { /* Full Beckn catalog */ },
  "timestamp": "2024-01-15T11:05:00Z"
}
```

**INCOMING_BID Payload:**
```json
{
  "buyerName": "BigBasket",
  "bidAmount": 38.50,
  "catalogId": "clx789def012",
  "timestamp": "2024-01-15T11:05:08Z"
}
```

#### Indexes

- Primary key on `id`
- Index on `type` for filtering by event type
- Index on `timestamp` for chronological queries

#### Example Data

```json
{
  "id": "clx345ghi678",
  "type": "INCOMING_BID",
  "payload": {
    "buyerName": "Reliance Fresh",
    "bidAmount": 39.20,
    "catalogId": "clx789def012",
    "timestamp": "2024-01-15T11:05:08Z"
  },
  "timestamp": "2024-01-15T11:05:08Z"
}
```

---

## Database Operations

### Common Queries

#### Create a Farmer

```typescript
const farmer = await prisma.farmer.create({
  data: {
    name: "Ramesh Kumar",
    locationLatLong: "19.9975,73.7898",
    languagePref: "hi",
    upiId: "ramesh.kumar@paytm"
  }
});
```

#### Create a Catalog

```typescript
const catalog = await prisma.catalog.create({
  data: {
    farmerId: "clx123abc456",
    becknJson: {
      descriptor: { name: "Nasik Onions", symbol: "/icons/onion.png" },
      price: { value: 40, currency: "INR" },
      quantity: { available: { count: 500 }, unit: "kg" },
      tags: { grade: "A", perishability: "medium", logistics_provider: "India Post" }
    },
    status: "DRAFT"
  }
});
```

#### Update Catalog Status

```typescript
const updated = await prisma.catalog.update({
  where: { id: "clx789def012" },
  data: { status: "BROADCASTED" }
});
```

#### Get Farmer with Catalogs

```typescript
const farmer = await prisma.farmer.findUnique({
  where: { id: "clx123abc456" },
  include: { catalogs: true }
});
```

#### Get Network Logs with Filtering

```typescript
const logs = await prisma.networkLog.findMany({
  where: { type: "INCOMING_BID" },
  orderBy: { timestamp: "desc" },
  take: 10
});
```

#### Get Catalogs by Status

```typescript
const broadcasted = await prisma.catalog.findMany({
  where: { status: "BROADCASTED" },
  include: { farmer: true }
});
```

---

## Migrations

### Initial Migration

The initial migration creates all tables, enums, and indexes:

```bash
npx prisma migrate dev --name init
```

### Applying Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### Schema Push (Development)

For rapid prototyping without migration files:

```bash
npx prisma db push
```

---

## Seeding

### Seed Script

The seed script (`prisma/seed.js`) populates the database with sample data:

```javascript
// Create sample farmer
const farmer = await prisma.farmer.create({
  data: {
    name: "Ramesh Kumar",
    locationLatLong: "19.9975,73.7898",
    languagePref: "hi",
    upiId: "ramesh.kumar@paytm"
  }
});

// Create sample catalogs
await prisma.catalog.createMany({
  data: [
    {
      farmerId: farmer.id,
      becknJson: { /* Onion catalog */ },
      status: "DRAFT"
    },
    {
      farmerId: farmer.id,
      becknJson: { /* Mango catalog */ },
      status: "BROADCASTED"
    }
  ]
});
```

### Running Seed

```bash
# Using npm script
npm run seed

# Direct execution
node prisma/seed.js
```

---

## Performance Considerations

### Indexes

The schema includes strategic indexes for optimal query performance:

1. **Catalog.farmerId** - Fast farmer catalog lookups
2. **Catalog.status** - Efficient status filtering
3. **NetworkLog.type** - Quick event type filtering
4. **NetworkLog.timestamp** - Chronological queries

### Query Optimization

**Good:**
```typescript
// Uses farmerId index
const catalogs = await prisma.catalog.findMany({
  where: { farmerId: "clx123abc456" }
});
```

**Bad:**
```typescript
// Full table scan on JSON field
const catalogs = await prisma.catalog.findMany({
  where: {
    becknJson: { path: ["price", "value"], gt: 50 }
  }
});
```

### JSON Field Considerations

- **Pros**: Flexible schema, stores complex Beckn Protocol data
- **Cons**: Cannot index JSON fields, slower queries on JSON content
- **Best Practice**: Store frequently queried fields as separate columns

---

## Backup and Restore

### Backup Database

```bash
# Using Docker
docker compose exec db pg_dump -U setu setu_db > backup.sql

# Using pg_dump directly
pg_dump -h localhost -U setu -d setu_db > backup.sql
```

### Restore Database

```bash
# Using Docker
docker compose exec -T db psql -U setu -d setu_db < backup.sql

# Using psql directly
psql -h localhost -U setu -d setu_db < backup.sql
```

---

## Security

### Connection Security

- Use SSL/TLS for production database connections
- Restrict database port (5432) access via firewall
- Use strong passwords (minimum 16 characters)

### Data Protection

- Encrypt sensitive fields (e.g., `upiId`) at application level
- Implement row-level security for multi-tenant scenarios
- Regular backups with encryption

### Access Control

- Use separate database users for different environments
- Grant minimum required privileges
- Audit database access logs

---

## Troubleshooting

### Common Issues

#### Connection Refused

**Problem**: Cannot connect to database

**Solutions**:
1. Check if PostgreSQL container is running: `docker compose ps`
2. Verify DATABASE_URL in `.env`
3. Check network connectivity: `docker compose exec app ping db`

#### Migration Conflicts

**Problem**: Migration fails due to conflicts

**Solutions**:
1. Reset database: `npx prisma migrate reset`
2. Push schema without migrations: `npx prisma db push`
3. Manually resolve conflicts in migration files

#### Seed Failures

**Problem**: Seed script fails

**Solutions**:
1. Check if database is empty: `npx prisma db seed`
2. Verify Prisma client is generated: `npx prisma generate`
3. Check seed script syntax and data validity

---

## References

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/)
- [Beckn Protocol Specification](https://developers.becknprotocol.io/)
- [ONDC Documentation](https://ondc.org/)
