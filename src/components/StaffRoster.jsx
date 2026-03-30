import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Users, Building2, Briefcase, Mail, Phone, ChevronDown, ChevronRight,
  Search, Filter, Plus, LayoutGrid, List, MoreVertical, ShieldCheck, X,
  UserRound, UploadCloud, Eye, Edit2, Trash2, Save, Activity, CheckCircle, FileText,
  Upload, ShieldAlert, MapPin
} from 'lucide-react';
import QuickStageModal from './QuickStageModal';

const MODULAR_DOCS_LIST = [
  { key: 'pds', label: 'Personal Data Sheet (PDS)' },
  { key: 'sss', label: 'SSS Number / Document' },
  { key: 'bir', label: 'BIR (TIN / 2316 / Registration)' },
  { key: 'tin', label: 'TIN ID / Record' },
  { key: 'philhealth', label: 'PhilHealth ID / Record' },
  { key: 'tor', label: 'TOR (Transcript of Records)' },
  { key: 'diploma', label: 'Diploma' },
  { key: 'work_history', label: 'Work History / Employment Certificates' }
];

// --- Sub-Components ---

const RosterControls = ({ viewMode, setViewMode, searchQuery, setSearchQuery, onQuickStage }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Roster & Segregation</h3>
      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Categorized workforce tracking for HQ operations and distribution pipelines.</p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px', borderRadius: '10px' }}>
        <button
          onClick={() => setViewMode('list')}
          style={{
            padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: viewMode === 'list' ? 'var(--accent-blue)' : 'transparent',
            color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          style={{
            padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: viewMode === 'grid' ? 'var(--accent-blue)' : 'transparent',
            color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <LayoutGrid size={18} />
        </button>
      </div>

      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', minWidth: '280px' }}>
        <Search size={18} color="var(--text-secondary)" />
        <input
          type="text"
          placeholder="Search roster..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent', border: 'none', color: '#fff',
            padding: '12px 0', outline: 'none', width: '100%', fontSize: '0.9rem'
          }}
        />
      </div>

      <button className="glass-button" style={{ padding: '12px' }}>
        <Filter size={18} />
      </button>

      <button
        onClick={onQuickStage}
        style={{
          background: 'var(--accent-gradient)', color: '#fff', border: 'none',
          padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 15px rgba(88, 166, 255, 0.3)'
        }}
      >
        <Plus size={20} /> Quick Stage
      </button>
    </div>
  </div>
);

const EmployeeRow = ({ employee, openProfile }) => (
  <div
    className="employee-row-hover"
    onClick={() => openProfile(employee)}
    style={{
      display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 2fr 150px',
      alignItems: 'center', padding: '14px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
  >
    {/* Left Section */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        overflow: 'hidden', border: '1px solid var(--glass-border)',
        background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {employee.photo_url ? (
          <img src={employee.photo_url} alt={employee.name_english} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <UserRound size={20} color="var(--text-secondary)" />
        )}
      </div>
      <div>
        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>{employee.name_english || 'Unassigned Name'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>ID: {String(employee.id || '').slice(0, 8).toUpperCase()}</div>
      </div>
    </div>

    {/* Middle Section */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
      <div style={{ minWidth: '150px' }}>
        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '500' }}>{employee.position || 'Staff'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Position</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <Mail size={14} color="var(--accent-blue)" />
        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.email || 'N/A'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <Phone size={14} color="var(--accent-green)" />
        <span>{employee.mobile || 'N/A'}</span>
      </div>
    </div>

    {/* Right Section */}
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        padding: '6px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        background: (employee.employment_status || '').toLowerCase().includes('regular') ? 'rgba(63, 185, 80, 0.1)' : 'rgba(88, 166, 255, 0.1)',
        color: (employee.employment_status || '').toLowerCase().includes('regular') ? 'var(--accent-green)' : 'var(--accent-blue)',
        border: `1px solid ${(employee.employment_status || '').toLowerCase().includes('regular') ? 'rgba(63, 185, 80, 0.2)' : 'rgba(88, 166, 255, 0.2)'}`
      }}>
        {((employee.employment_status || 'Probationary').split(' / ')[0])}
      </div>
    </div>
  </div>
);

const DepartmentAccordion = ({ name, staffCount, children, isOpen, onToggle }) => (
  <div className="glass-panel" style={{ marginBottom: '16px', padding: 0, overflow: 'hidden' }}>
    <div
      onClick={onToggle}
      style={{
        padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)',
        borderBottom: isOpen ? '1px solid var(--glass-border)' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'rgba(88, 166, 255, 0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Building2 size={20} color="var(--accent-blue)" />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{name}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{staffCount} Staff Members Allocated</span>
        </div>
      </div>
      <div style={{
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        color: 'var(--text-secondary)'
      }}>
        <ChevronDown size={20} />
      </div>
    </div>

    <div style={{
      maxHeight: isOpen ? '2000px' : '0',
      overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(0,0,0,0.1)'
    }}>
      {children}
    </div>
  </div>
);

// --- Main Component ---

const StaffRoster = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OFFICE_STAFF');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDepts, setExpandedDepts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // Quick Stage Modal

  // --- Directory Modal States ---
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('employees').select('*').order('name_english', { ascending: true });
    if (!error && data) {
      setEmployees(data);
      const initialExpanded = {};
      const depts = [...new Set(data.map(e => e.department || 'UNCATEGORIZED'))];
      depts.forEach((d, i) => { if (i === 0) initialExpanded[d] = true; });
      setExpandedDepts(initialExpanded);
    }
    setLoading(false);
  };

  // --- Modal Logic ---
  const openProfile = (emp) => {
    setSelectedProfile(emp);
    setEditForm(emp);
    setIsEditingProfile(false);
    setIsEditingStatus(false);
    setShowChecklistDropdown(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Applicant / Pre-Hire Stage': return { bg: 'rgba(255, 165, 0, 0.15)', color: '#FFB84D' };
      case 'Regular / Permanent Status': return { bg: 'rgba(63, 185, 80, 0.15)', color: 'var(--accent-green)' };
      case 'Project-Based / Contractual': return { bg: 'rgba(163, 113, 247, 0.15)', color: 'var(--accent-purple)' };
      case 'Suspended / On-Leave Status': return { bg: 'rgba(255, 123, 114, 0.15)', color: 'var(--accent-red)' };
      case 'Separated / Offboarded': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };
      default: return { bg: 'rgba(88, 166, 255, 0.15)', color: 'var(--accent-blue)' };
    }
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { color: 'var(--accent-green)', bg: 'rgba(63, 185, 80, 0.1)' };
      case 'Rejected': return { color: 'var(--accent-red)', bg: 'rgba(255, 123, 114, 0.1)' };
      case 'Pending Verification': return { color: 'var(--accent-blue)', bg: 'rgba(88, 166, 255, 0.1)' };
      case 'Uploaded': return { color: '#fff', bg: 'rgba(255, 255, 255, 0.1)' };
      default: return { color: 'var(--text-secondary)', bg: 'transparent' };
    }
  };

  const handleStatusChange = async (newStatus) => {
    const { error } = await supabase.from('employees').update({ employment_status: newStatus }).eq('id', selectedProfile.id);
    if (!error) {
      setSelectedProfile({ ...selectedProfile, employment_status: newStatus });
      fetchEmployees();
      setIsEditingStatus(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const { id, created_at, ...updateData } = editForm;
    const { error } = await supabase.from('employees').update(updateData).eq('id', selectedProfile.id);
    if (!error) {
      setSelectedProfile(editForm);
      setIsEditingProfile(false);
      fetchEmployees();
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (!error) {
        setSelectedProfile(null);
        fetchEmployees();
      }
    }
  };

  const handleDocUpload = async (docKey, file) => {
    if (!file) return;
    setUploadingDoc(docKey);
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedProfile.id}_${docKey}_${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('201_files').upload(fileName, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('201_files').getPublicUrl(uploadData.path);
      const updatedDocs = { ...selectedProfile.modular_docs, [docKey]: { url: publicUrl, name: file.name, status: 'Pending Verification', uploaded_at: new Date().toISOString() } };
      await supabase.from('employees').update({ modular_docs: updatedDocs }).eq('id', selectedProfile.id);
      setSelectedProfile({ ...selectedProfile, modular_docs: updatedDocs });
      fetchEmployees();
    }
    setUploadingDoc(null);
  };

  const handleDocVerify = async (docKey, status, remarks = '') => {
    const updatedDocs = { ...selectedProfile.modular_docs, [docKey]: { ...selectedProfile.modular_docs?.[docKey], status, verified_at: new Date().toISOString(), remarks } };
    await supabase.from('employees').update({ modular_docs: updatedDocs }).eq('id', selectedProfile.id);
    setSelectedProfile({ ...selectedProfile, modular_docs: updatedDocs });
    fetchEmployees();
  };

  const toggleDept = (dept) => {
    setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  const isTeller = (emp) => {
    const pos = (emp.position || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    return pos.includes('teller') || dept.includes('teller') || dept.includes('gaming');
  };

  const filtered = employees.filter(emp => {
    const matchesTab = activeTab === 'TELLERS' ? isTeller(emp) : !isTeller(emp);
    const matchesSearch = emp.name_english?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const grouped = filtered.reduce((acc, emp) => {
    const dept = emp.department || 'UNCATEGORIZED';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(emp);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 40px 0' }}>


      <RosterControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onQuickStage={() => setIsModalOpen(true)}
      />

      <QuickStageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchEmployees}
      />

      {/* Segmented Category Buttons */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '32px',
        padding: '6px', background: 'rgba(255,255,255,0.03)',
        borderRadius: '14px', width: 'fit-content', border: '1px solid var(--glass-border)'
      }}>
        <button
          onClick={() => setActiveTab('OFFICE_STAFF')}
          style={{
            padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            background: activeTab === 'OFFICE_STAFF' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'OFFICE_STAFF' ? '#fff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'OFFICE_STAFF' ? '0 4px 15px rgba(88, 166, 255, 0.2)' : 'none',
            fontSize: '0.85rem', letterSpacing: '1px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          OFFICE STAFF
        </button>
        <button
          onClick={() => setActiveTab('TELLERS')}
          style={{
            padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            background: activeTab === 'TELLERS' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'TELLERS' ? '#fff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'TELLERS' ? '0 4px 15px rgba(88, 166, 255, 0.2)' : 'none',
            fontSize: '0.85rem', letterSpacing: '1px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          TELLERS
        </button>
      </div>

      {/* Department Groupings */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '100px 0' }}>
          <div className="spinner-glow" style={{ width: '40px', height: '40px', border: '3px solid rgba(88, 166, 255, 0.1)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '1px' }}>SYNCHRONIZING PERSONNEL MATRIX...</span>
        </div>
      ) : (
        Object.keys(grouped).sort().map(dept => (
          <DepartmentAccordion
            key={dept}
            name={dept}
            staffCount={grouped[dept].length}
            isOpen={expandedDepts[dept]}
            onToggle={() => toggleDept(dept)}
          >
            {viewMode === 'list' ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 2fr 150px',
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)',
                  fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  <span>Workforce Member</span>
                  <span>Professional Details</span>
                  <span style={{ textAlign: 'right' }}>Status</span>
                </div>
                {grouped[dept].map(emp => (
                  <EmployeeRow key={emp.id} employee={emp} openProfile={openProfile} />
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px', padding: '24px'
              }}>
                {grouped[dept].map(emp => (
                  <div
                    key={emp.id}
                    className="glass-panel"
                    onClick={() => openProfile(emp)}
                    style={{ padding: '20px', position: 'relative', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                        {emp.photo_url ? <img src={emp.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserRound size={24} style={{ margin: '13px', color: 'var(--text-secondary)' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0' }}>{emp.name_english}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>{emp.position}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Mail size={14} /> {emp.email || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Phone size={14} /> {emp.mobile || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DepartmentAccordion>
        ))
      )}

      {/* Empty State */}
      {!loading && Object.keys(grouped).length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
          <Users size={48} style={{ marginBottom: '16px' }} />
          <h3>No records match your current filter criteria.</h3>
        </div>
      )}

      {/* --- ADDED MODALS FROM DIRECTORY --- */}

      {/* 201 File Viewer Modal */}
      {selectedFileUrl && (
        <div
          onClick={() => setSelectedFileUrl(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel animate-fade-in"
            style={{
              width: '100%', maxWidth: '1100px', height: '90vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
            }}>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={20} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>SGC 201 Document Vault</h3>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <a href={selectedFileUrl} target="_blank" rel="noreferrer" style={{ background: 'var(--accent-blue)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>Original Resource</a>
                <button
                  onClick={() => setSelectedFileUrl(null)}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f0f2f5', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(() => {
                const url = String(selectedFileUrl);
                const cleanUrl = url.split('?')[0];
                const ext = cleanUrl.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                const isPdf = ext === 'pdf';

                if (isImage) {
                  return <img src={selectedFileUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />;
                }
                if (isPdf) {
                  return <iframe src={selectedFileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" />;
                }
                // Default to standard iframe if unknown but present
                return <iframe src={selectedFileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Generic Viewer" />;
              })()}
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
                  <ShieldAlert size={14} color={MODULAR_DOCS_LIST.filter(d => (selectedProfile.modular_docs?.[d.key]?.status === 'Approved')).length === MODULAR_DOCS_LIST.length ? 'var(--accent-green)' : 'var(--accent-red)'} />
                  Vault Compliance Matrix
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                    {MODULAR_DOCS_LIST.filter(d => selectedProfile.modular_docs?.[d.key]?.url).length}/{MODULAR_DOCS_LIST.length}
                  </span>
                </button>

                {showChecklistDropdown && (
                  <div onClick={e => e.stopPropagation()} className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '450px', maxHeight: '550px', overflowY: 'auto', zIndex: 99999, padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <CheckCircle size={18} color="var(--accent-green)" /> 201 Modular Repository
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {MODULAR_DOCS_LIST.map((doc, idx) => {
                        const docData = selectedProfile.modular_docs?.[doc.key];
                        const hasFile = !!docData?.url;
                        const styles = getDocStatusStyle(docData?.status || 'Missing');

                        return (
                          <div key={idx} style={{
                            padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                            border: `1px solid ${hasFile ? 'var(--glass-border)' : 'rgba(255,123,114,0.1)'}`,
                            display: 'flex', flexDirection: 'column', gap: '12px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: hasFile ? '#fff' : 'var(--text-secondary)' }}>{doc.label}</span>
                                <span style={{ fontSize: '0.7rem', color: styles.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{docData?.status || 'Missing'}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {hasFile && (
                                  <button onClick={() => setSelectedFileUrl(docData.url)} style={{ background: 'rgba(88, 166, 255, 0.1)', border: 'none', color: 'var(--accent-blue)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Eye size={14} /></button>
                                )}
                                <label style={{ background: 'var(--accent-blue)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Upload size={12} /> {uploadingDoc === doc.key ? '...' : 'Upload'}
                                  <input type="file" hidden onChange={(e) => handleDocUpload(doc.key, e.target.files[0])} />
                                </label>
                              </div>
                            </div>

                            {hasFile && (
                              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                                <button onClick={() => handleDocVerify(doc.key, 'Approved')} style={{ flex: 1, background: 'rgba(63, 185, 80, 0.1)', border: '1px solid rgba(63, 185, 80, 0.2)', color: 'var(--accent-green)', padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Approve</button>
                                <button onClick={() => { const r = prompt("Reason for rejection?"); if (r) handleDocVerify(doc.key, 'Rejected', r); }} style={{ flex: 1, background: 'rgba(255, 123, 114, 0.1)', border: '1px solid rgba(255, 123, 114, 0.2)', color: 'var(--accent-red)', padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                              </div>
                            )}
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

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Legal Name</label>
                      <input required value={editForm.name_english || ''} onChange={(e) => setEditForm({ ...editForm, name_english: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Photograph ID URL</label>
                      <input value={editForm.photo_url || ''} onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })} placeholder="https://..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department</label>
                      <input value={editForm.department || ''} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Position Wrapper</label>
                      <input value={editForm.position || ''} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Allocation</label>
                      <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mobile Dispatch</label>
                      <input value={editForm.mobile || ''} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
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
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} color="var(--accent-purple)" /></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Allocation</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.email || 'N/A'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={16} color="var(--accent-green)" /></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mobile Dispatch</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.mobile || 'N/A'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: 'span 2' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="var(--accent-red)" /></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registered Residence</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.residence_address || 'Address missing in vault.'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRoster;
