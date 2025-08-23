// В accountController.js добавить:
const getCompaniesWithStats = async (req, res) => {
  const companies = await prisma.companies.findMany({
    include: {
      _count: {
        select: { clients: true }
      }
    }
  });
  
  res.json({
    success: true,
    companies: companies.map(c => ({
      ...c,
      clientsCount: c._count.clients
    }))
  });
};
