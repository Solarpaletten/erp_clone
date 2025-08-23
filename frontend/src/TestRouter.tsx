import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Простые тестовые компоненты
const TestDashboard = () => <div style={{padding: '20px', background: '#f0f0f0'}}>
  <h1>🏠 Test Dashboard</h1>
  <p>Если видишь это - routing работает!</p>
</div>;

const TestProducts = () => <div style={{padding: '20px', background: '#e0ffe0'}}>
  <h1>📦 Test Products</h1>
  <p>Products page загрузилась!</p>
</div>;

const TestSales = () => <div style={{padding: '20px', background: '#ffe0e0'}}>
  <h1>💰 Test Sales</h1>
  <p>Sales page работает!</p>
</div>;

const TestPurchases = () => <div style={{padding: '20px', background: '#e0e0ff'}}>
  <h1>🛒 Test Purchases</h1>
  <p>Purchases page загрузилась!</p>
</div>;

const TestNavigation = () => (
  <div style={{padding: '10px', background: '#333', color: 'white'}}>
    <a href="/dashboard" style={{color: 'white', margin: '0 10px'}}>Dashboard</a>
    <a href="/products" style={{color: 'white', margin: '0 10px'}}>Products</a>
    <a href="/sales" style={{color: 'white', margin: '0 10px'}}>Sales</a>
    <a href="/purchases" style={{color: 'white', margin: '0 10px'}}>Purchases</a>
  </div>
);

const TestRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <TestNavigation />
      <Routes>
        <Route path="/dashboard" element={<TestDashboard />} />
        <Route path="/products" element={<TestProducts />} />
        <Route path="/sales" element={<TestSales />} />
        <Route path="/purchases" element={<TestPurchases />} />
        <Route path="/" element={<TestDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default TestRouter;
