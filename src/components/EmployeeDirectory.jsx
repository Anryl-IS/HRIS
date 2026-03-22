import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Filter, Eye, X, Mail, Phone, MapPin, Briefcase, UserRound, Activity, Edit2, Search, Trash2, Save, UserPlus, ShieldAlert, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Modal States
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // Status Editing Toggle
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // Full Profile CRUD States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*').limit(500);
    if (!error && data) {
      setEmployees(data);
    }
    setLoading(false);
  };

  // Lock body scroll when modals are open
  useEffect(() => {
    if (selectedFileUrl || selectedProfile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedFileUrl, selectedProfile]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle deep-linking from Onboarding Vault
  useEffect(() => {
    if (!loading && employees.length > 0 && location.state?.openEmployeeId) {
      const target = employees.find(e => e.id === location.state.openEmployeeId);
      if (target) {
        openProfile(target);
      }
    }
  }, [loading, employees, location.state]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Applicant / Pre-Hire Stage': return { bg: 'rgba(255, 165, 0, 0.15)', color: '#FFB84D' };
      case 'Regular / Permanent Status': return { bg: 'rgba(63, 185, 80, 0.15)', color: 'var(--accent-green)' };
      case 'Project-Based / Contractual': return { bg: 'rgba(163, 113, 247, 0.15)', color: 'var(--accent-purple)' };
      case 'Suspended / On-Leave Status': return { bg: 'rgba(255, 123, 114, 0.15)', color: 'var(--accent-red)' };
      case 'Separated / Offboarded': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };
      case 'Probationary Status':
      default: return { bg: 'rgba(88, 166, 255, 0.15)', color: 'var(--accent-blue)' };
    }
  };

  // 1. UPDATE: Inline Status Handle
  const handleStatusChange = async (newStatus) => {
    const updatedProfile = { ...selectedProfile, employment_status: newStatus };
    setSelectedProfile(updatedProfile);
    setIsEditingStatus(false);
    
    await supabase.from('employees').update({ employment_status: newStatus }).eq('id', selectedProfile.id);
    fetchEmployees();
  };

  // 2. UPDATE: Save Full Edited Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('employees')
      .update(editForm)
      .eq('id', selectedProfile.id);

    if (!error) {
       setSelectedProfile(editForm);
       setIsEditingProfile(false);
       fetchEmployees();
    } else {
       console.error("Failed Update:", error);
       alert("Failed to update profile constraints.");
    }
    setLoading(false);
  };

  // 3. DELETE: Remove Employee Completely
  const handleDeleteEmployee = async (id, nameStr) => {
    if (window.confirm(`CRITICAL WARNING: Are you strictly sure you want to permanently delete the 201 File and Database Record for ${nameStr}? This action cannot be undone.`)) {
       setLoading(true);
       const { error } = await supabase.from('employees').delete().eq('id', id);
       if (!error) {
         setSelectedProfile(null);
         fetchEmployees();
       } else {
         alert("Could not delete record. Database dependency conflict might exist.");
       }
       setLoading(false);
    }
  };

  const fileRequirements = [
    'Full name', 'Date of birth', 'Address', 'Contact information',
    'SSS number', 'BIR number', 'Tax Identification number (TIN)', 
    'PhilHealth number', 'Pag-IBIG Home Development Mutual Fund (HDMF) number',
    'Education transcripts or diplomas', 'Performance assessments', 'Clearances', 
    'Corrective actions', 'Work history', 'Post-employment information', 'Hiring requirements'
  ];

  const toggleChecklistItem = async (item) => {
     let currentList = selectedProfile.file_201_checklist || [];
     let updatedList;
     
     if (currentList.includes(item)) {
        updatedList = currentList.filter(i => i !== item);
     } else {
        updatedList = [...currentList, item];
     }
     
     const updatedProfile = { ...selectedProfile, file_201_checklist: updatedList };
     setSelectedProfile(updatedProfile);
     
     await supabase.from('employees')
        .update({ file_201_checklist: updatedList })
        .eq('id', selectedProfile.id);
     
     fetchEmployees();
  };

  const setAllChecklistItems = async (isMarkAll) => {
    const newList = isMarkAll ? fileRequirements : [];
    const updatedProfile = { ...selectedProfile, file_201_checklist: newList };
    setSelectedProfile(updatedProfile);
    
    await supabase.from('employees')
       .update({ file_201_checklist: newList })
       .eq('id', selectedProfile.id);
    
    fetchEmployees();
  };

  // Open the Profile Modal & Seed Form Data
  const openProfile = (emp) => {
    setSelectedProfile(emp);
    setEditForm(emp);
    setIsEditingProfile(false);
  };

  // Derived Filtered List
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      (emp.name_english?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (emp.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (emp.department?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
    const currentStatus = emp.employment_status || 'Probationary Status';
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* 201 File Viewer Modal */}
      {selectedFileUrl && (
        <div 
          onClick={() => setSelectedFileUrl(null)} 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' 
          }}>
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="glass-panel animate-fade-in"
            style={{ width: '100%', maxWidth: '1200px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
              <h3 style={{ margin: 0 }}>201 Form Viewer</h3>
              <button 
                onClick={() => setSelectedFileUrl(null)} 
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden' }}>
               <iframe src={selectedFileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="201 File Viewer"/>
            </div>
          </div>
        </div>
      )}

      {/* Employee Profile Preview / Edit CRUD Modal */}
      {selectedProfile && (
        <div 
          onClick={() => { setSelectedProfile(null); setIsEditingStatus(false); setIsEditingProfile(false); }}
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', 
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: '24px'
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel animate-fade-in" 
            style={{ 
              width: '100%', maxWidth: '1100px', maxHeight: '100%', 
              overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0, 
              position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
            }}>
            <div style={{ height: '140px', background: 'var(--accent-gradient)', position: 'relative', flexShrink: 0, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <div style={{ position: 'absolute', top: '16px', right: '64px' }}>
                <button onClick={() => setShowChecklistDropdown(!showChecklistDropdown)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <ShieldAlert size={14} color={(selectedProfile.file_201_checklist?.length || 0) === 16 ? 'var(--accent-green)' : 'var(--accent-red)'}/>
                  201 File Requirements
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{(selectedProfile.file_201_checklist?.length || 0)}/16</span>
                </button>

                {showChecklistDropdown && (
                  <div onClick={e => e.stopPropagation()} className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '380px', maxHeight: '420px', overflowY: 'auto', zIndex: 99999, padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                       <h3 style={{ margin: 0, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                          <ShieldAlert size={16} /> 201 File Checklist
                       </h3>
                       <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={(e) => { e.stopPropagation(); setAllChecklistItems(true); }} style={{ background: 'rgba(63, 185, 80, 0.1)', border: 'none', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><CheckCircle size={10} /> All</button>
                          <button onClick={(e) => { e.stopPropagation(); setAllChecklistItems(false); }} style={{ background: 'rgba(255, 123, 114, 0.1)', border: 'none', color: 'var(--accent-red)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><X size={10} /> Clear</button>
                       </div>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
                       <div style={{ width: `${((selectedProfile.file_201_checklist?.length || 0) / 16) * 100}%`, height: '100%', background: (selectedProfile.file_201_checklist?.length || 0) === 16 ? 'var(--accent-green)' : 'var(--accent-blue)', transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       {fileRequirements.map((item, idx) => {
                          const isCompliant = selectedProfile.file_201_checklist?.includes(item);
                          return (
                             <div key={idx} onClick={(e) => { e.stopPropagation(); toggleChecklistItem(item); }} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: isCompliant ? 'rgba(63, 185, 80, 0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', border: isCompliant ? '1px solid rgba(63, 185, 80, 0.2)' : '1px solid var(--glass-border)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                                <div style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px', borderRadius: '4px', border: `2px solid ${isCompliant ? 'var(--accent-green)' : 'var(--glass-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCompliant ? 'var(--accent-green)' : 'transparent' }}>
                                   {isCompliant && <CheckCircle size={12} color="#fff" />}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: isCompliant ? '#fff' : 'var(--text-secondary)', fontWeight: isCompliant ? 'bold' : 'normal', lineHeight: '1.4' }}>{item}</span>
                             </div>
                          );
                       })}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => { setSelectedProfile(null); setIsEditingStatus(false); setIsEditingProfile(false); setShowChecklistDropdown(false); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>

              <div style={{ position: 'absolute', top: '24px', left: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 {!isEditingStatus ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>
                     <Activity size={16} color={getStatusStyle(selectedProfile.employment_status || 'Probationary Status').color} /> 
                     {selectedProfile.employment_status || 'Probationary Status'}
                     {!isEditingProfile && (
                       <button onClick={() => setIsEditingStatus(true)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', marginLeft: '4px', paddingTop: '4px' }}>
                         <Edit2 size={14} />
                       </button>
                     )}
                   </div>
                 ) : (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                     <select 
                       value={selectedProfile.employment_status || 'Probationary Status'} 
                       onChange={(e) => handleStatusChange(e.target.value)}
                       style={{ background: 'transparent', border: 'none', color: '#fff', padding: '6px', fontSize: '0.85rem', fontWeight: 'bold', outline: 'none' }}
                     >
                       <option style={{ color: '#000' }} value="Applicant / Pre-Hire Stage">Applicant / Pre-Hire</option>
                       <option style={{ color: '#000' }} value="Probationary Status">Probationary Status</option>
                       <option style={{ color: '#000' }} value="Regular / Permanent Status">Regular / Permanent</option>
                       <option style={{ color: '#000' }} value="Project-Based / Contractual">Project-Based / Contractual</option>
                       <option style={{ color: '#000' }} value="Suspended / On-Leave Status">Suspended / On-Leave</option>
                       <option style={{ color: '#000' }} value="Separated / Offboarded">Separated / Offboarded</option>
                     </select>
                     <button onClick={() => setIsEditingStatus(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}>
                       <X size={14} />
                     </button>
                   </div>
                 )}
              </div>
            </div>
            
            <div style={{ padding: '0 32px 32px', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                 <div style={{ width: '130px', height: '130px', marginTop: '-65px', borderRadius: '50%', border: '6px solid var(--bg-secondary)', background: 'var(--bg-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                   {selectedProfile.photo_url ? (
                     <img src={selectedProfile.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     <UserRound size={64} color="var(--text-secondary)" />
                   )}
                 </div>
                 
                 {/* Action Buttons: Edit / Delete */}
                 <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {!isEditingProfile ? (
                      <>
                        <button onClick={() => setIsEditingProfile(true)} style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          <Edit2 size={16} /> Edit Record
                        </button>
                        <button onClick={() => handleDeleteEmployee(selectedProfile.id, selectedProfile.name_english)} style={{ background: 'rgba(255, 123, 114, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(255, 123, 114, 0.3)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setIsEditingProfile(false); setEditForm(selectedProfile); }} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                        Cancel Formatting
                      </button>
                    )}
                 </div>
              </div>

              {/* Edit Mode Content vs View Mode Content */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <div style={{ display: 'flex', gap: '16px' }}>
                     <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Legal Name</label>
                       <input required value={editForm.name_english || ''} onChange={(e) => setEditForm({...editForm, name_english: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                     </div>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Photograph ID URL</label>
                       <input value={editForm.photo_url || ''} onChange={(e) => setEditForm({...editForm, photo_url: e.target.value})} placeholder="https://..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                     </div>
                   </div>

                   <div style={{ display: 'flex', gap: '16px' }}>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department</label>
                       <input value={editForm.department || ''} onChange={(e) => setEditForm({...editForm, department: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                     </div>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Position Wrapper</label>
                       <input value={editForm.position || ''} onChange={(e) => setEditForm({...editForm, position: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                     </div>
                   </div>

                   <div style={{ display: 'flex', gap: '16px' }}>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Allocation</label>
                       <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                     </div>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mobile Dispatch</label>
                       <input value={editForm.mobile || ''} onChange={(e) => setEditForm({...editForm, mobile: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                     </div>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                     <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Registered Residence</label>
                     <input value={editForm.residence_address || ''} onChange={(e) => setEditForm({...editForm, residence_address: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                   </div>

                   <div style={{ display: 'flex', gap: '16px' }}>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
                       <input type="date" value={editForm.dob || ''} onChange={(e) => setEditForm({...editForm, dob: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                     </div>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gender Assignment</label>
                       <select value={editForm.sex || ''} onChange={(e) => setEditForm({...editForm, sex: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }}>
                          <option></option><option>Male</option><option>Female</option>
                       </select>
                     </div>
                     <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Blood Indexing</label>
                       <input value={editForm.blood_type || ''} onChange={(e) => setEditForm({...editForm, blood_type: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                     </div>
                   </div>

                   <button type="submit" disabled={loading} style={{ background: 'var(--accent-green)', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Save size={18} /> {loading ? 'Committing...' : 'Commit Database Changes'}
                   </button>
                </form>
              ) : (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedProfile.name_english}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                      <Briefcase size={16} /> {selectedProfile.position || 'No Position mapped'} &bull; {selectedProfile.department || 'Corporate Tier'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} color="var(--accent-purple)"/></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Allocation</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.email || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={16} color="var(--accent-green)"/></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mobile Dispatch</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.mobile || 'N/A'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: 'span 2' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="var(--accent-red)"/></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registered Residence</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.residence_address || 'Address missing in vault.'} {selectedProfile.residence_postal}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', padding: '16px 0', borderTop: '1px solid var(--glass-border)' }}>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Blood Indexing</div>
                       <div style={{ fontWeight: 'bold' }}>{selectedProfile.blood_type || '-'}</div>
                     </div>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gender Assignment</div>
                       <div style={{ fontWeight: 'bold' }}>{selectedProfile.sex || '-'}</div>
                     </div>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date of Birth</div>
                       <div style={{ fontWeight: 'bold' }}>{selectedProfile.dob || '-'}</div>
                     </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Directory Layout */}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        
        {/* Left Header */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <Users size={24} color="var(--accent-blue)" /> Active Roster
          </h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Showing {filteredEmployees.length} resulting profiles from database.
          </div>
        </div>

        {/* Right Buttons Container: Filter & Direct Create */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: showFilters ? 'var(--accent-blue)' : 'var(--bg-secondary)', 
              border: '1px solid var(--glass-border)', 
              color: showFilters ? '#fff' : 'var(--text-primary)', 
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Filter size={16} /> Filter Rules
          </button>
          <button 
            onClick={() => navigate('/onboarding')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'var(--accent-green)', 
              border: 'none', 
              color: '#fff', fontWeight: 'bold', 
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 15px rgba(63, 185, 80, 0.4)'
            }}
          >
            <UserPlus size={16} /> Stage New Hire
          </button>
        </div>
      </div>

      {/* Hidden Interactive Filter Bar */}
      {showFilters && (
        <div className="glass-panel animate-fade-in" style={{ padding: '16px 24px', display: 'flex', gap: '24px', alignItems: 'flex-end', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-blue)' }}>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
             <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Search Profile</label>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '10px 16px', borderRadius: '8px' }}>
               <Search size={16} color="var(--text-secondary)" />
               <input 
                 type="text" 
                 placeholder="Search by Employee Name, Department, or Email..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
               />
               {searchQuery && (
                 <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}><X size={16}/></button>
               )}
             </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
             <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Employment Status Map</label>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
             >
               <option style={{ color: '#000' }} value="All">Show All Statuses</option>
               <option style={{ color: '#000' }} value="Applicant / Pre-Hire Stage">Applicant / Pre-Hire</option>
               <option style={{ color: '#000' }} value="Probationary Status">Probationary Status</option>
               <option style={{ color: '#000' }} value="Regular / Permanent Status">Regular / Permanent</option>
               <option style={{ color: '#000' }} value="Project-Based / Contractual">Project-Based / Contractual</option>
               <option style={{ color: '#000' }} value="Suspended / On-Leave Status">Suspended / On-Leave</option>
               <option style={{ color: '#000' }} value="Separated / Offboarded">Separated / Offboarded</option>
             </select>
           </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>Full Legal Name</th>
              <th style={{ padding: '16px' }}>Corporate Tier Position</th>
              <th style={{ padding: '16px' }}>Current Mapping</th>
              <th style={{ padding: '16px' }}>Network Contacts</th>
              <th style={{ padding: '16px' }}>Clearance File</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center' }}>Synchronizing CRUD matrices...</td></tr>
            ) : filteredEmployees.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No employee records matched your strict filters.</td></tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                  
                  {/* Clickable Full Name */}
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <div 
                         onClick={() => openProfile(emp)}
                         style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'color 0.2s', color: 'var(--text-primary)' }}
                         onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                         onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                       >
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {emp.photo_url ? <img src={emp.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="P" /> : <UserRound size={16} color="var(--text-secondary)" />}
                          </div>
                          {emp.name_english}
                       </div>
                       
                       {/* Table-view Compliance Progress Bar */}
                       <div style={{ width: '140px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                             <div style={{ 
                                width: `${((emp.file_201_checklist?.length || 0) / 16) * 100}%`, 
                                height: '100%', 
                                background: (emp.file_201_checklist?.length || 0) === 16 ? 'var(--accent-green)' : (emp.file_201_checklist?.length || 0) > 8 ? 'var(--accent-blue)' : 'var(--accent-red)',
                                transition: 'width 0.4s ease' 
                             }} />
                          </div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                             {Math.round(((emp.file_201_checklist?.length || 0) / 16) * 100)}%
                          </span>
                       </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px' }}>
                     <div>{emp.position || 'Tier Unassigned'}</div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{emp.department}</div>
                  </td>
                  
                  <td style={{ padding: '16px' }}>
                     <span style={{ 
                       padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block',
                       background: getStatusStyle(emp.employment_status || 'Probationary Status').bg,
                       color: getStatusStyle(emp.employment_status || 'Probationary Status').color 
                     }}>
                       {emp.employment_status || 'Probationary Status'}
                     </span>
                  </td>

                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>
                    <div>{emp.email || 'N/A'}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{emp.mobile || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {emp.file_201_url ? (
                      <button 
                        onClick={() => setSelectedFileUrl(emp.file_201_url)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '6px', 
                          background: 'rgba(88, 166, 255, 0.15)', border: '1px solid rgba(88, 166, 255, 0.3)', 
                          color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: '6px', 
                          fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-blue)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(88, 166, 255, 0.15)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
                      >
                        <Eye size={16} /> Verify
                      </button>
                    ) : (
                      <span style={{ color: 'var(--accent-red)', paddingLeft: '12px' }}>Awaiting Sync</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
     </div>
    </>
  );
};

export default EmployeeDirectory;
