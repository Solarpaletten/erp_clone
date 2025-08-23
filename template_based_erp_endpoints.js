// 🚀 ВОЗДУШНАЯ БУХГАЛТЕРИЯ - API ENDPOINTS
// =============================================

// 🏗️ 1. ИНИЦИАЛИЗАЦИЯ КОМПАНИИ С БАЗОВЫМ НАБОРОМ
app.post('/api/company/init-templates', async (req, res) => {
  const { companyId } = req.body;
  
  try {
    // Создаем базовые сущности одной транзакцией
    const templates = await prisma.$transaction(async (tx) => {
      // Базовый склад
      const warehouse = await tx.warehouses.create({
        data: {
          name: 'Основной склад',
          code: 'MAIN',
          company_id: companyId,
          is_template: true
        }
      });

      // Базовый товар
      const product = await tx.products.create({
        data: {
          name: 'Товар-шаблон',
          code: 'TEMPLATE',
          price: 100.00,
          warehouse_id: warehouse.id,
          is_template: true
        }
      });

      // Базовые клиенты
      const supplier = await tx.clients.create({
        data: {
          name: 'Поставщик-шаблон',
          type: 'SUPPLIER',
          company_id: companyId,
          is_template: true
        }
      });

      const customer = await tx.clients.create({
        data: {
          name: 'Покупатель-шаблон', 
          type: 'CUSTOMER',
          company_id: companyId,
          is_template: true
        }
      });

      // Базовый приход-шаблон
      const purchaseTemplate = await tx.purchases.create({
        data: {
          client_id: supplier.id,
          warehouse_id: warehouse.id,
          responsible_id: req.user.id,
          status: 'TEMPLATE',
          total_amount: 100.00,
          items: {
            create: [{
              product_id: product.id,
              quantity: 1,
              price: 100.00,
              amount: 100.00
            }]
          }
        }
      });

      // Базовая реализация-шаблон
      const saleTemplate = await tx.sales.create({
        data: {
          client_id: customer.id,
          warehouse_id: warehouse.id,
          responsible_id: req.user.id,
          status: 'TEMPLATE',
          total_amount: 120.00,
          items: {
            create: [{
              product_id: product.id,
              quantity: 1,
              price: 120.00,
              amount: 120.00
            }]
          }
        }
      });

      return {
        warehouse,
        product,
        supplier,
        customer,
        purchaseTemplate,
        saleTemplate
      };
    });

    res.json({
      success: true,
      message: 'Базовые шаблоны созданы',
      templates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ⚡ 2. СОЗДАНИЕ ПРИХОДА НА ОСНОВЕ ШАБЛОНА (10 СЕКУНД!)
app.post('/api/purchases/from-template', async (req, res) => {
  const { templateId, changes = {} } = req.body;
  
  try {
    // Получаем шаблон с полными данными
    const template = await prisma.purchases.findUnique({
      where: { id: templateId },
      include: {
        items: { include: { product: true } },
        client: true,
        warehouse: true
      }
    });

    // Создаем новый приход на основе шаблона
    const newPurchase = await prisma.purchases.create({
      data: {
        // Берем данные из шаблона
        client_id: changes.client_id || template.client_id,
        warehouse_id: changes.warehouse_id || template.warehouse_id,
        responsible_id: req.user.id,
        
        // Новые данные
        date: new Date(),
        status: 'DRAFT',
        total_amount: changes.total_amount || template.total_amount,
        
        // Копируем товарные позиции
        items: {
          create: template.items.map(item => ({
            product_id: changes.product_id || item.product_id,
            quantity: changes.quantity || item.quantity,
            price: changes.price || item.price,
            amount: (changes.quantity || item.quantity) * (changes.price || item.price)
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
      message: 'Приход создан за 10 секунд!',
      purchase: newPurchase,
      created_in: '10s'
    });

  } catch (error) {
    res.status(500).json({
      success: false, 
      error: error.message
    });
  }
});

// 📋 3. КОПИРОВАНИЕ ПОСЛЕДНЕГО ДОКУМЕНТА
app.post('/api/purchases/copy-last', async (req, res) => {
  const { companyId } = req.body;
  
  try {
    // Находим последний приход компании
    const lastPurchase = await prisma.purchases.findFirst({
      where: { 
        company_id: companyId,
        status: { not: 'TEMPLATE' }
      },
      orderBy: { created_at: 'desc' },
      include: {
        items: { include: { product: true } },
        client: true,
        warehouse: true
      }
    });

    if (!lastPurchase) {
      return res.status(404).json({
        success: false,
        message: 'Нет документов для копирования'
      });
    }

    // Создаем копию с новой датой
    const copiedPurchase = await prisma.purchases.create({
      data: {
        client_id: lastPurchase.client_id,
        warehouse_id: lastPurchase.warehouse_id,
        responsible_id: req.user.id,
        date: new Date(),
        status: 'DRAFT',
        total_amount: lastPurchase.total_amount,
        
        items: {
          create: lastPurchase.items.map(item => ({
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
      message: 'Документ скопирован!',
      purchase: copiedPurchase,
      copied_from: lastPurchase.id
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔄 4. ПРОВЕДЕНИЕ ДОКУМЕНТА С АВТОМАТИЧЕСКИМ ОБНОВЛЕНИЕМ ОСТАТКОВ
app.post('/api/purchases/:id/conduct', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Проводим документ
      const purchase = await tx.purchases.update({
        where: { id },
        data: { 
          status: 'CONDUCTED',
          conducted_at: new Date()
        },
        include: { items: true }
      });

      // Обновляем остатки на складе
      for (const item of purchase.items) {
        await tx.inventory.upsert({
          where: {
            product_id_warehouse_id: {
              product_id: item.product_id,
              warehouse_id: purchase.warehouse_id
            }
          },
          create: {
            product_id: item.product_id,
            warehouse_id: purchase.warehouse_id,
            quantity: item.quantity
          },
          update: {
            quantity: { increment: item.quantity }
          }
        });
      }

      // Создаем финансовую проводку если есть оплата
      if (purchase.payment_amount > 0) {
        await tx.account_entries.create({
          data: {
            debit_account: 'INVENTORY',
            credit_account: 'CASH',
            amount: purchase.payment_amount,
            document_type: 'PURCHASE',
            document_id: purchase.id
          }
        });
      }

      return purchase;
    });

    res.json({
      success: true,
      message: 'Документ проведен! Остатки обновлены!',
      purchase: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 📊 5. ПОЛУЧЕНИЕ ШАБЛОНОВ ДЛЯ БЫСТРОГО ВЫБОРА
app.get('/api/templates/quick-access', async (req, res) => {
  const { companyId } = req.query;
  
  try {
    const templates = await prisma.$queryRaw`
      SELECT 
        'purchase' as type,
        id,
        'Приход: ' || c.name as title,
        total_amount
      FROM purchases p
      JOIN clients c ON p.client_id = c.id  
      WHERE p.company_id = ${companyId}
        AND (p.status = 'TEMPLATE' OR p.id IN (
          SELECT id FROM purchases 
          WHERE company_id = ${companyId} 
          ORDER BY created_at DESC 
          LIMIT 3
        ))
      
      UNION ALL
      
      SELECT 
        'sale' as type,
        id, 
        'Продажа: ' || c.name as title,
        total_amount
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      WHERE s.company_id = ${companyId}
        AND (s.status = 'TEMPLATE' OR s.id IN (
          SELECT id FROM sales
          WHERE company_id = ${companyId}
          ORDER BY created_at DESC
          LIMIT 3  
        ))
    `;

    res.json({
      success: true,
      templates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message  
    });
  }
});

// 🎯 6. DRAG-AND-DROP ИНТЕРФЕЙС - ОБНОВЛЕНИЕ ПОРЯДКА ЭЛЕМЕНТОВ
app.post('/api/templates/reorder', async (req, res) => {
  const { items } = req.body; // [{ id, order }]
  
  try {
    const updates = items.map(item => 
      prisma.template_items.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );

    await prisma.$transaction(updates);

    res.json({
      success: true,
      message: 'Порядок элементов обновлен!'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});