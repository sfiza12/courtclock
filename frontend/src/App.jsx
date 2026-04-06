import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Queue from './pages/Queue';
import Alerts from './pages/Alerts';
import CaseDetail from './pages/CaseDetail';
import Analytics from './pages/Analytics';
import Search from './pages/Search';
import { fetchAlerts } from './api/api';

function App() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    // In a real app we'd fetch this periodically or use WebSocket
    const loadAlertCount = async () => {
      const data = await fetchAlerts();
      if (data && data.cases) {
        setAlertCount(data.cases.length);
      }
    };
    loadAlertCount();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F5F9]">
      <Sidebar alertCount={alertCount} />
      <main className="flex-1 overflow-y-auto px-8 py-7">
        <div className="max-w-6xl mx-auto h-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/case/:id" element={<CaseDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
