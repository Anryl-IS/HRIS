import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SystemConfigModal from './components/SystemConfigModal';

// Import Pages
import OnboardingVault from './components/OnboardingVault';
import ERCaseManagement from './components/ERCaseManagement';
import SFOperations from './components/SFOperations';
import LDTracker from './components/LDTracker';
import EmployeeDirectory from './components/EmployeeDirectory';
import StaffRoster from './components/StaffRoster';

import logo from './assets/logo.png';

function App() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [sbStatus, setSbStatus] = useState('Connecting...');
  const [isConfigOpen, setConfigOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Initial theme setup on bootstrap
    const savedTheme = localStorage.getItem('hris-theme');
    if (savedTheme === 'light') { document.body.classList.add('light-theme'); }

    // Check current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setSession(session);
      setInitializing(false);
      if (error || !import.meta.env.VITE_SUPABASE_URL) {
        setSbStatus('DB Offline (Check .env)');
      } else {
        setSbStatus('Supabase Active');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return { title: 'HRMD God-View Dashboard', sub: 'Executive Oversight & Organizational Risk Analytics' };
      case '/onboarding': return { title: 'Onboarding Vault', sub: 'Automated 201 File & Compliance Repository' };
      case '/er-cases': return { title: 'ER Case Management', sub: 'Disciplinary & Grievance Logs' };
      case '/sf-ops': return { title: 'Salesforce (IR) Tracking', sub: 'SOP Breaches & Branch Operations' };
      case '/ld-tracker': return { title: 'L&D Tracker', sub: 'Performance Assessments & Training Cadences' };
      case '/directory': return { title: 'Employee Directory', sub: 'Corporate Workforce Table' };
      case '/staff-roster': return { title: 'Staff & Tellers', sub: 'Departmental & Company Divisions' };
      default: return { title: 'SGC Hris System', sub: '' };
    }
  };

  const { title, sub } = getPageTitle();

  if (initializing) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', color: 'var(--text-secondary)'
      }}>
        Initializing...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <SystemConfigModal isOpen={isConfigOpen} onClose={() => setConfigOpen(false)} />
      <Sidebar onOpenConfig={() => setConfigOpen(true)} />
      <main className="main-content">
        <header className="animate-fade-in" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)'
        }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2rem' }}>{title}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{sub}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '24px', fontSize: '0.9rem', color: sbStatus === 'Supabase Active' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              <span style={{ marginRight: '8px', display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor', boxShadow: '0 0 8px currentColor' }}></span>
              {sbStatus}
            </div>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              border: '1.5px solid var(--glass-border)', boxShadow: '0 0 20px rgba(0,0,0,0.4)'
            }}>
              <img src={logo} alt="Brand" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </header>

        <div style={{ flex: 1, paddingBottom: '32px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/onboarding" element={<OnboardingVault />} />
            <Route path="/er-cases" element={<ERCaseManagement />} />
            <Route path="/sf-ops" element={<SFOperations />} />
            <Route path="/ld-tracker" element={<LDTracker />} />
            <Route path="/directory" element={<EmployeeDirectory />} />
            <Route path="/staff-roster" element={<StaffRoster />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
