import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GripVertical, ChevronDown, ChevronRight } from 'lucide-react';

// Типы секций: одиночный пункт или группа пунктов
type MenuItem = {
  id: string;
  type: 'item';
  title: string;
  route: string;
  icon: string;
  badge?: string;
};

type MenuGroup = {
  id: string;
  type: 'group';
  title: string;
  items: MenuItem[];
};

type Section = MenuItem | MenuGroup;

const CompanySidebar: React.FC = () => {
  // Универсальный список секций
  const [sections, setSections] = useState<Section[]>([
    { id: 'dashboard', type: 'item', title: 'Dashboard', route: '/dashboard', icon: '📊' },
    { id: 'clients', type: 'item', title: 'Clients', route: '/clients', icon: '👥' },
    { id: 'dashka', type: 'item', title: 'Dashka', route: '/dashka', icon: '🎯', badge: 'HOT' },
    {
      id: 'warehouseGroup',
      type: 'group',
      title: 'Склад',
      items: [
        { id: 'products', type: 'item', title: 'Products', route: '/products', icon: '📦' },
        { id: 'warehouse', type: 'item', title: 'Warehouse', route: '/warehouse', icon: '🏭' },
      ],
    },
    {
      id: 'salesGroup',
      type: 'group',
      title: 'Продажи и покупки',
      items: [
        { id: 'sales', type: 'item', title: 'Sales', route: '/sales', icon: '💰' },
        { id: 'purchases', type: 'item', title: 'Purchases', route: '/purchases', icon: '🛒' },
      ],
    },
    {
      id: 'financeGroup',
      type: 'group',
      title: 'Финансы',
      items: [
        { id: 'accounts', type: 'item', title: 'Chart of Accounts', route: '/chart-of-accounts', icon: '📋' },
        { id: 'banking', type: 'item', title: 'Banking', route: '/banking', icon: '🏦' },
      ],
    },
    { id: 'tabbook', type: 'item', title: 'TAB‑Бухгалтерия', route: '/tabbook', icon: '⚡', badge: 'NEW' },
    { id: 'cloudide', type: 'item', title: 'Cloud IDE', route: '/cloudide', icon: '☁️', badge: 'BETA' },
    { id: 'inventory-flow', type: 'item', title: 'Товарооборот', route: '/inventory-flow', icon: '🎯', badge: 'NEW' },
  ]);

  // Состояния для drag‑and‑drop
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);
  const [dragOverSection, setDragOverSection] = useState<Section | null>(null);

  // Состояние для разворачивания групп
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    warehouseGroup: true,
    salesGroup: true,
    financeGroup: true,
  });

  const handleDragStart = (e: React.DragEvent, section: Section) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, section: Section) => {
    e.preventDefault();
    setDragOverSection(section);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetSection: Section) => {
    e.preventDefault();
    if (!draggedSection || draggedSection.id === targetSection.id) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }
    const newSections = [...sections];
    const fromIndex = newSections.findIndex((s) => s.id === draggedSection.id);
    const toIndex = newSections.findIndex((s) => s.id === targetSection.id);
    newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, draggedSection);
    setSections(newSections);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <nav className="flex flex-col w-60 bg-slate-800 text-white min-h-screen">
      {/* Шапка сайдбара */}
      <div className="p-4 text-2xl font-bold border-b border-slate-700">Solar ERP</div>

      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`${
              dragOverSection?.id === section.id ? 'border-t-2 border-orange-500' : ''
            } flex flex-col`}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={(e) => handleDragOver(e, section)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section)}
          >
            <div className="flex items-center">
              {/* Маркер для перемещения */}
              <div className="p-2 cursor-grab hover:bg-slate-700">
                <GripVertical className="w-4 h-4 text-slate-400" />
              </div>

              {section.type === 'item' ? (
                <NavLink
                  to={section.route}
                  className={({ isActive }) =>
                    `flex-1 flex items-center p-3 hover:bg-slate-700 transition-colors ${
                      isActive ? 'bg-slate-700 border-r-2 border-orange-500' : ''
                    }`
                  }
                >
                  <span className="mr-2">{section.icon}</span>
                  <span>{section.title}</span>
                  {section.badge && (
                    <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                      {section.badge}
                    </span>
                  )}
                </NavLink>
              ) : (
                // Заголовок группы
                <button
                  onClick={() => toggleGroup(section.id)}
                  className="flex-1 flex items-center p-3 text-left hover:bg-slate-700 transition-colors"
                >
                  <span className="mr-2">{section.title}</span>
                  <span className="ml-auto">
                    {expandedGroups[section.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                </button>
              )}
            </div>

            {/* Подменю группы */}
            {section.type === 'group' && expandedGroups[section.id] && (
              <div className="ml-8">
                {section.items.map((item) => (
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
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Кнопка возврата к выбору компании */}
      <div className="mt-auto p-3 border-t border-slate-700">
        <button
          onClick={() => {
            localStorage.removeItem('currentCompanyId');
            localStorage.removeItem('currentCompanyName');
            window.location.href = '/account/dashboard';
          }}
          className="w-full text-left text-slate-400 hover:text-white flex items-center"
        >
          🔙 Back to Companies
        </button>
      </div>
    </nav>
  );
};

export default CompanySidebar;
