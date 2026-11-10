import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header/Header';
import Overview from './pages/Overview/Overview';
import Performance from './pages/Performance/Performance';
import Monitoring from './pages/Monitoring/Monitoring';
import Optimization from './pages/Optimization/Optimization';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/optimization" element={<Optimization />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
