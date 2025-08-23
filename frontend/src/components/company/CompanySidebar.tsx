import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import SidebarGroup, { SidebarGroupItem } from './SidebarGroup';
import { GripVertical } from 'lucide-react';

/**
 * Боковое меню компании: закреплённые пункты с drag‑and‑drop
 * и сгруппированные разделы (Склад, Продажи/Покупки, Финансы).
 */
const CompanySidebar: React.FC = () => {
  // Закреплённые пункты, которые пользователь видит сразу.
  const [pinnedItems, setPinnedItems] = useState<SidebarGroupItem[]>([
    { id: 'dashboard', title: 'Dashboard', route: '/dashboard', icon: '📊' },
    { id: 'clients', title: 'Clients', route: '/clients', icon: '👥' },
    { id: 'dashka', title: 'Dashka', route: '/dashka', icon: '🎯', badge: 'HOT' },
    { id: 'tabbook', title: 'TAB‑Бухгалтерия', route: '/tabbook', icon: '⚡', badge: 'NEW' },
    { id: 'cloudide', title: 'Cloud IDE', route: '/cloudide', icon: '☁️', badge: 'BETA' },
    { id: 'inventory-flow', title: 'Товарооборот', route: '/inventory-flow', icon: '🎯', badge: 'NEW' },
  ]);

  // Состояние для drag‑and‑drop
  const [draggedItem, setDraggedItem] = useState<SidebarGroupItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<SidebarGroupItem | null>(null);

  const handleDragStart = (e: React.DragEvent, item: SidebarGroupItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, item: SidebarGroupItem) => {
    e.preventDefault();
    setDragOverItem(item);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetItem: SidebarGroupItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }
    const newItems = [...pinnedItems];
    const draggedIndex = newItems.findIndex((it) => it.id === draggedItem.id);
    const targetIndex = newItems.findIndex((it) => it.id === targetItem.id);
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    setPinnedItems(newItems);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Группы, объединяющие родственные разделы
  const groups = [
    {
      title: 'Склад',
      items: [
        { id: 'products', title: 'Products', route: '/products', icon: '📦' },
        { id: 'warehouse', title: 'Warehouse', route: '/warehouse', icon: '🏭' },
      ],
    },
    {
      title: 'Продажи и покупки',
      items: [
        { id: 'sales', title: 'Sales', route: '/sales', icon: '💰' },
        { id: 'purchases', title: 'Purchases', route: '/purchases', icon: '🛒' },
      ],
    },
    {
      title: 'Финансы',
      items: [
        { id: 'accounts', title: 'Chart of Accounts', route: '/chart-of-accounts', icon: '📋' },
        { id: 'banking', title: 'Banking', route: '/banking', icon: '🏦' },
      ],
    },
  ];

  return (
    <nav className="flex flex-col w-60 bg-slate-800 text-white min-h-screen">
      {/* Логотип/название */}
      <div className="p-4 text-2xl font-bold border-b border-slate-700">Solar ERP</div>

      {/* Закреплённые пункты с drag‑and‑drop */}
      <div className="flex-1 overflow-y-auto">
        {pinnedItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center ${
              dragOverItem?.id === item.id ? 'border-t-2 border-orange-500' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, item)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item)}
          >
            <div className="p-2 cursor-grab hover:bg-slate-700">
              <GripVertical className="w-4 h-4 text-slate-400" />
            </div>
            <NavLink
              to={item.route}
              className={({ isActive }) =>
                `flex-1 flex items-center p-3 hover:bg-slate-700 transition-colors ${
                  isActive ? 'bg-slate-700 border-r-2 border-orange-500' : ''
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </div>
        ))}

        {/* Группы меню */}
        <div className="mt-4">
          {groups.map((group) => (
            <SidebarGroup key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      </div>

      {/* Нижняя часть – возврат к выбору компании */}
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
