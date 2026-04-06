import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Queue from './pages/Queue';
import Alerts from './pages/Alerts';
import CaseDetail from './pages/CaseDetail';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
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

  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isSignup = location.pathname === '/signup';
  const isAuthPage = isLogin || isSignup;
  const isAuthenticated = !!localStorage.getItem('courtclock_token');

  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

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
            <Route path="/search" element={<div className="p-8 text-slate-500">Case Search (Coming Soon)</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
