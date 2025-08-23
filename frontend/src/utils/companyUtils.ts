asset@solar f % cat src/utils/companyUtils.ts
/**
 * Утилиты для работы с данными компании
 */

/**
 * Стандартизирует код компании, удаляя суффикс с временной меткой, если он есть
 * @param code Код компании (может быть с суффиксом или без)
 * @returns Очищенный код компании без суффикса
 */
export const standardizeCompanyCode = (code: string): string => {
  if (!code) return '';

  // Удаляем суффикс временной метки, если он есть
  // Формат: "14926445_525518" -> "14926445"
  return code.split('_')[0];
};

/**
 * Проверяет, содержит ли код компании суффикс с временной меткой
 * @param code Код компании для проверки
 */
export const hasTimestampSuffix = (code: string): boolean => {
  if (!code) return false;
  return code.includes('_') && /^\d+_\d+$/.test(code);
};
