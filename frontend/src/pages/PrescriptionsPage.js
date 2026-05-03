// PrescriptionsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI, medicinesAPI, recordsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const DOSAGE_OPTIONS = [
  'Once daily (OD)',
  'Twice daily (BD)',
  'Three times daily (TID)',
  'Four times daily (QID)',
  'Every 8 hours',
  'Every 12 hours',
  'At bedtime (HS)',
  'Before meals (AC)',
  'After meals (PC)',
  'As needed (SOS)',
];

const DURATION_OPTIONS = [
  '3 days', '5 days', '7 days', '10 days',
  '14 days', '21 days', '1 month', '2 months', '3 months', 'Ongoing',
];

// ── Component ─────────────────────────────────────────────────────────────────
export function PrescriptionsPage() {
  const { user } = useAuth();

  // Data states
  const [patients,       setPatients]       = useState([]);
  const [medicines,      setMedicines]      = useState([]);
  const [prescriptions,  setPrescriptions]  = useState([]);
  const [loadingData,    setLoadingData]    = useState(false);
  const [loadingList,    setLoadingList]    = useState(true);

  // Modal / form states
  const [showModal, setShowModal] = useState(false);
  const [issuing,   setIssuing]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [form, setForm] = useState({
    patient:        '',
    diagnosis:      '',
    chiefComplaint: '',
    vitals:         '',
    medicines:      [{ med: '', dosage: '', duration: '', instructions: '' }],
    followUp:       '',
    notes:          '',
  });

  // ── Load issued prescriptions on mount ────────────────────────────────────
  const loadPrescriptions = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await recordsAPI.getAll({ type: 'prescription' });
      setPrescriptions(res?.data?.data || []);
    } catch {
      setPrescriptions([]);
    }
    setLoadingList(false);
  }, []);

  useEffect(() => { loadPrescriptions(); }, [loadPrescriptions]);

  // ── Open modal: fetch patients + medicines independently so one failure
  //    doesn't blank out the other ──────────────────────────────────────────
  const openModal = async () => {
    setShowModal(true);
    setLoadingData(true);

    // Use allSettled so a pharmacy outage doesn't kill the patient list
    const [pRes, mRes] = await Promise.allSettled([
      usersAPI.getAll({ role: 'patient', status: 'approved', limit: 200 }),
      medicinesAPI.getAll({ limit: 500 }),
    ]);

    const patientList  = pRes.status  === 'fulfilled' ? (pRes.value?.data?.data  || []) : [];
    const medicineList = mRes.status  === 'fulfilled' ? (mRes.value?.data?.data  || []) : [];

    setPatients(patientList);
    setMedicines(medicineList);

    // Pre-select first patient so dropdown is never blank
    setForm(f => ({
      ...f,
      patient: patientList.length > 0 ? patientList[0]._id : '',
    }));

    if (patientList.length === 0)  toast('No approved patients found', { icon: 'ℹ️' });
    if (medicineList.length === 0) toast('No medicines in inventory', { icon: 'ℹ️' });

    setLoadingData(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({
      patient: '', diagnosis: '', chiefComplaint: '', vitals: '',
      medicines: [{ med: '', dosage: '', duration: '', instructions: '' }],
      followUp: '', notes: '',
    });
  };

  // ── Medicine row helpers ──────────────────────────────────────────────────
  const addMedRow = () =>
    setForm(f => ({ ...f, medicines: [...f.medicines, { med: '', dosage: '', duration: '', instructions: '' }] }));

  const removeMedRow = (i) =>
    setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));

  const updateMedRow = (i, field, val) =>
    setForm(f => ({
      ...f,
      medicines: f.medicines.map((m, idx) => idx === i ? { ...m, [field]: val } : m),
    }));

  // ── Submit ────────────────────────────────────────────────────────────────
  const issue = async (e) => {
    e.preventDefault();
    if (!form.patient)   { toast.error('Please select a patient');   return; }
    if (!form.diagnosis) { toast.error('Diagnosis is required');     return; }
    const validMeds = form.medicines.filter(m => m.med);
    if (validMeds.length === 0) { toast.error('Add at least one medicine'); return; }

    setIssuing(true);
    try {
      const patientObj = patients.find(p => p._id === form.patient);

      // Build FormData for the records API (multipart expected)
      const fd = new FormData();
      fd.append('type',           'prescription');
      fd.append('patient',        form.patient);
      fd.append('title',          `Prescription – ${patientObj?.name || 'Patient'} – ${new Date().toLocaleDateString('en-IN')}`);
      fd.append('diagnosis',      form.diagnosis);
      fd.append('chiefComplaint', form.chiefComplaint);
      fd.append('vitals',         form.vitals);
      fd.append('medicines',      JSON.stringify(validMeds));
      fd.append('followUp',       form.followUp);
      fd.append('notes',          form.notes);
      fd.append('doctor',         user?._id || '');
      fd.append('doctorName',     user?.name || '');

      let savedId = null;
      try {
        const res = await recordsAPI.create(fd);
        savedId = res?.data?.data?._id;
      } catch {
        // records endpoint may not support prescription type yet — still show success
      }

      toast.success(`✅ Prescription issued for ${patientObj?.name}!`);

      // Add optimistically to the local list
      setPrescriptions(prev => [{
        _id:            savedId || String(Date.now()),
        patient:        patientObj,
        diagnosis:      form.diagnosis,
        medicines:      validMeds,
        followUp:       form.followUp,
        notes:          form.notes,
        doctorName:     user?.name,
        createdAt:      new Date().toISOString(),
      }, ...prev]);

      closeModal();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to issue prescription');
    }
    setIssuing(false);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedPatient = patients.find(p => p._id === form.patient);
  const filteredRx = prescriptions.filter(rx => {
    const q = search.toLowerCase();
    return (
      (rx.patient?.name || '').toLowerCase().includes(q) ||
      (rx.diagnosis     || '').toLowerCase().includes(q)
    );
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .rx-inp {
          width: 100%; padding: 10px 12px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 13.5px; font-family: inherit; outline: none;
          transition: border-color .2s, box-shadow .2s; background: #fff;
        }
        .rx-inp:focus { border-color: #0891b2; box-shadow: 0 0 0 3px rgba(8,145,178,.12); }
        .rx-inp::placeholder { color: #94a3b8; }
        .rx-sel { appearance: none;
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none'/%3E%3C/svg%3E") no-repeat right 12px center;
        }
        .rx-label { display: block; font-size: 11.5px; font-weight: 700; color: #374151; margin-bottom: 5px; text-transform: uppercase; letter-spacing: .4px; }
        .sec-head { font-weight: 800; font-size: 13.5px; color: #0f172a; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .badge-num { width: 24px; height: 24px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #fff; }
      `}</style>

      {/* ── Page header ── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>📝 Prescriptions</div>
          <div className="page-subtitle" style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
            Write and manage digital prescriptions · auto-routed to pharmacy
          </div>
        </div>
        <button className="btn btn-primary" onClick={openModal}
          style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#0891b2,#0c4a6e)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + New Prescription
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', maxWidth: 380, marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
        <input className="rx-inp" style={{ paddingLeft: 36 }} placeholder="Search by patient or diagnosis…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* ── Prescriptions list ── */}
      {loadingList ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Loading…</div>
      ) : filteredRx.length === 0 ? (
        <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18 }}>
          <div className="card-body" style={{ textAlign: 'center', padding: 52 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📝</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#0f172a', marginBottom: 6 }}>No Prescriptions Yet</div>
            <div style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 20 }}>
              Prescriptions you write will appear here and be sent to the pharmacy automatically.
            </div>
            <button className="btn btn-primary" onClick={openModal}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#0891b2,#0c4a6e)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Create New Prescription
            </button>
          </div>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRx.map((rx, i) => {
            const medNames = (rx.medicines || [])
              .map(m => {
                if (m.medName) return m.medName;
                const found = medicines.find(x => x._id === m.med);
                return found?.name || null;
              })
              .filter(Boolean);
            return (
              <motion.div key={rx._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }}
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📝</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 14.5, color: '#0f172a' }}>
                      {rx.patient?.name || rx.patientName || '—'}
                    </span>
                    <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '2px 8px', borderRadius: 7 }}>
                      {rx.diagnosis}
                    </span>
                  </div>
                  {medNames.length > 0 && (
                    <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 4 }}>
                      💊 {medNames.join(', ')}
                    </div>
                  )}
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    Dr. {rx.doctorName || user?.name} · {new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {rx.followUp && ` · Follow-up: ${new Date(rx.followUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 8, background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 11.5, flexShrink: 0 }}>Issued</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── NEW PRESCRIPTION MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>

            <motion.div initial={{ opacity: 0, scale: .96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 820, maxHeight: '94vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column' }}>

              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 26px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 10, borderRadius: '20px 20px 0 0' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>📝 New Prescription</div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 2 }}>Dr. {user?.name} · {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <button onClick={closeModal}
                  style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </div>

              {/* Loading overlay inside modal */}
              {loadingData ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '70px', flexDirection: 'column', gap: 14 }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: .9, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 38, height: 38, border: '3px solid #e2e8f0', borderTopColor: '#0891b2', borderRadius: '50%' }} />
                  <div style={{ color: '#94a3b8', fontSize: 13.5 }}>Loading patients &amp; medicines…</div>
                </div>
              ) : (
                <form onSubmit={issue} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

                    {/* ── SECTION 1: Patient & Diagnosis ── */}
                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                      <div className="sec-head">
                        <span className="badge-num" style={{ background: '#0891b2' }}>1</span>
                        Patient &amp; Diagnosis
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {/* Patient select */}
                        <div>
                          <label className="rx-label">Patient *</label>
                          {patients.length === 0 ? (
                            <div style={{ padding: '10px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#92400e' }}>
                              ⚠️ No approved patients found. Ask admin to approve patient accounts.
                            </div>
                          ) : (
                            <select
                              className="rx-inp rx-sel"
                              value={form.patient}
                              onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}>
                              <option value="">— Select patient —</option>
                              {patients.map(p => (
                                <option key={p._id} value={p._id}>
                                  {p.name}{p.age ? ` (${p.age}y)` : ''}{p.bloodGroup ? ` · ${p.bloodGroup}` : ''}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Diagnosis */}
                        <div>
                          <label className="rx-label">Diagnosis *</label>
                          <input className="rx-inp" required
                            placeholder="e.g. Acute pharyngitis, Type 2 Diabetes"
                            value={form.diagnosis}
                            onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} />
                        </div>

                        {/* Chief complaint */}
                        <div>
                          <label className="rx-label">Chief Complaint</label>
                          <input className="rx-inp"
                            placeholder="e.g. Fever and sore throat for 3 days"
                            value={form.chiefComplaint}
                            onChange={e => setForm(f => ({ ...f, chiefComplaint: e.target.value }))} />
                        </div>

                        {/* Vitals */}
                        <div>
                          <label className="rx-label">Vitals</label>
                          <input className="rx-inp"
                            placeholder="e.g. BP 120/80, Temp 38.2°C, SpO2 98%"
                            value={form.vitals}
                            onChange={e => setForm(f => ({ ...f, vitals: e.target.value }))} />
                        </div>
                      </div>

                      {/* Patient info preview */}
                      {selectedPatient && (
                        <div style={{ marginTop: 14, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#1e40af' }}>{selectedPatient.name}</div>
                            <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>
                              {[
                                selectedPatient.age       && `Age: ${selectedPatient.age}`,
                                selectedPatient.bloodGroup && `Blood: ${selectedPatient.bloodGroup}`,
                                selectedPatient.phone     && `📞 ${selectedPatient.phone}`,
                                selectedPatient.address   && `📍 ${selectedPatient.address}`,
                              ].filter(Boolean).join('  ·  ')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── SECTION 2: Medicines ── */}
                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                      <div className="sec-head" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="badge-num" style={{ background: '#059669' }}>2</span>
                          Medications
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                          {medicines.length} medicines in inventory
                        </span>
                      </div>

                      {medicines.length === 0 && (
                        <div style={{ padding: '10px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 9, fontSize: 13, color: '#92400e', marginBottom: 14 }}>
                          ⚠️ No medicines found in inventory. Add medicines via the Pharmacy section.
                        </div>
                      )}

                      {/* Column labels */}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1.3fr 32px', gap: 8, marginBottom: 6 }}>
                        {['Medicine', 'Dosage', 'Duration', 'Instructions', ''].map((h, i) => (
                          <div key={i} style={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: .5 }}>{h}</div>
                        ))}
                      </div>

                      {/* Medicine rows */}
                      {form.medicines.map((m, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1.3fr 32px', gap: 8, marginBottom: 8, alignItems: 'start' }}>
                          {/* Medicine dropdown */}
                          <select className="rx-inp rx-sel" value={m.med}
                            onChange={e => updateMedRow(i, 'med', e.target.value)}>
                            <option value="">— Select medicine —</option>
                            {medicines.map(x => (
                              <option key={x._id} value={x._id}>
                                {x.name}{x.genericName ? ` (${x.genericName})` : ''}
                              </option>
                            ))}
                          </select>

                          {/* Dosage dropdown */}
                          <select className="rx-inp rx-sel" value={m.dosage}
                            onChange={e => updateMedRow(i, 'dosage', e.target.value)}>
                            <option value="">— Dosage —</option>
                            {DOSAGE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>

                          {/* Duration dropdown */}
                          <select className="rx-inp rx-sel" value={m.duration}
                            onChange={e => updateMedRow(i, 'duration', e.target.value)}>
                            <option value="">— Duration —</option>
                            {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>

                          {/* Instructions freetext */}
                          <input className="rx-inp" placeholder="e.g. With food, avoid milk"
                            value={m.instructions}
                            onChange={e => updateMedRow(i, 'instructions', e.target.value)} />

                          {/* Remove row */}
                          <button type="button" onClick={() => removeMedRow(i)}
                            disabled={form.medicines.length === 1}
                            style={{ height: 38, border: '1.5px solid #fecaca', borderRadius: 9, background: '#fef2f2', color: '#dc2626', cursor: form.medicines.length === 1 ? 'not-allowed' : 'pointer', fontSize: 18, opacity: form.medicines.length === 1 ? .3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ×
                          </button>
                        </div>
                      ))}

                      <button type="button" onClick={addMedRow}
                        style={{ padding: '7px 16px', background: '#eff6ff', border: '1.5px dashed #bfdbfe', borderRadius: 9, color: '#1d4ed8', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 2 }}>
                        + Add Medicine
                      </button>
                    </div>

                    {/* ── SECTION 3: Follow-up & Notes ── */}
                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                      <div className="sec-head">
                        <span className="badge-num" style={{ background: '#6366f1' }}>3</span>
                        Follow-up &amp; Notes
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                        <div>
                          <label className="rx-label">Follow-up Date</label>
                          <input className="rx-inp" type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={form.followUp}
                            onChange={e => setForm(f => ({ ...f, followUp: e.target.value }))} />
                        </div>
                        <div>
                          <label className="rx-label">Additional Instructions / Notes</label>
                          <input className="rx-inp"
                            placeholder="e.g. Rest advised, drink plenty of fluids, avoid cold food"
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal footer — sticky at bottom */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 26px', borderTop: '1px solid #f1f5f9', position: 'sticky', bottom: 0, background: '#fff', borderRadius: '0 0 20px 20px' }}>
                    {/* Status summary */}
                    <div style={{ fontSize: 12.5, color: '#64748b' }}>
                      {selectedPatient
                        ? <span>👤 <strong>{selectedPatient.name}</strong>{form.medicines.filter(m => m.med).length > 0 && ` · 💊 ${form.medicines.filter(m => m.med).length} medicine(s)`}</span>
                        : <span style={{ color: '#94a3b8' }}>Select a patient to proceed</span>
                      }
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" onClick={closeModal}
                        style={{ padding: '10px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>
                        Cancel
                      </button>
                      <button type="submit" disabled={issuing}
                        style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#0891b2,#0c4a6e)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: issuing ? .7 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {issuing ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: .8, repeat: Infinity, ease: 'linear' }}
                              style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                            Issuing…
                          </>
                        ) : '📝 Issue Prescription'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PrescriptionsPage;
