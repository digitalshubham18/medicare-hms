import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { recordsAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patient: '', type: 'Blood Report', title: '', notes: '', file: null });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await recordsAPI.getAll();
      setRecords(res.data.data || []);
      if (['admin','doctor','nurse'].includes(user?.role)) {
        const pRes = await usersAPI.getAll({ role: 'patient', status: 'approved' });
        setPatients(pRes.data.data || []);
        if (pRes.data.data?.length) setForm(f => ({ ...f, patient: pRes.data.data[0]._id }));
      }
    } catch { toast.error('Failed to load records'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => { if (k !== 'file' && form[k]) fd.append(k, form[k]); });
      if (form.file) fd.append('file', form.file);
      await recordsAPI.create(fd);
      toast.success('Record uploaded successfully!');
      setShowUpload(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
    setUploading(false);
  };

  const myRecords = user?.role === 'patient' ? records : records;
  const patientRecords = viewRecord ? records.filter(r => r.patient?._id === viewRecord) : [];

  const RECORD_TYPES = ['Blood Report','X-Ray','ECG','MRI','CT Scan','Ultrasound','Prescription','Discharge Summary','Lab Report','Other'];

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Health Records</div><div className="page-subtitle">Secure patient medical history & reports</div></div>
        {['admin','doctor','nurse'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>+ Upload Record</button>
        )}
      </div>

      <div className="grid-2">
        <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }}>
          <div className="card-header"><span className="card-title">📋 All Records</span></div>
          <div className="card-body-0">
            {loading ? <div style={{ padding:32,textAlign:'center' }}><div className="spinner-lg" style={{ margin:'0 auto' }} /></div> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Patient</th><th>Type</th><th>Date</th><th>Doctor</th><th>Actions</th></tr></thead>
                  <tbody>
                    {myRecords.length === 0 ? <tr><td colSpan={5} style={{ textAlign:'center',padding:24,color:'#94a3b8' }}>No records found</td></tr>
                      : myRecords.map(r => (
                      <tr key={r._id}>
                        <td className="td-main">{r.patient?.name}</td>
                        <td><span className="badge badge-primary">{r.type}</span></td>
                        <td className="text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="text-sm">{r.doctor?.name}</td>
                        <td>
                          <div className="flex gap-1">
                            <button className="btn btn-primary btn-xs" onClick={() => setViewRecord(r)}>View</button>
                            {r.fileUrl && <a className="btn btn-outline btn-xs" href={`${process.env.REACT_APP_SOCKET_URL}${r.fileUrl}`} target="_blank" rel="noreferrer">📥</a>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
          <div className="card-header"><span className="card-title">🕐 Timeline</span></div>
          <div className="card-body">
            {myRecords.length === 0 ? <div style={{ textAlign:'center',padding:20,color:'#94a3b8' }}>No records yet</div>
              : <div className="timeline">
                {myRecords.slice(0,6).map((r,i) => (
                  <motion.div key={r._id} className="timeline-item" initial={{ opacity:0,x:-12 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*.08 }}>
                    <div className="timeline-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                    <div className="timeline-title">{r.type} · {r.title}</div>
                    <div className="timeline-desc">{r.doctor?.name} · {r.notes?.slice(0,80)}{r.notes?.length>80?'…':''}</div>
                  </motion.div>
                ))}
              </div>
            }
          </div>
        </motion.div>
      </div>

      {/* View Record Modal */}
      {viewRecord && typeof viewRecord === 'object' && (
        <div className="modal-overlay" onClick={e => { if (e.target===e.currentTarget) setViewRecord(null); }}>
          <motion.div className="modal-box" initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
            <div className="modal-header">
              <span className="modal-title">📋 {viewRecord.type}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setViewRecord(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background:'#f8fafc',borderRadius:10,padding:14,marginBottom:14 }}>
                <div className="form-row">
                  <div><div className="text-xs text-muted">Patient</div><div className="fw-7">{viewRecord.patient?.name}</div></div>
                  <div><div className="text-xs text-muted">Date</div><div className="fw-7">{new Date(viewRecord.createdAt).toLocaleDateString()}</div></div>
                </div>
                <div className="form-row mt-1">
                  <div><div className="text-xs text-muted">Doctor</div><div className="fw-7">{viewRecord.doctor?.name}</div></div>
                  <div><div className="text-xs text-muted">Type</div><div className="fw-7">{viewRecord.type}</div></div>
                </div>
              </div>
              {viewRecord.notes && <div className="form-group"><label className="form-label">Clinical Notes</label><textarea className="form-input" rows={3} defaultValue={viewRecord.notes} readOnly /></div>}
              {viewRecord.fileUrl && <div style={{ background:'#e8effe',borderRadius:8,padding:'10px 12px',fontSize:12,color:'#1e40af',display:'flex',alignItems:'center',gap:8 }}>📄 {viewRecord.fileName || 'Attached file'} · Secure Encrypted</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewRecord(null)}>Close</button>
              {viewRecord.fileUrl && <a className="btn btn-primary" href={`${process.env.REACT_APP_SOCKET_URL}${viewRecord.fileUrl}`} target="_blank" rel="noreferrer">📥 Download</a>}
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={e => { if (e.target===e.currentTarget) setShowUpload(false); }}>
          <motion.div className="modal-box" initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
            <div className="modal-header">
              <span className="modal-title">📤 Upload Health Record</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Patient</label>
                    <select className="form-input" value={form.patient} onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}>
                      {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Record Type</label>
                    <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Title *</label><input className="form-input" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Blood Report March 2025" /></div>
                <div style={{ border:'2px dashed #cbd5e1',borderRadius:10,padding:24,textAlign:'center',cursor:'pointer',background:'#f8fafc',marginBottom:14 }} onClick={() => document.getElementById('rec-file').click()}>
                  <div style={{ fontSize:32,marginBottom:8 }}>📤</div>
                  <div className="fw-7 text-sm">Click to upload file</div>
                  <div className="text-xs text-muted mt-1">PDF, JPG, PNG, DICOM · Max 5MB</div>
                  {form.file && <div style={{ marginTop:8,fontSize:12,color:'#059669',fontWeight:700 }}>✅ {form.file.name}</div>}
                  <input id="rec-file" type="file" style={{ display:'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={e => setForm(f => ({ ...f, file: e.target.files[0] }))} />
                </div>
                <div className="form-group"><label className="form-label">Clinical Notes</label><textarea className="form-input" rows={2} placeholder="Findings and observations…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? <><span className="spinner-sm" /> Uploading…</> : '📤 Upload Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}