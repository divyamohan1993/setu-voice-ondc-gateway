require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample farmers
  const farmer1 = await prisma.farmer.upsert({
    where: { id: 'farmer-1' },
    update: {},
    create: {
      id: 'farmer-1',
      name: 'राजेश पाटिल',
      locationLatLong: '19.0760,72.8777', // Mumbai coordinates
      languagePref: 'hi',
      upiId: 'rajesh.patil@paytm',
    },
  });

  const farmer2 = await prisma.farmer.upsert({
    where: { id: 'farmer-2' },
    update: {},
    create: {
      id: 'farmer-2',
      name: 'सुनीता देशमुख',
      locationLatLong: '18.5204,73.8567', // Pune coordinates
      languagePref: 'mr',
      upiId: 'sunita.deshmukh@upi',
    },
  });

  console.log('✅ Created farmers:', farmer1.name, farmer2.name);

  // Create sample catalogs
  const catalog1 = await prisma.catalog.upsert({
    where: { id: 'catalog-1' },
    update: {},
    create: {
      id: 'catalog-1',
      farmerId: farmer1.id,
      status: 'BROADCASTED',
      becknJson: {
        descriptor: {
          name: 'Nasik Onions',
          symbol: '/icons/onion.png',
        },
        price: {
          value: 40,
          currency: 'INR',
        },
        quantity: {
          available: {
            count: 500,
          },
          unit: 'kg',
        },
        tags: {
          grade: 'A',
          perishability: 'medium',
          logistics_provider: 'India Post',
        },
      },
    },
  });

  const catalog2 = await prisma.catalog.upsert({
    where: { id: 'catalog-2' },
    update: {},
    create: {
      id: 'catalog-2',
      farmerId: farmer2.id,
      status: 'DRAFT',
      becknJson: {
        descriptor: {
          name: 'Alphonso Mangoes',
          symbol: '/icons/mango.png',
        },
        price: {
          value: 150,
          currency: 'INR',
        },
        quantity: {
          available: {
            count: 20,
          },
          unit: 'crate',
        },
        tags: {
          grade: 'Premium',
          perishability: 'high',
          logistics_provider: 'Delhivery',
        },
      },
    },
  });

  console.log('✅ Created catalogs:', catalog1.id, catalog2.id);

  // Create sample network logs
  const log1 = await prisma.networkLog.create({
    data: {
      type: 'OUTGOING_CATALOG',
      payload: {
        catalogId: catalog1.id,
        farmerId: farmer1.id,
        becknJson: catalog1.becknJson,
        timestamp: new Date().toISOString(),
      },
    },
  });

  const log2 = await prisma.networkLog.create({
    data: {
      type: 'INCOMING_BID',
      payload: {
        catalogId: catalog1.id,
        buyerName: 'Reliance Fresh',
        bidAmount: 38.5,
        buyerLogo: '/logos/reliance.png',
        timestamp: new Date().toISOString(),
      },
    },
  });

  const log3 = await prisma.networkLog.create({
    data: {
      type: 'INCOMING_BID',
      payload: {
        catalogId: catalog1.id,
        buyerName: 'BigBasket',
        bidAmount: 42.0,
        buyerLogo: '/logos/bigbasket.png',
        timestamp: new Date().toISOString(),
      },
    },
  });

  console.log('✅ Created network logs:', log1.id, log2.id, log3.id);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
