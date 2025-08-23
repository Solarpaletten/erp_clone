// 🔄 COPY EVERYTHING API - РЕВОЛЮЦИОННОЕ КОПИРОВАНИЕ
// ===================================================

// 📦 1. КОПИРОВАНИЕ ПРИХОДА ТОВАРА
app.post('/api/company/purchases/:id/copy', async (req, res) => {
  const { id } = req.params;
  
  try {
    const original = await prisma.purchases.findUnique({
      where: { id },
      include: { 
        items: { include: { product: true } },
        client: true,
        warehouse: true
      }
    });

    if (!original) {
      return res.status(404).json({ 
        success: false, 
        message: 'Приход не найден' 
      });
    }

    // Создаем копию с СЕГОДНЯШНЕЙ ДАТОЙ
    const copy = await prisma.purchases.create({
      data: {
        // 📅 ГЛАВНОЕ: СЕГОДНЯШНЯЯ ДАТА!
        date: new Date(),
        
        // 🔄 Копируем всё остальное
        client_id: original.client_id,
        warehouse_id: original.warehouse_id,
        responsible_id: req.user.id,
        status: 'DRAFT',
        total_amount: original.total_amount,
        notes: `Копия от ${original.date.toLocaleDateString()}`,
        
        // 📦 Копируем все товарные позиции
        items: {
          create: original.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount
          }))
        }
      },
      include: {
        items: { include: { product: true } },
        client: true,
        warehouse: true
      }
    });

    res.json({
      success: true,
      message: 'Приход скопирован! Можете изменить что нужно',
      original_id: original.id,
      copy_id: copy.id,
      copy: copy,
      time_saved: '5 минут'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 💰 2. КОПИРОВАНИЕ РЕАЛИЗАЦИИ ТОВАРА
app.post('/api/company/sales/:id/copy', async (req, res) => {
  const { id } = req.params;
  
  try {
    const original = await prisma.sales.findUnique({
      where: { id },
      include: { 
        items: { include: { product: true } },
        client: true,
        warehouse: true
      }
    });

    const copy = await prisma.sales.create({
      data: {
        // 📅 СЕГОДНЯШНЯЯ ДАТА - КЛЮЧЕВОЕ ОТЛИЧИЕ
        date: new Date(),
        
        client_id: original.client_id,
        warehouse_id: original.warehouse_id,
        responsible_id: req.user.id,
        status: 'DRAFT',
        total_amount: original.total_amount,
        notes: `Копия реализации от ${original.date.toLocaleDateString()}`,
        
        items: {
          create: original.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount
          }))
        }
      },
      include: {
        items: { include: { product: true } },
        client: true,
        warehouse: true
      }
    });

    res.json({
      success: true,
      message: 'Реализация скопирована!',
      copy: copy,
      time_saved: '5 минут'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 💸 3. КОПИРОВАНИЕ ОПЛАТЫ ПОСТАВЩИКУ
app.post('/api/company/payments/suppliers/:id/copy', async (req, res) => {
  const { id } = req.params;
  
  try {
    const original = await prisma.payments.findUnique({
      where: { id },
      include: { 
        client: true,
        account: true 
      }
    });

    const copy = await prisma.payments.create({
      data: {
        // 📅 СЕГОДНЯШНЯЯ ДАТА
        date: new Date(),
        
        type: 'SUPPLIER_PAYMENT',
        client_id: original.client_id,
        account_id: original.account_id,
        amount: original.amount,
        currency: original.currency,
        payment_method: original.payment_method,
        status: 'DRAFT',
        description: `Копия оплаты от ${original.date.toLocaleDateString()}`,
        reference: generatePaymentReference()
      },
      include: {
        client: true,
        account: true
      }
    });

    res.json({
      success: true,
      message: 'Оплата поставщику скопирована!',
      copy: copy
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 💳 4. КОПИРОВАНИЕ ОПЛАТЫ ОТ ПОКУПАТЕЛЯ
app.post('/api/company/payments/customers/:id/copy', async (req, res) => {
  const { id } = req.params;
  
  try {
    const original = await prisma.payments.findUnique({
      where: { id },
      include: { 
        client: true,
        account: true 
      }
    });

    const copy = await prisma.payments.create({
      data: {
        // 📅 СЕГОДНЯШНЯЯ ДАТА
        date: new Date(),
        
        type: 'CUSTOMER_PAYMENT',
        client_id: original.client_id,
        account_id: original.account_id,
        amount: original.amount,
        currency: original.currency,
        payment_method: original.payment_method,
        status: 'DRAFT',
        description: `Копия поступления от ${original.date.toLocaleDateString()}`,
        reference: generatePaymentReference()
      },
      include: {
        client: true,
        account: true
      }
    });

    res.json({
      success: true,
      message: 'Поступление от покупателя скопировано!',
      copy: copy
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🎯 5. УНИВЕРСАЛЬНОЕ КОПИРОВАНИЕ ЛЮБОГО ДОКУМЕНТА
app.post('/api/company/documents/:type/:id/copy', async (req, res) => {
  const { type, id } = req.params;
  
  try {
    let copyResult;
    
    switch (type) {
      case 'purchase':
        copyResult = await copyPurchase(id, req.user.id);
        break;
      case 'sale':
        copyResult = await copySale(id, req.user.id);
        break;
      case 'supplier-payment':
        copyResult = await copySupplierPayment(id, req.user.id);
        break;
      case 'customer-payment':
        copyResult = await copyCustomerPayment(id, req.user.id);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Неизвестный тип документа'
        });
    }

    res.json({
      success: true,
      message: `${getDocumentName(type)} скопирован!`,
      copy: copyResult,
      redirect_to: `/company/${type}s/${copyResult.id}/edit`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 📊 6. МАССОВОЕ КОПИРОВАНИЕ ДЛЯ СОЗДАНИЯ БАЛАНСА
app.post('/api/company/balance/create-from-template', async (req, res) => {
  const { template_date, target_date } = req.body;
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Находим все операции за шаблонную дату
      const templateOperations = await getOperationsForDate(template_date, req.user.company_id);
      
      const copiedOperations = {
        purchases: [],
        sales: [],
        payments: []
      };

      // Копируем приходы
      for (const purchase of templateOperations.purchases) {
        const copy = await tx.purchases.create({
          data: {
            ...purchase,
            id: undefined, // Новый ID
            date: new Date(target_date),
            status: 'DRAFT',
            items: {
              create: purchase.items.map(item => ({
                ...item,
                id: undefined
              }))
            }
          }
        });
        copiedOperations.purchases.push(copy);
      }

      // Копируем реализации
      for (const sale of templateOperations.sales) {
        const copy = await tx.sales.create({
          data: {
            ...sale,
            id: undefined,
            date: new Date(target_date),
            status: 'DRAFT',
            items: {
              create: sale.items.map(item => ({
                ...item,
                id: undefined
              }))
            }
          }
        });
        copiedOperations.sales.push(copy);
      }

      // Копируем платежи
      for (const payment of templateOperations.payments) {
        const copy = await tx.payments.create({
          data: {
            ...payment,
            id: undefined,
            date: new Date(target_date),
            status: 'DRAFT'
          }
        });
        copiedOperations.payments.push(copy);
      }

      return copiedOperations;
    });

    res.json({
      success: true,
      message: 'Баланс создан на основе шаблона!',
      template_date,
      target_date,
      copied: {
        purchases: result.purchases.length,
        sales: result.sales.length,
        payments: result.payments.length
      },
      time_saved: '2 часа',
      operations: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🛠️ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function generatePaymentReference() {
  return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

function getDocumentName(type) {
  const names = {
    'purchase': 'Приход',
    'sale': 'Реализация',
    'supplier-payment': 'Оплата поставщику',
    'customer-payment': 'Поступление от покупателя'
  };
  return names[type] || 'Документ';
}

async function getOperationsForDate(date, companyId) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const [purchases, sales, payments] = await Promise.all([
    prisma.purchases.findMany({
      where: {
        company_id: companyId,
        date: { gte: startDate, lte: endDate }
      },
      include: { items: true }
    }),
    prisma.sales.findMany({
      where: {
        company_id: companyId,
        date: { gte: startDate, lte: endDate }
      },
      include: { items: true }
    }),
    prisma.payments.findMany({
      where: {
        company_id: companyId,
        date: { gte: startDate, lte: endDate }
      }
    })
  ]);

  return { purchases, sales, payments };
}

// 🎊 7. ПОЛУЧЕНИЕ СПИСКА ДОКУМЕНТОВ ДЛЯ БЫСТРОГО КОПИРОВАНИЯ
app.get('/api/company/documents/copy-candidates', async (req, res) => {
  const { type, limit = 10 } = req.query;
  
  try {
    let documents = [];
    
    switch (type) {
      case 'purchases':
        documents = await prisma.purchases.findMany({
          where: { company_id: req.user.company_id },
          orderBy: { date: 'desc' },
          take: parseInt(limit),
          include: { client: true, warehouse: true }
        });
        break;
      case 'sales':
        documents = await prisma.sales.findMany({
          where: { company_id: req.user.company_id },
          orderBy: { date: 'desc' },
          take: parseInt(limit),
          include: { client: true, warehouse: true }
        });
        break;
      case 'payments':
        documents = await prisma.payments.findMany({
          where: { company_id: req.user.company_id },
          orderBy: { date: 'desc' },
          take: parseInt(limit),
          include: { client: true, account: true }
        });
        break;
    }

    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        date: doc.date,
        client_name: doc.client?.name,
        warehouse_name: doc.warehouse?.name,
        account_name: doc.account?.name,
        amount: doc.total_amount || doc.amount,
        status: doc.status,
        can_copy: true
      }))
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});