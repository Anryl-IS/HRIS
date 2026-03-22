import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Monitor } from 'lucide-react';

const SystemConfigModal = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState(localStorage.getItem('hris-theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('hris-theme', theme);
  }, [theme]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '500px', padding: '32px',
        display: 'flex', flexDirection: 'column', gap: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <Monitor size={24} color="var(--accent-purple)" />
            System Configuration
          </h2>
          <button onClick={onClose} style={{ 
            background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: 'var(--text-secondary)', 
            width: '32px', height: '32px', borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} >
            <X size={20} />
          </button>
        </div>

        <div>
           <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Appearance</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             
             {/* Dark Mode Toggle */}
             <div 
               onClick={() => setTheme('dark')}
               style={{
                 padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                 border: theme === 'dark' ? '2px solid var(--accent-blue)' : '2px solid var(--glass-border)',
                 background: theme === 'dark' ? 'rgba(88, 166, 255, 0.1)' : 'var(--bg-tertiary)',
                 color: theme === 'dark' ? 'var(--accent-blue)' : 'var(--text-primary)',
                 transition: 'all 0.2s'
               }}
             >
               <Moon size={32} style={{ margin: '0 auto 12px' }} />
               <div style={{ fontWeight: 'bold' }}>Dark Mode</div>
             </div>

             {/* Light Mode Toggle */}
             <div 
               onClick={() => setTheme('light')}
               style={{
                 padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                 border: theme === 'light' ? '2px solid var(--accent-blue)' : '2px solid var(--glass-border)',
                 background: theme === 'light' ? 'rgba(88, 166, 255, 0.1)' : '#f0f2f5',
                 color: theme === 'light' ? 'var(--accent-blue)' : '#1f2328',
                 transition: 'all 0.2s'
               }}
             >
               <Sun size={32} style={{ margin: '0 auto 12px' }} />
               <div style={{ fontWeight: 'bold' }}>Light Mode</div>
             </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default SystemConfigModal;
