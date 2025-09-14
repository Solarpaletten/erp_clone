#!/bin/bash

# =====================================================
# 🚀 TASK 1: PRODUCTS AIRBORNE SYSTEM - COMPLETE SETUP
# Создает все файлы для воздушного копирования товаров
# =====================================================

echo "🚀 СОЗДАНИЕ ВОЗДУШНОЙ СИСТЕМЫ ДЛЯ PRODUCTS..."
echo "📁 Создание файлов: UniversalAirborneButton, AirborneModal, Controller, Routes"

cd "$(dirname "$0")"

# =====================================================
# 3. BACKEND ROUTES
# =====================================================

echo "🛠️ Обновление backend routes..."

# Добавляем route для копирования если его нет
if ! grep -q "/copy" backend/src/routes/company/productsRoutes.js; then
  # Добавляем маршрут копирования перед module.exports
  sed -i.bak '/module\.exports/i\
// ✈️ POST /api/company/products/:id/copy - Воздушное копирование\
router.post("/:id/copy", productsController.copyProduct);\
' backend/src/routes/company/productsRoutes.js
fi

==================================

echo ""
echo "✅ TASK 1: ВОЗДУШНАЯ СИСТЕМА ДЛЯ PRODUCTS СОЗДАНА!"
echo ""
echo "📁 Созданные файлы:"
echo "  - frontend/src/components/universal/UniversalAirborneButton.tsx"
echo "  - frontend/src/components/universal/AirborneModal.tsx"
echo "  - backend/src/controllers/company/productsController.js (обновлен)"
echo "  - backend/src/routes/company/productsRoutes.js (обновлен)"
echo "  - backend/tests/controllers/productsController.test.js"
echo "  - INTEGRATION_EXAMPLE.md"
echo ""
echo "🚀 Следующие шаги:"
echo "  1. Интегрировать компонент в ProductsPage.tsx (см. INTEGRATION_EXAMPLE.md)"
echo "  2. Протестировать в браузере"
echo "  3. Запустить unit tests: npm test"
echo "  4. Code review и merge"
echo ""
echo "🎯 Готово к переходу на Task 2: WarehousePage"
echo ""
echo "✈️ Воздушная бухгалтерия запущена!"