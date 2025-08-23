//backend/src/controllers/company/flexibleCopyController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../../config/logger');

/**
 * 🚀 КОНТРОЛЛЕР ГИБКОГО КОПИРОВАНИЯ - ВОЗДУШНАЯ БУХГАЛТЕРИЯ
 * Революционное копирование документов за 10 секунд!
 */

/**
 * Гибкое копирование с выбором документов
 * POST /api/company/airborne/flexible-copy
 */
const flexibleCopy = async (req, res) => {
  try {
    const companyId = parseInt(req.headers['x-company-id']);
    const userId = req.user.id;
    const { 
      templateId, 
      copyPurchase, 
      copySale, 
      copySupplierPayment, 
      copyCustomerPayment,
      changes = {} 
    } = req.body;

    logger.info('🚀 Starting flexible copy operation', { 
      companyId, 
      templateId, 
      flags: { copyPurchase, copySale, copySupplierPayment, copyCustomerPayment } 
    });

    // Найти шаблон
    const template = await prisma.purchases.findFirst({
      where: {
        id: templateId,
        company_id: companyId,
        is_template: true
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        supplier: true,
        warehouse: true
      }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    const results = {
      purchase: null,
      sale: null,
      supplierPayment: null,
      customerPayment: null
    };

    // Текущая дата
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];

    // 🎯 1. КОПИРОВАТЬ ПРИХОД
    if (copyPurchase) {
      const purchaseData = {
        company_id: companyId,
        document_number: `PUR-${Date.now()}`,
        document_date: today,
        operation_type: 'PURCHASE',
        supplier_id: template.supplier_id,
        warehouse_id: template.warehouse_id,
        purchase_manager_id: userId,
        subtotal: changes.total_net || template.subtotal,
        vat_amount: changes.vat_amount || template.vat_amount,
        total_amount: changes.total_gross || template.total_amount,
        currency: 'EUR',
        payment_status: 'PENDING',
        delivery_status: 'PENDING',
        document_status: 'DRAFT',
        created_by: userId,
        is_template: false
      };

      const newPurchase = await prisma.purchases.create({
        data: purchaseData
      });

      // Копировать позиции
      for (const item of template.items) {
        await prisma.purchase_items.create({
          data: {
            purchase_id: newPurchase.id,
            product_id: item.product_id,
            quantity: changes.quantity || item.quantity,
            unit_price_base: changes.price_per_ton || item.unit_price_base,
            vat_rate: item.vat_rate,
            vat_amount: item.vat_amount,
            line_total: item.line_total
          }
        });
      }

      results.purchase = {
        id: newPurchase.id,
        document_number: newPurchase.document_number,
        editUrl: `/company/purchases/${newPurchase.id}/edit`
      };

      logger.info('✅ Purchase copied successfully', { id: newPurchase.id });
    }

    // 🎯 2. КОПИРОВАТЬ РЕАЛИЗАЦИЮ
    if (copySale) {
      // Найти покупателя-шаблон
      const customer = await prisma.clients.findFirst({
        where: {
          company_id: companyId,
          is_template: true,
          type: 'CUSTOMER'
        }
      });

      if (customer) {
        const saleData = {
          company_id: companyId,
          document_number: `SAL-${Date.now()}`,
          document_date: today,
          document_type: 'INVOICE',
          client_id: customer.id,
          warehouse_id: template.warehouse_id,
          sales_manager_id: userId,
          subtotal: changes.sale_total_net || (template.subtotal * 1.05), // наценка 5%
          vat_amount: changes.sale_vat || (template.vat_amount * 1.05),
          total_amount: changes.sale_total_gross || (template.total_amount * 1.05),
          currency: 'EUR',
          payment_status: 'PENDING',
          delivery_status: 'PENDING',
          document_status: 'DRAFT',
          created_by: userId,
          is_template: false
        };

        const newSale = await prisma.sales.create({
          data: saleData
        });

        results.sale = {
          id: newSale.id,
          document_number: newSale.document_number,
          editUrl: `/company/sales/${newSale.id}/edit`
        };

        logger.info('✅ Sale copied successfully', { id: newSale.id });
      }
    }

    // 🎯 3. КОПИРОВАТЬ ОПЛАТУ ПОСТАВЩИКУ
    if (copySupplierPayment) {
      const paymentData = {
        company_id: companyId,
        doc_number: `PAY-SUP-${Date.now()}`,
        operation_date: today,
        amount: changes.total_gross || template.total_amount,
        currency: 'EUR',
        type: 'OUTGOING',
        description: `Оплата поставщику ${template.supplier.name}`,
        client_id: template.supplier_id,
        created_by: userId
      };

      const newPayment = await prisma.bank_operations.create({
        data: paymentData
      });

      results.supplierPayment = {
        id: newPayment.id,
        doc_number: newPayment.doc_number,
        editUrl: `/company/banking/${newPayment.id}/edit`
      };

      logger.info('✅ Supplier payment copied successfully', { id: newPayment.id });
    }

    // 🎯 4. КОПИРОВАТЬ ОПЛАТУ ОТ ПОКУПАТЕЛЯ
    if (copyCustomerPayment && results.sale) {
      const customer = await prisma.clients.findFirst({
        where: {
          company_id: companyId,
          is_template: true,
          type: 'CUSTOMER'
        }
      });

      if (customer) {
        const receiptData = {
          company_id: companyId,
          doc_number: `PAY-CUS-${Date.now()}`,
          operation_date: today,
          amount: results.sale ? (changes.total_gross || template.total_amount) * 1.05 : 0,
          currency: 'EUR',
          type: 'INCOMING',
          description: `Оплата от покупателя ${customer.name}`,
          client_id: customer.id,
          created_by: userId
        };

        const newReceipt = await prisma.bank_operations.create({
          data: receiptData
        });

        results.customerPayment = {
          id: newReceipt.id,
          doc_number: newReceipt.doc_number,
          editUrl: `/company/banking/${newReceipt.id}/edit`
        };

        logger.info('✅ Customer payment copied successfully', { id: newReceipt.id });
      }
    }

    // 📊 Статистика
    const documentsCreated = Object.values(results).filter(r => r !== null).length;
    const timeSaved = documentsCreated * 5; // 5 минут на документ

    const response = {
      success: true,
      message: `🎊 Скопировано ${documentsCreated} документов за 10 секунд!`,
      created: results,
      stats: {
        documentsCreated,
        timeSaved: `${timeSaved} минут`,
        efficiency: '20x быстрее обычного ввода'
      },
      navigation: {
        primaryAction: results.purchase?.editUrl || results.sale?.editUrl || null,
        secondaryActions: Object.values(results)
          .filter(r => r !== null)
          .map(r => r.editUrl)
          .filter(url => url !== (results.purchase?.editUrl || results.sale?.editUrl))
      },
      timestamp: new Date().toISOString()
    };

    logger.info('🎊 Flexible copy completed successfully', { 
      companyId, 
      documentsCreated, 
      timeSaved: `${timeSaved} минут` 
    });

    res.json(response);

  } catch (error) {
    logger.error('❌ Error in flexible copy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to copy documents',
      message: error.message
    });
  }
};

