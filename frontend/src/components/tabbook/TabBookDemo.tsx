// TabBook MVP - Революционная TAB-Бухгалтерия
import React, { useState, useEffect } from 'react';
import { Copy, Save } from 'lucide-react';

const TabBookDemo = () => {
  const [operations, setOperations] = useState([]);
  const [companyName, setCompanyName] = useState('');
  
  useEffect(() => {
    setCompanyName(localStorage.getItem('currentCompanyName') || 'Demo Company');
  }, []);

  const createSampleOperation = (type) => {
    const operation = {
      id: Date.now(),
      type,
      date: new Date().toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 1000) + 100,
      description: `${type} operation`
    };
    setOperations(prev => [operation, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔥 TabBook MVP - {companyName}
          </h1>
          <p className="text-xl text-gray-600">
            "TAB-Бухгалтерия" - 1 ДЕЙСТВИЕ = 90% РАБОТЫ
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => createSampleOperation('purchase')}
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600"
          >
            📦 Создать приход
          </button>
          <button
            onClick={() => createSampleOperation('sale')}
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600"
          >
            💰 Создать продажу
          </button>
          <button
            onClick={() => createSampleOperation('payment')}
            className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600"
          >
            🏦 Создать платёж
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Операции</h2>
          {operations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Создайте первую операцию
            </p>
          ) : (
            <div className="space-y-2">
              {operations.map(op => (
                <div key={op.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span>{op.description}</span>
                    <span className="font-semibold">{op.amount} €</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabBookDemo;
