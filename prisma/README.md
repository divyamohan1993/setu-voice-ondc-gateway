# Prisma Database Setup

This directory contains the Prisma schema, configuration, and seed data for the Setu Voice-to-ONDC Gateway application.

## Files

- **schema.prisma**: Defines the database schema with Farmer, Catalog, and NetworkLog models
- **seed.js**: Populates the database with sample data for testing and development
- **migrations/**: Contains database migration files (created when running migrations)

## Database Models

### Farmer
Stores farmer profile information including name, location, language preference, and UPI ID.

### Catalog
Stores product catalogs in Beckn Protocol format with status tracking (DRAFT, BROADCASTED, SOLD).

### NetworkLog
Logs all network interactions including outgoing catalogs and incoming bids.

## Setup Instructions

### 1. Install Dependencies

Make sure you have installed all dependencies:

```bash
npm install
```

### 2. Configure Environment Variables

Ensure your `.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db
```

### 3. Generate Prisma Client

Generate the Prisma Client to use in your application:

```bash
npm run prisma:generate
```

Or directly:

```bash
node node_modules/prisma/build/index.js generate
```

### 4. Push Schema to Database

Push the schema to your database (creates tables without migrations):

```bash
npm run prisma:push
```

Or directly:

```bash
node node_modules/prisma/build/index.js db push
```

### 5. Seed the Database

Populate the database with sample data:

```bash
npm run prisma:seed
```

Or directly:

```bash
node prisma/seed.js
```

## Sample Data

The seed script creates:

- **2 Farmers**: राजेश पाटिल (Mumbai) and सुनीता देशमुख (Pune)
- **2 Catalogs**: 
  - Nasik Onions (500 kg, Grade A, BROADCASTED)
  - Alphonso Mangoes (20 crates, Premium, DRAFT)
- **3 Network Logs**: 
  - 1 outgoing catalog
  - 2 incoming bids (from Reliance Fresh and BigBasket)

## Prisma Studio

To view and edit your database data visually:

```bash
node node_modules/prisma/build/index.js studio
```

This will open Prisma Studio in your browser at http://localhost:5555

## Common Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema changes to database
npm run prisma:push

# Seed the database
npm run prisma:seed

# Open Prisma Studio
node node_modules/prisma/build/index.js studio

# Reset database (WARNING: deletes all data)
node node_modules/prisma/build/index.js db push --force-reset
```

## Prisma 7 Configuration

This project uses Prisma 7, which requires a `prisma.config.ts` file at the root of the project. The configuration includes:

- Schema location
- Database connection URL
- Migrations path
- Seed script configuration

See `../prisma.config.ts` for the complete configuration.

## Troubleshooting

### PowerShell Execution Policy Error

If you encounter PowerShell execution policy errors when running npm/npx commands, use the direct node commands instead:

```bash
# Instead of: npx prisma generate
node node_modules/prisma/build/index.js generate

# Instead of: npx prisma db push
node node_modules/prisma/build/index.js db push
```

### Database Connection Issues

1. Ensure PostgreSQL is running (via Docker or locally)
2. Verify the `DATABASE_URL` in your `.env` file
3. Check that the database exists and is accessible

### Schema Changes Not Reflecting

After modifying `schema.prisma`:

1. Run `npm run prisma:generate` to update the Prisma Client
2. Run `npm run prisma:push` to update the database schema
3. Restart your development server

## Using Prisma Client in Your Code

Import the Prisma client from `lib/db.ts`:

```typescript
import { prisma } from '@/lib/db';

// Query farmers
const farmers = await prisma.farmer.findMany();

// Create a catalog
const catalog = await prisma.catalog.create({
  data: {
    farmerId: 'farmer-1',
    status: 'DRAFT',
    becknJson: { /* Beckn Protocol JSON */ },
  },
});

// Query network logs
const logs = await prisma.networkLog.findMany({
  where: { type: 'INCOMING_BID' },
  orderBy: { timestamp: 'desc' },
});
```

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma 7 Migration Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Beckn Protocol Specification](https://developers.becknprotocol.io/)