/**
 * Получить последние документы для быстрого копирования
 * GET /api/company/airborne/recent-documents
 */
const getRecentDocuments = async (req, res) => {
  try {
    const companyId = parseInt(req.headers['x-company-id']);

    const recentPurchases = await prisma.purchases.findMany({
      where: {
        company_id: companyId,
        is_template: false
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5
    });

    const recentSales = await prisma.sales.findMany({
      where: {
        company_id: companyId,
        is_template: false
      },
      include: {
        client: true,
        warehouse: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5
    });

    res.json({
      success: true,
      data: {
        purchases: recentPurchases,
        sales: recentSales
      }
    });

  } catch (error) {
    logger.error('❌ Error getting recent documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent documents',
      message: error.message
    });
  }
};

/**
 * Быстрое копирование последнего документа
 * POST /api/company/airborne/quick-copy/:type/:id
 */
const quickCopy = async (req, res) => {
  try {
    const companyId = parseInt(req.headers['x-company-id']);
    const userId = req.user.id;
    const { type, id } = req.params;

    logger.info('⚡ Quick copy operation', { companyId, type, id });

    let newDocument = null;
    const today = new Date();

    if (type === 'purchase') {
      const original = await prisma.purchases.findFirst({
        where: {
          id: parseInt(id),
          company_id: companyId
        },
        include: {
          items: true
        }
      });

      if (!original) {
        return res.status(404).json({ success: false, error: 'Purchase not found' });
      }

      // Копировать приход
      const purchaseData = {
        ...original,
        id: undefined,
        document_number: `PUR-${Date.now()}`,
        document_date: today,
        created_by: userId,
        created_at: undefined,
        updated_at: undefined,
        is_template: false
      };

      delete purchaseData.items;

      newDocument = await prisma.purchases.create({
        data: purchaseData
      });

      // Копировать позиции
      for (const item of original.items) {
        const itemData = {
          ...item,
          id: undefined,
          purchase_id: newDocument.id,
          created_at: undefined,
          updated_at: undefined
        };

        await prisma.purchase_items.create({
          data: itemData
        });
      }
    } else if (type === 'sale') {
      const original = await prisma.sales.findFirst({
        where: {
          id: parseInt(id),
          company_id: companyId
        },
        include: {
          items: true
        }
      });

      if (!original) {
        return res.status(404).json({ success: false, error: 'Sale not found' });
      }

      // Копировать продажу
      const saleData = {
        ...original,
        id: undefined,
        document_number: `SAL-${Date.now()}`,
        document_date: today,
        created_by: userId,
        created_at: undefined,
        updated_at: undefined,
        is_template: false
      };

      delete saleData.items;

      newDocument = await prisma.sales.create({
        data: saleData
      });

      // Копировать позиции
      for (const item of original.items) {
        const itemData = {
          ...item,
          id: undefined,
          sale_id: newDocument.id,
          created_at: undefined,
          updated_at: undefined
        };

        await prisma.sale_items.create({
          data: itemData
        });
      }
    }

    res.json({
      success: true,
      message: '⚡ Документ скопирован за 10 секунд!',
      data: {
        id: newDocument.id,
        document_number: newDocument.document_number,
        editUrl: `/company/${type}s/${newDocument.id}/edit`
      },
      stats: {
        timeSaved: '5 минут',
        efficiency: '30x быстрее'
      }
    });

  } catch (error) {
    logger.error('❌ Error in quick copy:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to copy document',
      message: error.message
    });
  }
};

module.exports = {
  flexibleCopy,
  getRecentDocuments,
  quickCopy
};