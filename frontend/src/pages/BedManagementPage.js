import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { facilityAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WARDS = ['General', 'ICU', 'CCU', 'Maternity', 'Paediatric', 'Surgical', 'Orthopaedic', 'Emergency'];
const STATUS_CFG = {
  available:   { label: 'Available',    bg: '#dcfce7', c: '#15803d', dot: '#22c55e' },
  occupied:    { label: 'Occupied',     bg: '#fee2e2', c: '#dc2626', dot: '#ef4444' },
  reserved:    { label: 'Reserved',     bg: '#fef3c7', c: '#92400e', dot: '#f59e0b' },
  cleaning:    { label: 'Cleaning',     bg: '#e0f2fe', c: '#0369a1', dot: '#0891b2' },
  maintenance: { label: 'Maintenance',  bg: '#f3e8ff', c: '#7c3aed', dot: '#8b5cf6' },
};

function BedCard({ bed, onUpdate, patients }) {
  const cfg = STATUS_CFG[bed.status] || STATUS_CFG.available;
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(bed.status);
  const [selectedPatient, setSelectedPatient] = useState(bed.patient?._id || bed.patient || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await facilityAPI.updateRoom(bed._id, {
        status: newStatus,
        patient: newStatus === 'occupied' ? selectedPatient : null,
      });
      toast.success(`Bed ${bed.number} updated`);
      onUpdate();
      setOpen(false);
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  return (
    <motion.div whileHover={{ y: -2 }} style={{ background: '#fff', border: `2px solid ${bed.status === 'available' ? '#e2e8f0' : cfg.c + '40'}`, borderRadius: 14, padding: '14px', cursor: 'pointer', position: 'relative' }}
      onClick={() => setOpen(true)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>🛏 {bed.number}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, borderRadius: 8, padding: '3px 9px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: cfg.c }}>{cfg.label}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{bed.ward || bed.type || 'General'} Ward</div>
      {bed.patient?.name && (
        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: '#0f172a', background: '#f8fafc', borderRadius: 7, padding: '4px 8px' }}>
          👤 {bed.patient.name}
        </div>
      )}
      {bed.notes && <div style={{ marginTop: 6, fontSize: 11, color: '#94a3b8' }}>{bed.notes}</div>}

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => { e.stopPropagation(); setOpen(false); }}>
            <motion.div initial={{ scale: .95 }} animate={{ scale: 1 }} exit={{ scale: .95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 18, padding: '24px', width: '100%', maxWidth: 400 }}>
              <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 18, color: '#0f172a' }}>🛏 Bed {bed.number} — {bed.ward || bed.type}</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase' }}>Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                  {Object.entries(STATUS_CFG).map(([key, c]) => (
                    <button key={key} type="button" onClick={() => setNewStatus(key)}
                      style={{ padding: '7px 4px', borderRadius: 9, border: `1.5px solid ${newStatus === key ? c.c : '#e2e8f0'}`, background: newStatus === key ? c.bg : '#f8fafc', cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: newStatus === key ? c.c : '#64748b' }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              {newStatus === 'occupied' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 5, textTransform: 'uppercase' }}>Assign Patient</label>
                  <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13.5, outline: 'none' }}>
                    <option value="">— Select patient —</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setOpen(false)} style={{ padding: '9px 18px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 9, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
                <button onClick={save} disabled={saving} style={{ padding: '9px 18px', background: 'linear-gradient(135deg,#0891b2,#0c4a6e)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: saving ? .7 : 1 }}>
                  {saving ? 'Saving…' : '✅ Update'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function BedManagementPage() {
  const { user } = useAuth();
  const [beds, setBeds]         = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterWard, setWard]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const load = useCallback(async () => {
    setLoading(true);
    const [bRes, pRes] = await Promise.allSettled([
      facilityAPI.getRooms(),
      usersAPI.getAll({ role: 'patient', status: 'approved', limit: 200 }),
    ]);
    if (bRes.status === 'fulfilled') setBeds(bRes.value?.data?.data || []);
    if (pRes.status === 'fulfilled') setPatients(pRes.value?.data?.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = beds.filter(b => {
    const ward = b.ward || b.type || 'General';
    if (filterWard !== 'All' && ward !== filterWard) return false;
    if (filterStatus !== 'All' && b.status !== filterStatus) return false;
    return true;
  });

  const stats = Object.entries(STATUS_CFG).map(([key, cfg]) => ({
    key, label: cfg.label, val: beds.filter(b => b.status === key).length, ...cfg,
  }));
  const occupancyPct = beds.length ? Math.round((beds.filter(b => b.status === 'occupied').length / beds.length) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>🛏 Bed Management</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>Real-time bed availability · {beds.length} total beds · {occupancyPct}% occupancy</div>
        </div>
        <button onClick={load} style={{ padding: '9px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#475569', fontSize: 13 }}>🔄 Refresh</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.key} style={{ background: s.bg, border: `1px solid ${s.c}25`, borderRadius: 13, padding: '14px', textAlign: 'center', cursor: 'pointer', transition: 'transform .15s' }}
            onClick={() => setFilterStatus(filterStatus === s.key ? 'All' : s.key)}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.c }}>{s.val}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.c, opacity: .8 }}>{s.label}</div>
          </div>
        ))}
        <div style={{ background: 'linear-gradient(135deg,#0891b2,#0c4a6e)', borderRadius: 13, padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{occupancyPct}%</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>Occupancy</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {['All', ...WARDS].map(w => (
          <button key={w} onClick={() => setWard(w)}
            style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${filterWard === w ? '#0891b2' : '#e2e8f0'}`, background: filterWard === w ? '#e0f2fe' : '#fff', color: filterWard === w ? '#0369a1' : '#64748b', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
            {w}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner-lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🛏</div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 16 }}>No beds found</div>
          <div style={{ color: '#94a3b8', marginTop: 4, fontSize: 13 }}>Beds are added via the Rooms &amp; OT section.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
          {filtered.map(b => <BedCard key={b._id} bed={b} onUpdate={load} patients={patients} />)}
        </div>
      )}
    </div>
  );
}
