# Database Schema Documentation

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│           Farmer                    │
├─────────────────────────────────────┤
│ id              String (PK)         │
│ name            String              │
│ locationLatLong String?             │
│ languagePref    String (default:hi) │
│ upiId           String?             │
│ createdAt       DateTime            │
│ updatedAt       DateTime            │
└─────────────────┬───────────────────┘
                  │
                  │ 1:N (Cascade Delete)
                  │
                  ▼
┌─────────────────────────────────────┐
│           Catalog                   │
├─────────────────────────────────────┤
│ id          String (PK)             │
│ farmerId    String (FK) [indexed]   │
│ becknJson   Json                    │
│ status      CatalogStatus [indexed] │
│ createdAt   DateTime                │
│ updatedAt   DateTime                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         NetworkLog                  │
├─────────────────────────────────────┤
│ id        String (PK)               │
│ type      NetworkLogType [indexed]  │
│ payload   Json                      │
│ timestamp DateTime [indexed]        │
└─────────────────────────────────────┘
```

## Enums

### CatalogStatus
```
DRAFT        - Initial state when catalog is created
BROADCASTED  - Catalog has been published to buyer network
SOLD         - Catalog item has been sold
```

### NetworkLogType
```
OUTGOING_CATALOG - Catalog broadcast event
INCOMING_BID     - Buyer bid received event
```

## Table Details

### Farmer Table
**Purpose:** Stores farmer profile information

| Column          | Type     | Constraints           | Description                          |
|-----------------|----------|-----------------------|--------------------------------------|
| id              | String   | PRIMARY KEY, CUID     | Unique identifier                    |
| name            | String   | NOT NULL              | Farmer's name                        |
| locationLatLong | String   | NULLABLE              | GPS coordinates (format: "lat,long") |
| languagePref    | String   | NOT NULL, DEFAULT 'hi'| ISO 639-1 language code              |
| upiId           | String   | NULLABLE              | UPI payment identifier               |
| createdAt       | DateTime | NOT NULL, DEFAULT NOW | Record creation timestamp            |
| updatedAt       | DateTime | NOT NULL, AUTO UPDATE | Record update timestamp              |

**Relationships:**
- One-to-Many with Catalog (one farmer can have multiple catalogs)

**Indexes:**
- Primary key on `id`

---

### Catalog Table
**Purpose:** Stores product catalog listings in Beckn Protocol format

| Column    | Type          | Constraints                    | Description                      |
|-----------|---------------|--------------------------------|----------------------------------|
| id        | String        | PRIMARY KEY, CUID              | Unique identifier                |
| farmerId  | String        | FOREIGN KEY, NOT NULL, INDEXED | Reference to Farmer.id           |
| becknJson | Json          | NOT NULL                       | Beckn Protocol catalog data      |
| status    | CatalogStatus | NOT NULL, DEFAULT DRAFT, INDEX | Current catalog state            |
| createdAt | DateTime      | NOT NULL, DEFAULT NOW          | Record creation timestamp        |
| updatedAt | DateTime      | NOT NULL, AUTO UPDATE          | Record update timestamp          |

**Relationships:**
- Many-to-One with Farmer (foreign key with CASCADE DELETE)

**Indexes:**
- Primary key on `id`
- Index on `farmerId` (for efficient farmer-based queries)
- Index on `status` (for filtering by catalog state)

**Cascade Behavior:**
- When a Farmer is deleted, all associated Catalogs are automatically deleted

---

### NetworkLog Table
**Purpose:** Stores network event logs for debugging and transparency

| Column    | Type           | Constraints                | Description                    |
|-----------|----------------|----------------------------|--------------------------------|
| id        | String         | PRIMARY KEY, CUID          | Unique identifier              |
| type      | NetworkLogType | NOT NULL, INDEXED          | Event type                     |
| payload   | Json           | NOT NULL                   | Event data                     |
| timestamp | DateTime       | NOT NULL, DEFAULT NOW, IDX | Event timestamp                |

**Relationships:**
- None (independent logging table)

**Indexes:**
- Primary key on `id`
- Index on `type` (for filtering by event type)
- Index on `timestamp` (for chronological queries)

---

## JSON Field Schemas

### Catalog.becknJson
Stores BecknCatalogItem conforming to Beckn Protocol:

```typescript
{
  descriptor: {
    name: string;      // Product name (e.g., "Nasik Onions")
    symbol: string;    // URL to product image
  };
  price: {
    value: number;     // Price amount
    currency: string;  // Currency code (default: "INR")
  };
  quantity: {
    available: {
      count: number;   // Available quantity
    };
    unit: string;      // Unit of measurement (e.g., "kg")
  };
  tags: {
    grade?: string;              // Quality grade (e.g., "A")
    perishability?: string;      // "low" | "medium" | "high"
    logistics_provider?: string; // Provider name
  };
}
```

### NetworkLog.payload
Varies by event type:

**OUTGOING_CATALOG:**
```typescript
{
  catalogId: string;
  becknJson: BecknCatalogItem;
  timestamp: string;
}
```

**INCOMING_BID:**
```typescript
{
  buyerName: string;
  bidAmount: number;
  catalogId: string;
  timestamp: string;
}
```

---

## Performance Considerations

### Indexing Strategy
1. **farmerId index on Catalog:** Optimizes queries like "get all catalogs for a farmer"
2. **status index on Catalog:** Optimizes queries like "get all BROADCASTED catalogs"
3. **type index on NetworkLog:** Optimizes filtering by event type
4. **timestamp index on NetworkLog:** Optimizes chronological queries and pagination

### Query Patterns
- **Most common:** Fetch catalogs by farmer ID (indexed)
- **Dashboard:** Fetch recent network logs (indexed by timestamp)
- **Filtering:** Filter catalogs by status (indexed)
- **Debugging:** Filter logs by type (indexed)

---

## Data Integrity

### Referential Integrity
- **Farmer → Catalog:** Foreign key constraint with CASCADE DELETE
  - Ensures no orphaned catalogs when a farmer is deleted
  - Maintains data consistency

### Constraints
- All primary keys use CUID (Collision-resistant Unique Identifier)
- Timestamps are automatically managed by Prisma
- Enums ensure valid status and type values

---

## Migration Strategy

### Initial Setup
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Run seed script
npm run prisma:seed
```

