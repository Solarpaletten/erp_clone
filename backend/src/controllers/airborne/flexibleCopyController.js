// =====================================================
// 🔄 ГИБКОЕ КОПИРОВАНИЕ С ФЛАГАМИ - РЕВОЛЮЦИОННЫЙ API
// backend/src/controllers/airborne/flexibleCopyController.js
// =====================================================

/**
 * 🎯 ГЛАВНЫЙ ЭНДПОИНТ ГИБКОГО КОПИРОВАНИЯ
 * POST /api/airborne/flexible-copy
 * 
 * Пользователь выбирает ЧТО копировать через галочки!
 */
const flexibleCopy = async (req, res) => {
    try {
      const {
        templateId,
        templateType,      // 'purchase' | 'sale' | 'full_operation'
        
        // 🎯 ФЛАГИ - ЧТО КОПИРОВАТЬ
        copyPurchase = false,        // 📦 Приход
        copySale = false,           // 💰 Реализация
        copySupplierPayment = false, // 💸 Оплата поставщику
        copyCustomerPayment = false, // 💳 Поступление от покупателя
        
        // 🔧 ИЗМЕНЕНИЯ (опционально)
        changes = {}
      } = req.body;
  
      const companyId = req.companyContext.companyId;
      const userId = req.user.id;
  
      // ✅ ВАЛИДАЦИЯ
      if (!templateId) {
        return res.status(400).json({
          success: false,
          error: 'Template ID is required'
        });
      }
  
      if (!copyPurchase && !copySale && !copySupplierPayment && !copyCustomerPayment) {
        return res.status(400).json({
          success: false,
          error: 'At least one copy flag must be true',
          message: 'Выберите хотя бы один документ для копирования'
        });
      }
  
      // 🎯 ВЫПОЛНЯЕМ ГИБКОЕ КОПИРОВАНИЕ
      const result = await req.prisma.$transaction(async (tx) => {
        const createdDocuments = {
          purchase: null,
          sale: null,
          supplierPayment: null,
          customerPayment: null,
          accountingEntries: []
        };
  
        // 📦 1. КОПИРУЕМ ПРИХОД (если выбрано)
        if (copyPurchase) {
          const purchaseData = await getPurchaseTemplate(tx, templateId, companyId);
          
          createdDocuments.purchase = await tx.purchases.create({
            data: {
              doc_number: await generateDocNumber(tx, 'PURCHASE', companyId),
              doc_date: new Date(),
              client_id: changes.supplier_id || purchaseData.client_id,
              warehouse_id: changes.warehouse_id || purchaseData.warehouse_id,
              responsible_id: userId,
              status: 'DRAFT',
              currency: purchaseData.currency,
              
              // Копируем финансовые данные
              total_net: changes.total_net || purchaseData.total_net,
              total_vat: changes.total_vat || purchaseData.total_vat,
              total_gross: changes.total_gross || purchaseData.total_gross,
              
              notes: `Копия прихода от ${purchaseData.doc_date.toLocaleDateString()}`,
              company_id: companyId,
              is_template: false,
              created_by: userId,
              
              // Копируем товарные позиции
              items: {
                create: purchaseData.items.map(item => ({
                  product_id: item.product_id,
                  quantity: changes.quantity || item.quantity,
                  unit: item.unit,
                  unit_price: changes.unit_price || item.unit_price,
                  net_amount: (changes.quantity || item.quantity) * (changes.unit_price || item.unit_price),
                  vat_rate: item.vat_rate,
                  vat_amount: ((changes.quantity || item.quantity) * (changes.unit_price || item.unit_price)) * (item.vat_rate / 100),
                  gross_amount: ((changes.quantity || item.quantity) * (changes.unit_price || item.unit_price)) * (1 + item.vat_rate / 100),
                  created_by: userId
                }))
              }
            },
            include: {
              items: { include: { product: true } },
              client: true,
              warehouse: true
            }
          });
  
          // 📊 Создаем бухгалтерскую проводку для прихода
          const purchaseEntry = await tx.accounting_entries.create({
            data: {
              entry_number: await generateEntryNumber(tx, companyId),
              entry_date: new Date(),
              amount: createdDocuments.purchase.total_gross,
              currency: 'EUR',
              account_debit: '2041',  // Нефтепродукты
              account_credit: '4430', // Поставщики
              description: `Приход: ${createdDocuments.purchase.doc_number}`,
              reference_type: 'PURCHASE',
              reference_id: createdDocuments.purchase.id,
              company_id: companyId,
              is_automatic: true,
              created_by: userId
            }
          });
          
          createdDocuments.accountingEntries.push(purchaseEntry);
        }
  
        // 💰 2. КОПИРУЕМ РЕАЛИЗАЦИЮ (если выбрано)
        if (copySale) {
          const saleData = await getSaleTemplate(tx, templateId, companyId);
          
          createdDocuments.sale = await tx.sales.create({
            data: {
              doc_number: await generateDocNumber(tx, 'SALE', companyId),
              doc_date: new Date(),
              client_id: changes.customer_id || saleData.client_id,
              warehouse_id: changes.warehouse_id || saleData.warehouse_id,
              responsible_id: userId,
              status: 'DRAFT',
              currency: saleData.currency,
              
              total_net: changes.sale_net || saleData.total_net,
              total_vat: changes.sale_vat || saleData.total_vat,
              total_gross: changes.sale_gross || saleData.total_gross,
              
              notes: `Копия реализации от ${saleData.doc_date.toLocaleDateString()}`,
              company_id: companyId,
              is_template: false,
              created_by: userId,
              
              items: {
                create: saleData.items.map(item => ({
                  product_id: item.product_id,
                  quantity: changes.sale_quantity || item.quantity,
                  unit: item.unit,
                  unit_price: changes.sale_price || item.unit_price,
                  net_amount: (changes.sale_quantity || item.quantity) * (changes.sale_price || item.unit_price),
                  vat_rate: item.vat_rate,
                  vat_amount: ((changes.sale_quantity || item.quantity) * (changes.sale_price || item.unit_price)) * (item.vat_rate / 100),
                  gross_amount: ((changes.sale_quantity || item.quantity) * (changes.sale_price || item.unit_price)) * (1 + item.vat_rate / 100),
                  created_by: userId
                }))
              }
            },
            include: {
              items: { include: { product: true } },
              client: true,
              warehouse: true
            }
          });
  
          // 📊 Бухгалтерские проводки для реализации
          const saleEntries = [
            // Дебиторы - Выручка
            await tx.accounting_entries.create({
              data: {
                entry_number: await generateEntryNumber(tx, companyId),
                entry_date: new Date(),
                amount: createdDocuments.sale.total_gross,
                currency: 'EUR',
                account_debit: '2410',  // Покупатели
                account_credit: '7001', // Выручка
                description: `Реализация: ${createdDocuments.sale.doc_number}`,
                reference_type: 'SALE',
                reference_id: createdDocuments.sale.id,
                company_id: companyId,
                is_automatic: true,
                created_by: userId
              }
            }),
            
            // Себестоимость - Товары (FIFO)
            await tx.accounting_entries.create({
              data: {
                entry_number: await generateEntryNumber(tx, companyId),
                entry_date: new Date(),
                amount: createdDocuments.purchase ? createdDocuments.purchase.total_net : 14950.00,
                currency: 'EUR',
                account_debit: '6001',  // Себестоимость
                account_credit: '2041', // Нефтепродукты
                description: `Себестоимость продаж: ${createdDocuments.sale.doc_number}`,
                reference_type: 'SALE',
                reference_id: createdDocuments.sale.id,
                company_id: companyId,
                is_automatic: true,
                created_by: userId
              }
            })
          ];
          
          createdDocuments.accountingEntries.push(...saleEntries);
        }
  
        // 💸 3. КОПИРУЕМ ОПЛАТУ ПОСТАВЩИКУ (если выбрано)
        if (copySupplierPayment) {
          const purchaseAmount = createdDocuments.purchase ? 
            createdDocuments.purchase.total_gross : 
            changes.supplier_payment_amount || 18388.50;
            
          createdDocuments.supplierPayment = await tx.bank_operations.create({
            data: {
              doc_number: await generateDocNumber(tx, 'PAYMENT', companyId),
              operation_date: new Date(),
              amount: purchaseAmount,
              currency: 'EUR',
              type: 'EXPENSE',
              description: `Оплата поставщику за нефтепродукты`,
              client_id: createdDocuments.purchase ? 
                createdDocuments.purchase.client_id : 
                changes.supplier_id,
              company_id: companyId,
              created_by: userId
            },
            include: { client: true }
          });
  
          // 📊 Проводка по банку
          const paymentEntry = await tx.accounting_entries.create({
            data: {
              entry_number: await generateEntryNumber(tx, companyId),
              entry_date: new Date(),
              amount: purchaseAmount,
              currency: 'EUR',
              account_debit: '4430',  // Поставщики (погашение долга)
              account_credit: '2710', // Банк
              description: `Оплата поставщику: ${createdDocuments.supplierPayment.doc_number}`,
              reference_type: 'BANKING',
              reference_id: createdDocuments.supplierPayment.id,
              company_id: companyId,
              is_automatic: true,
              created_by: userId
            }
          });
          
          createdDocuments.accountingEntries.push(paymentEntry);
        }
  
        // 💳 4. КОПИРУЕМ ПОСТУПЛЕНИЕ ОТ ПОКУПАТЕЛЯ (если выбрано)
        if (copyCustomerPayment) {
          const saleAmount = createdDocuments.sale ? 
            createdDocuments.sale.total_gross : 
            changes.customer_payment_amount || 19237.20;
            
          createdDocuments.customerPayment = await tx.bank_operations.create({
            data: {
              doc_number: await generateDocNumber(tx, 'RECEIPT', companyId),
              operation_date: new Date(),
              amount: saleAmount,
              currency: 'EUR',
              type: 'INCOME',
              description: `Поступление от покупателя за нефтепродукты`,
              client_id: createdDocuments.sale ? 
                createdDocuments.sale.client_id : 
                changes.customer_id,
              company_id: companyId,
              created_by: userId
            },
            include: { client: true }
          });
  
          // 📊 Проводка поступления
          const receiptEntry = await tx.accounting_entries.create({
            data: {
              entry_number: await generateEntryNumber(tx, companyId),
              entry_date: new Date(),
              amount: saleAmount,
              currency: 'EUR',
              account_debit: '2710',  // Банк
              account_credit: '2410', // Покупатели (погашение долга)
              description: `Поступление от покупателя: ${createdDocuments.customerPayment.doc_number}`,
              reference_type: 'BANKING',
              reference_id: createdDocuments.customerPayment.id,
              company_id: companyId,
              is_automatic: true,
              created_by: userId
            }
          });
          
          createdDocuments.accountingEntries.push(receiptEntry);
        }
  
        return createdDocuments;
      });
  
      // 🎊 УСПЕШНЫЙ ОТВЕТ
      res.status(201).json({
        success: true,
        message: '🎯 Гибкое копирование выполнено успешно!',
        
        // 📋 ЧТО БЫЛО СОЗДАНО
        created: {
          purchase: result.purchase ? {
            id: result.purchase.id,
            docNumber: result.purchase.doc_number,
            amount: result.purchase.total_gross,
            client: result.purchase.client.name,
            editUrl: `/company/purchases/${result.purchase.id}/edit`
          } : null,
          
          sale: result.sale ? {
            id: result.sale.id,
            docNumber: result.sale.doc_number,
            amount: result.sale.total_gross,
            client: result.sale.client.name,
            editUrl: `/company/sales/${result.sale.id}/edit`
          } : null,
          
          supplierPayment: result.supplierPayment ? {
            id: result.supplierPayment.id,
            docNumber: result.supplierPayment.doc_number,
            amount: result.supplierPayment.amount,
            client: result.supplierPayment.client.name,
            editUrl: `/company/banking/${result.supplierPayment.id}/edit`
          } : null,
          
          customerPayment: result.customerPayment ? {
            id: result.customerPayment.id,
            docNumber: result.customerPayment.doc_number,
            amount: result.customerPayment.amount,
            client: result.customerPayment.client.name,
            editUrl: `/company/banking/${result.customerPayment.id}/edit`
          } : null
        },
        
        // 📊 СТАТИСТИКА
        stats: {
          documentsCreated: [
            result.purchase && 'Приход',
            result.sale && 'Реализация', 
            result.supplierPayment && 'Оплата поставщику',
            result.customerPayment && 'Поступление от покупателя'
          ].filter(Boolean).length,
          
          accountingEntriesCreated: result.accountingEntries.length,
          timeSaved: '5-15 минут',
          totalValue: (result.purchase?.total_gross || 0) + (result.sale?.total_gross || 0)
        },
        
        // 🎯 ФЛАГИ ДЛЯ ФРОНТЕНДА
        flags: {
          copyPurchase,
          copySale,
          copySupplierPayment,
          copyCustomerPayment
        },
        
        // 📍 НАВИГАЦИЯ ДЛЯ ФРОНТЕНДА
        navigation: {
          primaryAction: result.purchase ? 
            `/company/purchases/${result.purchase.id}/edit` : 
            result.sale ? 
            `/company/sales/${result.sale.id}/edit` : null,
          
          secondaryActions: [
            result.sale && `/company/sales/${result.sale.id}/edit`,
            result.supplierPayment && `/company/banking/${result.supplierPayment.id}/edit`,
            result.customerPayment && `/company/banking/${result.customerPayment.id}/edit`
          ].filter(Boolean)
        }
      });
  
    } catch (error) {
      console.error('❌ Flexible copy error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Flexible copy failed',
        message: 'Ошибка гибкого копирования',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  // =====================================================
  // 🔧 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // =====================================================
  
  async function getPurchaseTemplate(tx, templateId, companyId) {
    return await tx.purchases.findFirst({
      where: {
        id: parseInt(templateId),
        company_id: companyId,
        is_template: true
      },
      include: {
        items: { include: { product: true } },
        client: true,
        warehouse: true
      }
    });
  }
  
  async function getSaleTemplate(tx, templateId, companyId) {
    return await tx.sales.findFirst({
      where: {
        id: parseInt(templateId),
        company_id: companyId,
        is_template: true
      },
      include: {
        items: { include: { product: true } },
        client: true,
        warehouse: true
      }
    });
  }
  
  async function generateDocNumber(tx, type, companyId) {
    const prefix = {
      PURCHASE: 'PUR',
      SALE: 'SAL',
      PAYMENT: 'PAY',
      RECEIPT: 'REC'
    }[type];
    
    const year = new Date().getFullYear();
    const count = await tx[type.toLowerCase() + 's'].count({
      where: { company_id: companyId }
    });
    
    return `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  async function generateEntryNumber(tx, companyId) {
    const year = new Date().getFullYear();
    const count = await tx.accounting_entries.count({
      where: { company_id: companyId }
    });
    
    return `AE-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  
  /**
   * 🎯 ПОЛУЧЕНИЕ ШАБЛОНОВ ДЛЯ МОДАЛЬНОГО ОКНА
   * GET /api/airborne/templates/for-flexible-copy
   */
  const getTemplatesForFlexibleCopy = async (req, res) => {
    try {
      const companyId = req.companyContext.companyId;
      
      // Получаем все шаблоны и последние документы
      const [purchaseTemplates, saleTemplates, recentDocs] = await Promise.all([
        req.prisma.purchases.findMany({
          where: {
            company_id: companyId,
            is_template: true
          },
          include: { client: true },
          orderBy: { created_at: 'desc' }
        }),
        
        req.prisma.sales.findMany({
          where: {
            company_id: companyId,
            is_template: true
          },
          include: { client: true },
          orderBy: { created_at: 'desc' }
        }),
        
        // Последние 5 документов для быстрого копирования
        req.prisma.purchases.findMany({
          where: {
            company_id: companyId,
            is_template: false
          },
          include: { client: true },
          orderBy: { doc_date: 'desc' },
          take: 5
        })
      ]);
  
      res.json({
        success: true,
        templates: {
          purchases: purchaseTemplates.map(t => ({
            id: t.id,
            name: `${t.doc_number} - ${t.client.name}`,
            amount: t.total_gross,
            date: t.doc_date,
            type: 'purchase_template'
          })),
          sales: saleTemplates.map(t => ({
            id: t.id,
            name: `${t.doc_number} - ${t.client.name}`,
            amount: t.total_gross,
            date: t.doc_date,
            type: 'sale_template'
          })),
          recent: recentDocs.map(d => ({
            id: d.id,
            name: `${d.doc_number} - ${d.client.name}`,
            amount: d.total_gross,
            date: d.doc_date,
            type: 'recent_purchase'
          }))
        },
        defaultFlags: {
          copyPurchase: true,  // По умолчанию только приход
          copySale: false,
          copySupplierPayment: false,
          copyCustomerPayment: false
        }
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get templates'
      });
    }
  };
  
  module.exports = {
    flexibleCopy,
    getTemplatesForFlexibleCopy
  };