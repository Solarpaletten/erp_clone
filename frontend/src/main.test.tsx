import React from 'react'
import ReactDOM from 'react-dom/client'
import TestRouter from './TestRouter'
import './index.css'

console.log('🧪 Test main.tsx запущен');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestRouter />
  </React.StrictMode>,
)
