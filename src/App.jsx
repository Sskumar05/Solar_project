import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Overview from './pages/Overview/Overview';
import Performance from './pages/Performance/Performance';
import Monitoring from './pages/Monitoring/Monitoring';
import Optimization from './pages/Optimization/Optimization';
import Settings from './pages/Settings/Settings';

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Page: {title}</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/optimization" element={<Optimization />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