### Production Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

---

## Sample Data

### Sample Farmer
```json
{
  "id": "clx1234567890",
  "name": "Ramesh Kumar",
  "locationLatLong": "19.9975,73.7898",
  "languagePref": "hi",
  "upiId": "ramesh@paytm",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Sample Catalog
```json
{
  "id": "clx9876543210",
  "farmerId": "clx1234567890",
  "status": "BROADCASTED",
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
      "available": { "count": 500 },
      "unit": "kg"
    },
    "tags": {
      "grade": "A",
      "perishability": "medium",
      "logistics_provider": "India Post"
    }
  },
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:05:00Z"
}
```

### Sample NetworkLog
```json
{
  "id": "clx5555555555",
  "type": "INCOMING_BID",
  "payload": {
    "buyerName": "Reliance Fresh",
    "bidAmount": 38.5,
    "catalogId": "clx9876543210",
    "timestamp": "2024-01-15T11:10:00Z"
  },
  "timestamp": "2024-01-15T11:10:00Z"
}
```

---

## Database Configuration

### Connection String Format
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Environment Variables
```env
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db
```

### Prisma Configuration (prisma.config.ts)
```typescript
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
});
```

---

## Monitoring and Maintenance

### Health Checks
Use the `checkDatabaseHealth()` utility function:
```typescript
import { checkDatabaseHealth } from '@/lib/db';

const isHealthy = await checkDatabaseHealth();
if (!isHealthy) {
  console.error('Database is not responding');
}
```

### Connection Management
```typescript
import { connectDatabase, disconnectDatabase } from '@/lib/db';

// Explicit connection
await connectDatabase();

// Graceful shutdown
await disconnectDatabase();
```

### Error Handling
```typescript
import { handleDatabaseError } from '@/lib/db';

try {
  await prisma.catalog.create({ data: catalogData });
} catch (error) {
  const message = handleDatabaseError(error);
  console.error(message);
}
```

---

## Security Considerations

1. **Connection String:** Store in environment variables, never commit to version control
2. **SQL Injection:** Prisma uses parameterized queries, preventing SQL injection
3. **Access Control:** Implement application-level authorization
4. **Data Validation:** Validate all inputs before database operations
5. **Audit Trail:** NetworkLog table provides audit trail for all network events

---

## Backup and Recovery

### Backup Strategy
```bash
# PostgreSQL backup
pg_dump -U setu -d setu_db > backup.sql

# Restore
psql -U setu -d setu_db < backup.sql
```

### Data Retention
- **Farmer:** Retain indefinitely
- **Catalog:** Retain for 1 year after SOLD status
- **NetworkLog:** Retain for 90 days (configurable)

---

## Future Enhancements

1. **Soft Deletes:** Add `deletedAt` field for soft delete functionality
2. **Audit Fields:** Add `createdBy` and `updatedBy` for user tracking
3. **Versioning:** Add version field to Catalog for change tracking
4. **Partitioning:** Partition NetworkLog by timestamp for better performance
5. **Read Replicas:** Configure read replicas for scaling read operations
