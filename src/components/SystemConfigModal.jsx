import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Database, Shield, LogOut, Type, Monitor } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SystemConfigModal = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState(localStorage.getItem('hris-theme') || 'dark');
  const [fontSize, setFontSize] = useState(localStorage.getItem('hris-font-size') || 'medium');
  const [sbStatus, setSbStatus] = useState('Checking...');

  useEffect(() => {
    // Theme application
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('hris-theme', theme);

    // Font size application
    const root = document.documentElement;
    if (fontSize === 'large') {
      root.style.fontSize = '18px';
    } else if (fontSize === 'small') {
      root.style.fontSize = '14px';
    } else {
      root.style.fontSize = '16px';
    }
    localStorage.setItem('hris-font-size', fontSize);
  }, [theme, fontSize]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Check DB Status when modal opens
      supabase.auth.getSession().then(({ error }) => {
        setSbStatus(error ? 'Error Connecting' : 'Supabase Active');
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(12px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '600px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', gap: '32px', padding: '40px',
        overflowY: 'auto', position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, fontSize: '1.5rem' }}>
              <Settings size={28} className="text-gradient" />
              Engine Configuration
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
              Terminal & Interface parameters for the God-View suite.
            </p>
          </div>
          <button onClick={onClose} style={{ 
            background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: 'var(--text-secondary)', 
            width: '36px', height: '36px', borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }} >
            <X size={20} />
          </button>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Theme Selector */}
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Monitor size={16} /> Appearance Matrix
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div 
                onClick={() => setTheme('dark')}
                style={{
                  padding: '24px 16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                  border: theme === 'dark' ? '2px solid var(--accent-blue)' : '2px solid var(--glass-border)',
                  background: theme === 'dark' ? 'rgba(88, 166, 255, 0.1)' : 'var(--bg-tertiary)',
                  color: theme === 'dark' ? 'var(--accent-blue)' : 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Moon size={32} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Cyber Dark</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>Default Ops Mode</div>
              </div>

              <div 
                onClick={() => setTheme('light')}
                style={{
                  padding: '24px 16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
                  border: theme === 'light' ? '2px solid var(--accent-blue)' : '2px solid var(--glass-border)',
                  background: theme === 'light' ? 'rgba(88, 166, 255, 0.10)' : '#f6f8fa',
                  color: theme === 'light' ? 'var(--accent-blue)' : '#1f2328',
                  transition: 'all 0.3s ease'
                }}
              >
                <Sun size={32} style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Clean Light</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>High Contrast</div>
              </div>
            </div>
          </div>

          {/* Typography Selector */}
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Type size={16} /> Typography Scale
            </h3>
            <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-primary)', padding: '6px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', textTransform: 'capitalize', fontWeight: '600',
                    background: fontSize === size ? 'var(--accent-blue)' : 'transparent',
                    color: fontSize === size ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    fontSize: size === 'small' ? '0.8rem' : size === 'large' ? '1rem' : '0.9rem'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* System Telemetry */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
             <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} /> Backend Connectivity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(88, 166, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={20} color="var(--accent-blue)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Supabase Cluster</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Region: ap-southeast-1</div>
                  </div>
                </div>
                <div style={{ 
                  padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                  background: sbStatus.includes('Active') ? 'rgba(63, 185, 80, 0.1)' : 'rgba(255, 123, 114, 0.1)',
                  color: sbStatus.includes('Active') ? 'var(--accent-green)' : 'var(--accent-red)',
                  border: `1px solid ${sbStatus.includes('Active') ? 'rgba(63, 185, 80, 0.2)' : 'rgba(255, 123, 114, 0.2)'}`
                }}>
                  {sbStatus}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px',
              borderRadius: '12px', background: 'rgba(255, 123, 114, 0.1)', color: 'var(--accent-red)',
              fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 123, 114, 0.1)'; e.currentTarget.style.color = 'var(--accent-red)'; }}
          >
            <LogOut size={18} /> Seal Session & Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigModal;

function Settings(props) { return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>; }

