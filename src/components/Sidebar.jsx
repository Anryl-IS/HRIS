import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, ClipboardList, ShieldAlert, GraduationCap, Settings, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';

const Sidebar = ({ onOpenConfig }) => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "HRMD God-View", path: "/" },
    { icon: <UserPlus size={20} />, label: "Onboarding Vault", path: "/onboarding" },
    { icon: <ShieldAlert size={20} />, label: "ER Case Management", path: "/er-cases" },
    { icon: <ClipboardList size={20} />, label: "SF Operations (IR)", path: "/sf-ops" },
    { icon: <GraduationCap size={20} />, label: "L&D Tracker", path: "/ld-tracker" },
    { icon: <Users size={20} />, label: "Employee Directory", path: "/directory" },
  ];

  return (
    <aside className="glass-panel" style={{
      width: '260px', height: 'calc(100vh - 40px)', position: 'fixed', left: '20px', top: '20px',
      display: 'flex', flexDirection: 'column', padding: '24px 0', zIndex: 100
    }}>
      <div style={{ padding: '0 24px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)'
        }}>
          <img src={logo} alt="SGC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: '#fff', letterSpacing: '1px', margin: 0 }}>SGC</h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>HRMS</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', paddingLeft: '8px', fontWeight: '600' }}>
          Modules
        </div>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
              padding: '12px 16px', borderRadius: '12px', textAlign: 'left', transition: 'all 0.2s',
              background: isActive ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
              color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: isActive ? '1px solid rgba(88, 166, 255, 0.2)' : '1px solid transparent',
              fontWeight: isActive ? '600' : '400',
              textDecoration: 'none'
            })}
          >
            {item.icon}
            <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0 16px', marginTop: 'auto' }}>
        <button
          onClick={onOpenConfig}
          style={{
            display: 'flex', width: '100%', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px', background: 'transparent',
            color: 'var(--text-secondary)', border: 'none', cursor: 'pointer'
          }}
        >
          <Settings size={20} />
          <span>System Config</span>
        </button>

        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            display: 'flex', width: '100%', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px', background: 'transparent',
            color: 'var(--accent-red)', border: 'none', cursor: 'pointer', marginTop: '4px'
          }}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>

        <div style={{ padding: '24px 16px 0', borderTop: '1px solid var(--glass-border)', marginTop: '16px' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'center' }}>
            Designed and Developed By:<br />
            <strong>Edwin Angelo Catequista</strong><br />
            <span style={{ opacity: 0.7 }}>Powered By : SMNR IT Group @ SGC Corporation</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
