const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCompany() {
  try {
    const admin = await prisma.users.findFirst({ 
      where: { email: 'solar@solar.com' } 
    });
    
    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }
    
    console.log('👤 Found admin:', admin.email);
    
    const company = await prisma.companies.create({
      data: {
        code: 'SWAPOIL',
        name: 'SWAPOIL GMBH',
        director_name: 'LEANID KANOPLICH',
        owner_id: admin.id,
        legal_entity_type: 'GMBH',
        description: 'Нефтяная торговля',
        is_active: true,
        setup_completed: true
      }
    });
    
    console.log('✅ Company created:', company.name);
    console.log('📋 ID:', company.id, 'Code:', company.code);
    
    await prisma.$disconnect();
    process.exit(0);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createCompany();
