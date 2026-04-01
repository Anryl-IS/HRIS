import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BookOpen, FileCheck, Calendar, Search, Plus, X, Award, Clock, ArrowRight, CheckCircle, Trash2, Edit3, User, Briefcase, Zap, Target } from 'lucide-react';

const LDTracker = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ employee_name: '', report_type: 'Daily Refresher', due_date: '', department: '' });
  const [search, setSearch] = useState('');

  const fetchLD = async () => {
    setLoading(true);
    const { data: aData } = await supabase.from('ld_assignments').select('*').order('due_date', { ascending: true });
    const { data: sData } = await supabase.from('ld_submissions').select('*').order('submission_date', { ascending: false });
    if (aData) setAssignments(aData);
    if (sData) setSubmissions(sData);
    setLoading(false);
  };

  useEffect(() => { fetchLD(); }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('ld_assignments').insert([newAssignment]);
    if (!error) {
       setShowModal(false);
       setNewAssignment({ employee_name: '', report_type: 'Daily Refresher', due_date: '', department: '' });
       fetchLD();
    }
  };

  const handleDeleteAssignment = async (id) => {
     if (window.confirm("Cancel this directive/assignment?")) {
        await supabase.from('ld_assignments').delete().eq('id', id);
        fetchLD();
     }
  };

  const filteredAssignments = assignments.filter(a => a.employee_name?.toLowerCase().includes(search.toLowerCase()) || a.department?.toLowerCase().includes(search.toLowerCase()) || a.report_type?.toLowerCase().includes(search.toLowerCase()));
  const filteredSubmissions = submissions.filter(s => s.employee_name?.toLowerCase().includes(search.toLowerCase()) || s.report_type?.toLowerCase().includes(search.toLowerCase()));

  // Analytics
  const completionRate = assignments.length > 0 ? Math.round((submissions.length / (assignments.length + submissions.length)) * 100) : 0;
  const overdueCount = assignments.filter(a => new Date(a.due_date) < new Date()).length;
  const projectCount = assignments.filter(a => a.report_type.includes('Project') || a.report_type.includes('Rollout')).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
             <Target size={28} color="var(--accent-purple)" /> L&D & Special Projects Hub
          </h2>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
             Centralized matrix for Training Compliance & Tactical Project Tasking.
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '12px', width: '300px' }}>
             <Search size={18} color="var(--text-secondary)" />
             <input type="text" placeholder="Search Employee, Dept or Project..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' }} />
          </div>
          <button onClick={() => setShowModal(true)} style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(88, 166, 255, 0.2)' }}>
             <Plus size={18} /> New Directive
          </button>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
         <div className="glass-panel" style={{ padding: '24px', borderBottom: '4px solid var(--accent-purple)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '8px' }}>EXECUTION RATE</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{completionRate}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', marginTop: '4px' }}>Total milestones cleared</div>
         </div>
         <div className="glass-panel" style={{ padding: '24px', borderBottom: '4px solid var(--accent-red)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '8px' }}>OVERDUE RISK</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{overdueCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Reports past threshold date</div>
         </div>
         <div className="glass-panel" style={{ padding: '24px', borderBottom: '4px solid var(--accent-blue)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '8px' }}>ACTIVE TASKS</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{assignments.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Open L&D & Project pipeline</div>
         </div>
         <div className="glass-panel" style={{ padding: '24px', borderBottom: '4px solid var(--accent-green)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: '8px' }}>SPECIAL PROJECTS</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>{projectCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>High-priority missions</div>
         </div>
      </div>

      {/* Main Dual View: Assignments vs Submissions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
          
          {/* ASSIGNMENTS COLUMN */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
             <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Briefcase size={18} color="var(--accent-purple)" /> Operational Directives
                </h3>
             </div>
             
             <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
                {loading ? (
                   <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Loading assignments...</div>
                ) : filteredAssignments.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No active directives in this view.</div>
                ) : filteredAssignments.map(a => {
                  const isProject = a.report_type.includes('Project') || a.report_type.includes('Rollout');
                  return (
                    <div key={a.id} className="glass-panel" style={{ padding: '16px', background: 'var(--bg-tertiary)', position: 'relative', border: '1px solid var(--glass-border)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                             <div style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isProject && <Zap size={14} color="var(--accent-blue)" />}
                                {a.employee_name}
                             </div>
                             <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{a.department} &bull; <span style={{ color: isProject ? 'var(--accent-blue)' : 'inherit' }}>{a.report_type}</span></div>
                          </div>
                          <button onClick={() => handleDeleteAssignment(a.id)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', opacity: 0.5, cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.5}>
                             <Trash2 size={14} />
                          </button>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                          <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: new Date(a.due_date) < new Date() ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                             <Calendar size={12} /> Deadline: {new Date(a.due_date).toLocaleDateString()}
                          </div>
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: isProject ? 'rgba(88, 166, 255, 0.1)' : 'rgba(163, 113, 247, 0.1)', color: isProject ? 'var(--accent-blue)' : 'var(--accent-purple)', fontWeight: 'bold' }}>
                            {isProject ? 'PROJECT' : 'ASSIGNED'}
                          </span>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* SUBMISSIONS TABLE COLUMN */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
             <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Award size={18} color="var(--accent-green)" /> Completion & Verification Log
                </h3>
             </div>
             
             <div style={{ flex: 1, overflowY: 'auto', maxHeight: '600px' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '16px' }}>Responsible Party</th>
                      <th style={{ padding: '16px' }}>Directive Type</th>
                      <th style={{ padding: '16px' }}>Verified At</th>
                      <th style={{ padding: '16px' }}>System Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    {loading ? (
                       <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center' }}>Syncing Matrix Data...</td></tr>
                    ) : filteredSubmissions.length === 0 ? (
                       <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No verifications recorded for this query.</td></tr>
                    ) : (
                       filteredSubmissions.map(s => (
                         <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                           <td style={{ padding: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                 <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="var(--accent-blue)"/></div>
                                 <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.employee_name}</div>
                              </div>
                           </td>
                           <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.report_type}</td>
                           <td style={{ padding: '16px', fontSize: '0.85rem' }}>{new Date(s.submission_date).toLocaleString()}</td>
                           <td style={{ padding: '16px' }}>
                              <span style={{ color: 'var(--accent-green)', background: 'rgba(63, 185, 80, 0.1)', border: '1px solid rgba(63, 185, 80, 0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                 <CheckCircle size={12} /> Finalized
                              </span>
                           </td>
                         </tr>
                       ))
                    )}
                 </tbody>
               </table>
             </div>
          </div>
      </div>

      {/* NEW ASSIGNMENT MODAL */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} className="glass-panel" style={{ width: '450px', padding: '32px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>Deploy Directive / Project</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20}/></button>
             </div>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>Assign high-priority tasks, SOP refreshers or Tactical Projects.</p>

             <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                   <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Employee / Point of Contact</label>
                   <input required value={newAssignment.employee_name} onChange={e => setNewAssignment({...newAssignment, employee_name: e.target.value})} placeholder="Full legal name" style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                   <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Directive Category</label>
                   <select required value={newAssignment.report_type} onChange={e => setNewAssignment({...newAssignment, report_type: e.target.value})} style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                      <optgroup label="L&D / Training">
                        <option>Daily Refresher</option>
                        <option>Weekly Standard SOP</option>
                        <option>Monthly Compliance</option>
                        <option>Legal Disclosure Review</option>
                      </optgroup>
                      <optgroup label="Special Projects">
                        <option>Special Project (Tactical)</option>
                        <option>Operational Rollout</option>
                        <option>System Integration Task</option>
                        <option>Cross-Dept Mission</option>
                      </optgroup>
                   </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department</label>
                      <input required value={newAssignment.department} onChange={e => setNewAssignment({...newAssignment, department: e.target.value})} style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '8px' }} />
                   </div>
                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Deadline</label>
                      <input required type="date" value={newAssignment.due_date} onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})} style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: '8px' }} />
                   </div>
                </div>
                <button type="submit" style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px', boxShadow: '0 4px 15px rgba(88, 166, 255, 0.2)' }}>
                   <Target size={18} /> Seal & Deploy
                </button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LDTracker;
