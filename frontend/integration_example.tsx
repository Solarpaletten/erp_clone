// Пример интеграции в PurchasesPage.tsx

import { useLastOperation } from '../../hooks/tabbook/useLastOperation';
import { TabDuplicatorButton } from '../../components/tabbook/TabDuplicatorButton';

const PurchasesPage = () => {
  const { saveOperation, getOperation } = useLastOperation();
  
  // При успешном сохранении purchase:
  const handleSavePurchase = async (purchaseData) => {
    const result = await savePurchaseAPI(purchaseData);
    if (result.success) {
      // Сохраняем в TabBook для дублирования
      saveOperation('purchase', purchaseData);
    }
  };

  // TAB дублирование
  const handleTabDuplicate = (operation) => {
    // Заполняем форму данными из последней операции
    setPurchaseForm({
      supplier: operation.supplier,
      product: operation.product,
      // Дата автоматически сегодняшняя
      date: new Date().toISOString().split('T')[0],
      // Остальные поля пустые для редактирования
      amount: '',
      quantity: ''
    });
  };

  return (
    <div>
      {/* Обычная форма purchases */}
      <PurchaseForm onSave={handleSavePurchase} />
      
      {/* TAB кнопка для дублирования */}
      <div className="mt-4">
        <TabDuplicatorButton
          type="purchase"
          lastOperation={getOperation('purchase')}
          onDuplicate={handleTabDuplicate}
        />
      </div>
    </div>
  );
};
