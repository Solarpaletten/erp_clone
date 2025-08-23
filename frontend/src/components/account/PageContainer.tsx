import React, { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

/**
 * Контейнер страницы с заголовком и стандартными стилями
 */
const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  actions,
}) => {
  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
