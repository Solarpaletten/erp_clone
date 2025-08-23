import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface HeaderElement {
  id: string;
  type: 'button' | 'info' | 'avatar';
  content: string | React.ReactNode;
  position: 'left' | 'center' | 'right';
  priority: number;
}

const CompanyHeader: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [balance, setBalance] = useState(0);
  
  // 🎯 HEADER ELEMENTS STATE
  const [headerElements, setHeaderElements] = useState<HeaderElement[]>([
    {
      id: 'invite',
      type: 'button',
      content: 'Invite users',
      position: 'left',
      priority: 1
    },
    {
      id: 'minimal',
      type: 'button', 
      content: 'Minimal',
      position: 'left',
      priority: 2
    },
    {
      id: 'balance',
      type: 'info',
      content: 'Balance 0.00 €',
      position: 'left',
      priority: 3
    },
    {
      id: 'partnership',
      type: 'info',
      content: 'Partnership points 0.00 €',
      position: 'left',
      priority: 4
    },
    {
      id: 'avatar',
      type: 'avatar',
      content: '',
      position: 'right',
      priority: 5
    }
  ]);

  // 🖱️ DRAG STATE
  const [draggedElement, setDraggedElement] = useState<HeaderElement | null>(null);
  const [draggedOver, setDraggedOver] = useState<'left' | 'center' | 'right' | null>(null);

  useEffect(() => {
    // Получаем данные компании
    const name = localStorage.getItem('currentCompanyName') || 'Company';
    const id = localStorage.getItem('currentCompanyId') || '0';
    
    setCompanyName(name);
    setCompanyId(id);
    
    // 💾 Загружаем сохранённые позиции элементов
    const savedElements = localStorage.getItem('headerElementsPositions');
    if (savedElements) {
      try {
        const parsed = JSON.parse(savedElements);
        setHeaderElements(parsed);
      } catch (error) {
        console.error('Error loading header positions:', error);
      }
    }
    
    console.log('🏢 CompanyHeader with draggable elements loaded:', { name, id });
  }, []);

  // 💾 СОХРАНЕНИЕ ПОЗИЦИЙ
  const saveElementPositions = (elements: HeaderElement[]) => {
    setHeaderElements(elements);
    localStorage.setItem('headerElementsPositions', JSON.stringify(elements));
  };

  // 🖱️ DRAG HANDLERS
  const handleElementDragStart = (e: React.DragEvent, element: HeaderElement) => {
    setDraggedElement(element);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleElementDragEnd = () => {
    setDraggedElement(null);
    setDraggedOver(null);
  };

  const handleZoneDragOver = (e: React.DragEvent, zone: 'left' | 'center' | 'right') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(zone);
  };

  const handleZoneDragLeave = () => {
    setDraggedOver(null);
  };

  const handleZoneDrop = (e: React.DragEvent, zone: 'left' | 'center' | 'right') => {
    e.preventDefault();
    
    if (draggedElement && draggedElement.position !== zone) {
      const updatedElements = headerElements.map(el => 
        el.id === draggedElement.id 
          ? { ...el, position: zone }
          : el
      );
      saveElementPositions(updatedElements);
    }
    
    setDraggedOver(null);
  };

  // 🎨 RENDER DRAGGABLE ELEMENT N
  const renderDraggableElement = (element: HeaderElement) => {
    if (element.type === 'avatar') {
      return (
        <div 
          key={element.id}
          className="flex items-center space-x-2 cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={(e) => handleElementDragStart(e, element)}
          onDragEnd={handleElementDragEnd}
        >
          <GripVertical className="w-3 h-3 text-white opacity-50 hover:opacity-100" />
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium">{companyName}</div>
              <div className="text-xs opacity-75">Company ID: {companyId}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-[#f7931e] font-bold">
                {companyName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (element.type === 'button') {
      return (
        <div 
          key={element.id}
          className="flex items-center space-x-2 cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={(e) => handleElementDragStart(e, element)}
          onDragEnd={handleElementDragEnd}
        >
          <GripVertical className="w-3 h-3 text-white opacity-50 hover:opacity-100" />
          <button className={`
            py-1.5 px-3 rounded transition-colors
            ${element.id === 'invite' 
              ? 'bg-[#ff6900] hover:bg-[#e05e00]' 
              : 'bg-transparent hover:bg-opacity-10 hover:bg-white'
            }
          `}>
            {element.content}
          </button>
        </div>
      );
    }

    if (element.type === 'info') {
      return (
        <div 
          key={element.id}
          className="flex items-center space-x-2 cursor-grab active:cursor-grabbing"
          draggable
          onDragStart={(e) => handleElementDragStart(e, element)}
          onDragEnd={handleElementDragEnd}
        >
          <GripVertical className="w-3 h-3 text-white opacity-50 hover:opacity-100" />
          <div className="text-sm">
            {element.id === 'balance' ? `Balance ${balance.toFixed(2)} €` : element.content}
          </div>
        </div>
      );
    }

    return null;
  };

  // 📍 ГРУППИРОВКА ЭЛЕМЕНТОВ ПО ЗОНАМ
  const leftElements = headerElements.filter(el => el.position === 'left');
  const centerElements = headerElements.filter(el => el.position === 'center');
  const rightElements = headerElements.filter(el => el.position === 'right');

  // 🎨 DROP ZONE STYLES
  const getDropZoneStyles = (zone: 'left' | 'center' | 'right') => {
    const baseStyles = "flex-1 min-h-[60px] flex items-center gap-4 transition-colors duration-200 px-2";
    const dragOverStyles = draggedOver === zone ? "bg-white bg-opacity-10 border-2 border-white border-dashed rounded" : "";
    const justifyStyles = zone === 'center' ? 'justify-center' : zone === 'right' ? 'justify-end' : 'justify-start';
    return `${baseStyles} ${dragOverStyles} ${justifyStyles}`;
  };

  return (
    <header className="flex items-center h-15 px-4 bg-[#f7931e] text-white">
      {/* LEFT ZONE */}
      <div 
        className={getDropZoneStyles('left')}
        onDragOver={(e) => handleZoneDragOver(e, 'left')}
        onDragLeave={handleZoneDragLeave}
        onDrop={(e) => handleZoneDrop(e, 'left')}
      >
        {leftElements.map(renderDraggableElement)}
      </div>

      {/* CENTER ZONE */}
      <div 
        className={getDropZoneStyles('center')}
        onDragOver={(e) => handleZoneDragOver(e, 'center')}
        onDragLeave={handleZoneDragLeave}
        onDrop={(e) => handleZoneDrop(e, 'center')}
      >
        {centerElements.map(renderDraggableElement)}
      </div>

      {/* RIGHT ZONE */}
      <div 
        className={getDropZoneStyles('right')}
        onDragOver={(e) => handleZoneDragOver(e, 'right')}
        onDragLeave={handleZoneDragLeave}
        onDrop={(e) => handleZoneDrop(e, 'right')}
      >
        {rightElements.map(renderDraggableElement)}
      </div>
    </header>
  );
};

export default CompanyHeader;
