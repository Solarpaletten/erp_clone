import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export interface SidebarGroupItem {
  id: string;
  title: string;
  route: string;
  icon: string;
  badge?: string;
}

/**
 * Компонент группы пунктов меню, который разворачивается/сворачивается по клику.
 */
const SidebarGroup: React.FC<{ title: string; items: SidebarGroupItem[] }> = ({
  title,
  items,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center p-3 text-left hover:bg-slate-700 transition-colors"
      >
        <span className="font-semibold">{title}</span>
      </button>

      {expanded && (
        <div className="ml-4">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.route}
              className={({ isActive }) =>
                `flex items-center p-2 hover:bg-slate-700 transition-colors ${
                  isActive ? 'bg-slate-700 border-r-2 border-orange-500' : ''
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-2 text-xs bg-orange-500 text-white rounded px-1">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarGroup;
