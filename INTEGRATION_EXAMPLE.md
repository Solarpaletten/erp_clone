# Интеграция воздушной кнопки в ProductsPage.tsx

## 1. Добавить импорт
```typescript
import UniversalAirborneButton from '../../../components/universal/UniversalAirborneButton';
```

## 2. Добавить handlers
```typescript
const handleAirborneSuccess = (newProduct: any) => {
  // Оптимистичное добавление товара в список
  setProducts(prev => [newProduct, ...prev]);
  fetchStats(); // Обновляем статистику
  toast.success(`Товар "${newProduct.name}" воздушно скопирован!`);
};

const handleAirborneError = (error: string) => {
  toast.error(`Ошибка воздушного копирования: ${error}`);
};
```

## 3. Добавить компонент перед закрывающим </div>
```typescript
{/* ✈️ ВОЗДУШНАЯ ПЛАВАЮЩАЯ КНОПКА */}
<UniversalAirborneButton
  module="products"
  apiEndpoint="/api/company/products"
  itemName="товар"
  lastItemsCount={5}
  onSuccess={handleAirborneSuccess}
  onError={handleAirborneError}
/>
```

## 4. Добавить react-toastify для уведомлений (если не установлено)
```bash
npm install react-toastify
```

```typescript
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// В конце компонента добавить ToastContainer
<ToastContainer />
```
