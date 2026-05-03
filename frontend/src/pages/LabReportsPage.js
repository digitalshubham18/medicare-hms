import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { recordsAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LAB_TESTS = [
  'Complete Blood Count (CBC)', 'Blood Glucose (Fasting)', 'Blood Glucose (PP)',
  'HbA1c', 'Lipid Profile', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)',
  'Thyroid Function Test (TFT)', 'Urine Routine', 'Urine Culture',
  'Blood Culture', 'ECG', 'Chest X-Ray', 'USG Abdomen', 'Echo Cardiography',
  'MRI Brain', 'CT Scan', 'Dengue NS1 Antigen', 'COVID-19 RT-PCR',
  'Pregnancy Test (uHCG)', 'Blood Group & Rh', 'Haemoglobin', 'Platelet Count',
  'PT / INR', 'Serum Electrolytes', 'Vitamin D', 'Vitamin B12', 'Iron Studies',
];

const STATUS_COLOR = {
  pending:    { bg: '#fef3c7', c: '#92400e', label: 'Pending' },
  processing: { bg: '#dbeafe', c: '#1d4ed8', label: 'Processing' },
  completed:  { bg: '#dcfce7', c: '#15803d', label: 'Completed' },
  abnormal:   { bg: '#fee2e2', c: '#dc2626', label: 'Abnormal' },
};

const URGENCY = {
  routine: { label: 'Routine',   c: '#64748b', bg: '#f1f5f9' },
  urgent:  { label: 'Urgent',    c: '#d97706', bg: '#fef3c7' },
  stat:    { label: 'STAT',      c: '#dc2626', bg: '#fee2e2' },
};

