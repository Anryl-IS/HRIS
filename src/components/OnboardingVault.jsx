import React, { useState, useEffect } from 'react';
import { UploadCloud, FileType, CheckCircle, Plus, X, ArrowRight, Shield, Book, Users, Briefcase, FileText, Upload, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const OnboardingVault = () => {
  const navigate = useNavigate();
  const [pipeline, setPipeline] = useState([]);
  const [verified, setVerified] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);

  // Massive Data Model corresponding to PDS / 7-Pillars
  const [formData, setFormData] = useState({
    name_english: '', dob: '', pob: '', sex: '', civil_status: '',
    height: '', weight: '', blood_type: '',
    gsis: '', pagibig: '', philhealth: '', sss: '', tin: '', citizenship: '',
    residence_address: '', residence_postal: '', present_address: '', present_postal: '',
    mobile: '', email: '', spouse_name: '', parents_names: '', children_info: '',
    educational: '', highest_level: '', major_subject: '', school_name: '', honors: '',
    csc_license: '', csc_date: '',
    work_history: '', has_gov_service: 'No',
    voluntarism: '', ld_interventions: '',
    skills: '', awards: '', memberships: '', legal_34_40: 'No records'
  });

  // Multiple File Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fetchData = async () => {
    const { data } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (data) {
      setPipeline(data.filter(e => (e.file_201_checklist?.length || 0) < 16));
      setVerified(data.filter(e => (e.file_201_checklist?.length || 0) === 16));
    }
  };

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  useEffect(() => { fetchData(); }, []);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileUrls = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${formData.name_english.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('201_files')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

          if (!error && data) {
            const { data: publicUrlData } = supabase.storage.from('201_files').getPublicUrl(data.path);
            if (publicUrlData) {
              fileUrls.push(publicUrlData.publicUrl);
            }
          }
        }
      }

      const combinedFileUrls = fileUrls.length > 0 ? fileUrls.join(',') : null;
      const initialChecklist = [];
      if (formData.name_english) initialChecklist.push('Full name');
      if (formData.dob) initialChecklist.push('Date of birth');
      if (formData.residence_address) initialChecklist.push('Address');
      if (formData.mobile || formData.email) initialChecklist.push('Contact information');
      if (formData.sss) initialChecklist.push('SSS number');
      if (formData.philhealth) initialChecklist.push('PhilHealth number');
      if (formData.pagibig) initialChecklist.push('Pag-IBIG Home Development Mutual Fund (HDMF) number');
      if (formData.tin) initialChecklist.push('Tax Identification number (TIN)');
      if (formData.educational) initialChecklist.push('Education transcripts or diplomas');
      if (formData.work_history) initialChecklist.push('Work history');
      if (fileUrls.length > 0) initialChecklist.push('Hiring requirements');

      await supabase.from('employees').insert([{
        name_english: formData.name_english,
        dob: formData.dob || null,
        sex: formData.sex,
        blood_type: formData.blood_type,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        email: formData.email,
        mobile: formData.mobile,
        educational: formData.educational,
        highest_level: formData.highest_level,
        major_subject: formData.major_subject,
        residence_address: formData.residence_address,
        residence_postal: formData.residence_postal,
        present_address: formData.present_address,
        present_postal: formData.present_postal,
        sss: formData.sss,
        philhealth: formData.philhealth,
        pagibig: formData.pagibig,
        file_201_url: combinedFileUrls,
        file_201_checklist: initialChecklist
      }]);

      setShowModal(false);
      setSelectedFiles([]); 
      setActiveTab(1);      
      fetchData();         
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ label, type = "text", field, width = "100%", req = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width }}>
      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label} {req && <span style={{ color: 'var(--accent-red)' }}>*</span>}</label>
      <input required={req} type={type} value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })}
        style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', outline: 'none' }} />
    </div>
  );

  return (
    <>
      {/* 1. DATA VAULT MODAL (Outside transform) */}
      {showModal && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', 
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: '24px' 
          }}>
          <div 
            className="glass-panel animate-fade-in" 
            style={{ 
              width: '100%', maxWidth: '1100px', height: '100%', maxHeight: '100%', 
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)' }}>
              <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                <Shield color="var(--accent-blue)" /> Official 201 File & Data Vault
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            {/* Modal Body: Left Tabs + Form */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ width: '250px', borderRight: '1px solid var(--glass-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                {[
                  { id: 1, icon: <Users size={16} />, title: '1. Personal Info' },
                  { id: 2, icon: <MapPin size={16} />, title: '2. Contact & Family' },
                  { id: 3, icon: <Book size={16} />, title: '3. Education & CSC' },
                  { id: 4, icon: <Briefcase size={16} />, title: '4. Work & Service' },
                  { id: 5, icon: <FileText size={16} />, title: '5. L&D Interventions' },
                  { id: 6, icon: <Shield size={16} />, title: '6. Legal Disclosures' },
                  { id: 7, icon: <Upload size={16} />, title: '7. Document Uploads' }
                ].map(tab => (
                  <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
                      color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)'
                    }}>
                    {tab.icon} {tab.title}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'rgba(0,0,0,0.1)' }}>
                <form id="vaultForm" onSubmit={handleInitiate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {activeTab === 1 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h4 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Personal Information (The Baseline)</h4>
                      <Input label="Full Name (Last, First, MI)" field="name_english" req />
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="Date of Birth" type="date" field="dob" />
                        <Input label="Place of Birth" field="pob" />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sex</label>
                          <select value={formData.sex} onChange={e => setFormData({ ...formData, sex: e.target.value })} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                            <option></option><option>Male</option><option>Female</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="Height (m)" type="number" field="height" />
                        <Input label="Weight (kg)" type="number" field="weight" />
                        <Input label="Blood Type" field="blood_type" />
                        <Input label="Civil Status" field="civil_status" />
                      </div>
                      <h4 style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Government IDs</h4>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <Input label="GSIS Number" field="gsis" width="calc(50% - 8px)" />
                        <Input label="PAG-IBIG Number" field="pagibig" width="calc(50% - 8px)" />
                        <Input label="PHILHEALTH Number" field="philhealth" width="calc(50% - 8px)" />
                        <Input label="SSS Number" field="sss" width="calc(50% - 8px)" />
                        <Input label="TIN Number" field="tin" width="calc(50% - 8px)" />
                        <div style={{ width: 'calc(50% - 8px)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Citizenship Status</label>
                          <select value={formData.citizenship} onChange={e => setFormData({ ...formData, citizenship: e.target.value })} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                            <option></option><option>By Birth</option><option>Naturalization</option><option>Dual Citizenship</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 2 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h4 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Contact & Family Background</h4>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="Residential Address" field="residence_address" width="70%" />
                        <Input label="ZIP / Postal" field="residence_postal" width="30%" />
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="Permanent/Present Address" field="present_address" width="70%" />
                        <Input label="ZIP / Postal" field="present_postal" width="30%" />
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="Email Address" type="email" field="email" req />
                        <Input label="Mobile / Telephone" field="mobile" />
                      </div>
                      <h4 style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Family Matrix</h4>
                      <Input label="Spouse's Info (Name, Occupation, Employer)" field="spouse_name" />
                      <Input label="Parents' Information (Inc. Mother's Maiden Name)" field="parents_names" />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Children (Names & DOBs for Benefits)</label>
                        <textarea value={formData.children_info} onChange={e => setFormData({ ...formData, children_info: e.target.value })} rows={3} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', outline: 'none' }}></textarea>
                      </div>
                    </div>
                  )}

                  {activeTab === 3 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h4 style={{ color: 'var(--accent-green)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Educational Background & CSC Filters</h4>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="Educational Level (College, Graduate, etc.)" field="educational" width="50%" />
                        <Input label="Highest Level / Units Earned" field="highest_level" width="50%" />
                      </div>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="Name of School / Institution" field="school_name" width="50%" />
                        <Input label="Degree / Major Subject" field="major_subject" width="50%" />
                      </div>
                      <Input label="Academic Honors Received & Year Graduated" field="honors" />
                      <h4 style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Civil Service & Licenses (SOP Sync)</h4>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Input label="License Type (Board/Bar/CSC Level)" field="csc_license" width="70%" />
                        <Input label="Validity Date" type="date" field="csc_date" width="30%" />
                      </div>
                    </div>
                  )}

                  {activeTab === 4 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h4 style={{ color: 'var(--accent-red)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Work Experience (History)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Chronological Record (Inclusive dates, position, department, salary grade, temp/permanent)</label>
                        <textarea value={formData.work_history} onChange={e => setFormData({ ...formData, work_history: e.target.value })} rows={6} placeholder="Format: YYYY-YYYY | Job Title | Agency | Salary" style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', outline: 'none' }}></textarea>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prior Government Service? (Required for Audit Trail)</label>
                        <select value={formData.has_gov_service} onChange={e => setFormData({ ...formData, has_gov_service: e.target.value })} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', width: '200px' }}>
                          <option>No</option><option>Yes</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 5 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h4 style={{ color: 'var(--accent-red)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Voluntarism & Learning (L&D Pipeline)</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>* Note: These inputs feed directly into the L&D Tracker gap-analysis framework.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Voluntary Work (Civic, NGO, Religious involvement)</label>
                        <textarea value={formData.voluntarism} onChange={e => setFormData({ ...formData, voluntarism: e.target.value })} rows={4} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', outline: 'none' }}></textarea>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>L&D Interventions (List of prior seminars/training programs)</label>
                        <textarea value={formData.ld_interventions} onChange={e => setFormData({ ...formData, ld_interventions: e.target.value })} rows={4} style={{ padding: '10px', borderRadius: '6px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', outline: 'none' }}></textarea>
                      </div>
                    </div>
                  )}

                  {activeTab === 6 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h4 style={{ color: 'var(--accent-red)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Other Information & Legal Disclosures</h4>
                      <Input label="Special Skills & Hobbies (Culture Build)" field="skills" />
                      <Input label="Non-Academic Distinctions / Awards" field="awards" />
                      <Input label="Memberships in Organizations" field="memberships" />
                      <h4 style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>The "34 to 40" Questions</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Legal Disclosures (Criminal records, admin cases, hiring authority nepotism checks)</label>
                        <textarea value={formData.legal_34_40} onChange={e => setFormData({ ...formData, legal_34_40: e.target.value })} rows={4} style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255, 123, 114, 0.1)', border: '1px solid var(--accent-red)', color: '#fff', outline: 'none' }}></textarea>
                      </div>
                    </div>
                  )}

                  {activeTab === 7 && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <h4 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>Final Step: Proof & File References</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Select all required attachments (Valid IDs, Clearances, Diploma) referencing their 201 File's progress.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ 
                          border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '40px 24px', 
                          textAlign: 'center', background: 'var(--bg-tertiary)', position: 'relative', transition: 'all 0.2s',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.background = 'rgba(88, 166, 255, 0.05)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                        >
                          <UploadCloud size={40} color="var(--accent-blue)" />
                          <div>
                            <span style={{ fontWeight: 'bold' }}>Click to browse</span> or drag and drop.
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>JPG, PNG, PDF formats accepted.</div>
                          </div>
                          <input type="file" multiple onChange={handleFileSelect} title="" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }} />
                        </div>
                        {selectedFiles.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                            <h5 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Files ready for upload ({selectedFiles.length}):</h5>
                            {selectedFiles.map((file, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', padding: '10px 16px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                                  <FileType size={16} color="var(--text-secondary)" />
                                  <span style={{ fontWeight: 'bold' }}>{file.name}</span>
                                  <span style={{ color: 'var(--text-secondary)' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button type="button" onClick={() => removeFile(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => activeTab > 1 ? setActiveTab(activeTab - 1) : setShowModal(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                {activeTab === 1 ? 'Cancel' : 'Previous Section'}
              </button>
              {activeTab < 7 ? (
                <button type="button" onClick={() => setActiveTab(activeTab + 1)} style={{ background: 'var(--accent-blue)', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  Next Section <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" form="vaultForm" disabled={loading} style={{ background: 'var(--accent-green)', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 0 15px rgba(63, 185, 80, 0.4)' }}>
                  {loading ? 'Finalizing Vault...' : 'Finalize Employee 201'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content (Animated) */}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Hero Header */}
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-blue)', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)' }}></div>
          <UploadCloud size={56} color="var(--accent-blue)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Pre-Employment Data Vault</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Comprehensive Personal Data Sheet (PDS) pipeline. Capture biometrics, backgrounds, and legal disclosures securely.
          </p>
          <button onClick={() => setShowModal(true)} style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(88, 166, 255, 0.3)' }}>
            <Plus size={22} /> Initiate PDS Pipeline
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileType size={20} color="var(--accent-purple)" /> Pending Validations ({pipeline.length})</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {pipeline.map(emp => (
                <li key={emp.id} onClick={() => navigate('/directory', { state: { openEmployeeId: emp.id } })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
                  <span style={{ fontWeight: '500' }}>{emp.name_english}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', fontWeight: 'bold' }}>{(emp.file_201_checklist?.length || 0)}/16 Compliant</div>
                  </div>
                </li>
              ))}
              {pipeline.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>All caught up!</span>}
            </ul>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={20} color="var(--accent-green)" /> Verified 201 Files ({verified.length})</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {verified.map(emp => (
                <li key={emp.id} onClick={() => navigate('/directory', { state: { openEmployeeId: emp.id } })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
                  <span>{emp.name_english}</span>
                  <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>100% Cleared</span>
                </li>
              ))}
              {verified.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>No fully verified employees yet.</span>}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

function MapPin(props) { return <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }

export default OnboardingVault;