export default function LabReportsPage() {
  const { user } = useAuth();
  const isAdmin   = user?.role === 'admin';
  const isDoctor  = user?.role === 'doctor' || isAdmin;
  const isPatient = user?.role === 'patient';

  const [reports,   setReports]   = useState([]);
  const [patients,  setPatients]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showView,  setShowView]  = useState(null);
  const [search,    setSearch]    = useState('');
  const [filterStatus, setFS]     = useState('all');
  const [loadingModal, setLM]     = useState(false);
  const [submitting,   setSub]    = useState(false);

  const [form, setForm] = useState({
    patient: '', tests: [], urgency: 'routine',
    clinicalNotes: '', collectionDate: new Date().toISOString().split('T')[0],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: 'lab_report' };
      if (isPatient) params.patient = user?._id || user?.id;
      const res = await recordsAPI.getAll(params);
      setReports(res?.data?.data || []);
    } catch { setReports([]); }
    setLoading(false);
  }, [user, isPatient]);

  useEffect(() => { load(); }, [load]);

  const openModal = async () => {
    setShowModal(true);
    setLM(true);
    try {
      const res = await usersAPI.getAll({ role: 'patient', status: 'approved', limit: 200 });
      const list = res?.data?.data || [];
      setPatients(list);
      setForm(f => ({ ...f, patient: list[0]?._id || '', tests: [] }));
    } catch { toast.error('Could not load patients'); }
    setLM(false);
  };

  const toggleTest = (test) => setForm(f => ({
    ...f,
    tests: f.tests.includes(test) ? f.tests.filter(t => t !== test) : [...f.tests, test],
  }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patient) { toast.error('Select a patient'); return; }
    if (form.tests.length === 0) { toast.error('Select at least one test'); return; }
    setSub(true);
    try {
      const fd = new FormData();
      fd.append('type', 'lab_report');
      fd.append('patient', form.patient);
      fd.append('title', `Lab Report — ${patients.find(p => p._id === form.patient)?.name || 'Patient'}`);
      fd.append('tests', JSON.stringify(form.tests));
      fd.append('urgency', form.urgency);
      fd.append('clinicalNotes', form.clinicalNotes);
      fd.append('collectionDate', form.collectionDate);
      fd.append('status', 'pending');
      fd.append('doctor', user?._id);
      fd.append('doctorName', user?.name);

      let saved = null;
      try { const r = await recordsAPI.create(fd); saved = r?.data?.data; } catch {}

      const patObj = patients.find(p => p._id === form.patient);
      setReports(prev => [{
        _id:          saved?._id || String(Date.now()),
        patient:      patObj,
        tests:        form.tests,
        urgency:      form.urgency,
        clinicalNotes: form.clinicalNotes,
        collectionDate: form.collectionDate,
        status:       'pending',
        doctorName:   user?.name,
        createdAt:    new Date().toISOString(),
      }, ...prev]);

      toast.success('✅ Lab order placed!');
      setShowModal(false);
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to place lab order'); }
    setSub(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await recordsAPI.update(id, { status });
      setReports(rs => rs.map(r => r._id === id ? { ...r, status } : r));
      if (showView?._id === id) setShowView(v => ({ ...v, status }));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const filtered = reports.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (r.patient?.name || '').toLowerCase().includes(q) ||
             (r.tests || []).some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>🔬 Lab Reports</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
            {isPatient ? 'Your laboratory test results' : 'Order & track patient lab investigations'}
          </div>
        </div>
        {isDoctor && (
          <button onClick={openModal}
            style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#0891b2,#0c4a6e)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            + Order Lab Test
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Orders', val: reports.length, bg: '#eff6ff', c: '#1d4ed8' },
          ...Object.entries(STATUS_COLOR).map(([key, cfg]) => ({ label: cfg.label, val: reports.filter(r => r.status === key).length, bg: cfg.bg, c: cfg.c })),
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.c}20`, borderRadius: 13, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.c }}>{s.val}</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: s.c, opacity: .8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input style={{ width: '100%', padding: '9px 12px 9px 34px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, outline: 'none' }}
            placeholder="Search patient or test…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['all', 'pending', 'processing', 'completed', 'abnormal'].map(s => (
          <button key={s} onClick={() => setFS(s)}
            style={{ padding: '8px 14px', borderRadius: 9, border: `1.5px solid ${filterStatus === s ? '#0891b2' : '#e2e8f0'}`, background: filterStatus === s ? '#e0f2fe' : '#fff', color: filterStatus === s ? '#0369a1' : '#64748b', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', textTransform: 'capitalize' }}>
            {s === 'all' ? 'All' : STATUS_COLOR[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Report list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><div className="spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '52px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔬</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 6 }}>No lab reports found</div>
          {isDoctor && <button onClick={openModal} style={{ marginTop: 8, padding: '9px 20px', background: 'linear-gradient(135deg,#0891b2,#0c4a6e)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Order First Test</button>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((r, i) => {
            const sc   = STATUS_COLOR[r.status] || STATUS_COLOR.pending;
            const urg  = URGENCY[r.urgency] || URGENCY.routine;
            return (
              <motion.div key={r._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.07)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                onClick={() => setShowView(r)}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🔬</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
                    <span style={{ fontWeight: 800, fontSize: 14.5, color: '#0f172a' }}>{r.patient?.name || '—'}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 7, background: sc.bg, color: sc.c }}>{sc.label}</span>
                    {r.urgency && r.urgency !== 'routine' && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 7, background: urg.bg, color: urg.c }}>{urg.label}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 4 }}>
                    🧪 {(r.tests || []).slice(0, 3).join(', ')}{(r.tests || []).length > 3 && ` +${r.tests.length - 3} more`}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    Dr. {r.doctorName || '—'} · {r.collectionDate ? new Date(r.collectionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''} · Ordered {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                {isAdmin && r.status !== 'completed' && (
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {r.status === 'pending' && <button onClick={e => { e.stopPropagation(); updateStatus(r._id, 'processing'); }} style={{ padding: '5px 10px', background: '#dbeafe', border: 'none', borderRadius: 7, color: '#1d4ed8', fontWeight: 700, fontSize: 11.5, cursor: 'pointer' }}>Process</button>}
                    {r.status === 'processing' && <button onClick={e => { e.stopPropagation(); updateStatus(r._id, 'completed'); }} style={{ padding: '5px 10px', background: '#d1fae5', border: 'none', borderRadius: 7, color: '#065f46', fontWeight: 700, fontSize: 11.5, cursor: 'pointer' }}>Complete</button>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── ORDER MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale: .96 }} animate={{ scale: 1 }} exit={{ scale: .96 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '92vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 5, borderRadius: '20px 20px 0 0' }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>🔬 Order Lab Investigation</div>
                <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 15, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              {loadingModal ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner-lg" /></div>
              ) : (
                <form onSubmit={submit}>
                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase' }}>Patient *</label>
                        <select value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}
                          style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13.5, outline: 'none' }}>
                          <option value="">— Select —</option>
                          {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase' }}>Urgency</label>
                        <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                          style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13.5, outline: 'none' }}>
                          {Object.entries(URGENCY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase' }}>Collection Date</label>
                        <input type="date" value={form.collectionDate} onChange={e => setForm(f => ({ ...f, collectionDate: e.target.value }))}
                          style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13.5, outline: 'none' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase' }}>
                        Select Tests * <span style={{ color: '#0891b2', fontWeight: 600 }}>({form.tests.length} selected)</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 6 }}>
                        {LAB_TESTS.map(test => {
                          const sel = form.tests.includes(test);
                          return (
                            <button key={test} type="button" onClick={() => toggleTest(test)}
                              style={{ padding: '8px 12px', borderRadius: 9, border: `1.5px solid ${sel ? '#0891b2' : '#e2e8f0'}`, background: sel ? '#e0f2fe' : '#f8fafc', cursor: 'pointer', fontSize: 12.5, fontWeight: sel ? 700 : 500, color: sel ? '#0369a1' : '#475569', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? '#0891b2' : '#cbd5e1'}`, background: sel ? '#0891b2' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: '#fff' }}>
                                {sel ? '✓' : ''}
                              </span>
                              {test}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase' }}>Clinical Notes</label>
                      <textarea value={form.clinicalNotes} onChange={e => setForm(f => ({ ...f, clinicalNotes: e.target.value }))} rows={2}
                        placeholder="Relevant history, symptoms, or instructions for the lab…"
                        style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13.5, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #f1f5f9', position: 'sticky', bottom: 0, background: '#fff', borderRadius: '0 0 20px 20px' }}>
                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
                    <button type="submit" disabled={submitting} style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#0891b2,#0c4a6e)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: submitting ? .7 : 1 }}>
                      {submitting ? 'Placing order…' : '🔬 Place Lab Order'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW REPORT MODAL ── */}
      <AnimatePresence>
        {showView && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={() => setShowView(null)}>
            <motion.div initial={{ scale: .96 }} animate={{ scale: 1 }} exit={{ scale: .96 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 18 }}>
                <h3 style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>🔬 Lab Report Detail</h3>
                <button onClick={() => setShowView(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>{showView.patient?.name}</div>
                <div style={{ fontSize: 12.5, color: '#64748b' }}>
                  Dr. {showView.doctorName} · {showView.collectionDate ? new Date(showView.collectionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, background: STATUS_COLOR[showView.status]?.bg, color: STATUS_COLOR[showView.status]?.c }}>{STATUS_COLOR[showView.status]?.label}</span>
                  {showView.urgency && showView.urgency !== 'routine' && <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, background: URGENCY[showView.urgency]?.bg, color: URGENCY[showView.urgency]?.c }}>{URGENCY[showView.urgency]?.label}</span>}
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Tests Ordered</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(showView.tests || []).map(t => <span key={t} style={{ padding: '4px 10px', background: '#e0f2fe', color: '#0369a1', borderRadius: 8, fontSize: 12.5, fontWeight: 600 }}>{t}</span>)}
                </div>
              </div>
              {showView.clinicalNotes && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#15803d' }}><strong>Clinical Notes:</strong> {showView.clinicalNotes}</div>}
              {isAdmin && showView.status !== 'completed' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  {showView.status === 'pending' && <button onClick={() => updateStatus(showView._id, 'processing')} style={{ flex: 1, padding: '10px', background: '#dbeafe', border: 'none', borderRadius: 9, color: '#1d4ed8', fontWeight: 700, cursor: 'pointer' }}>Mark Processing</button>}
                  <button onClick={() => updateStatus(showView._id, 'completed')} style={{ flex: 1, padding: '10px', background: '#d1fae5', border: 'none', borderRadius: 9, color: '#065f46', fontWeight: 700, cursor: 'pointer' }}>Mark Completed</button>
                  <button onClick={() => updateStatus(showView._id, 'abnormal')} style={{ flex: 1, padding: '10px', background: '#fee2e2', border: 'none', borderRadius: 9, color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}>Flag Abnormal</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
