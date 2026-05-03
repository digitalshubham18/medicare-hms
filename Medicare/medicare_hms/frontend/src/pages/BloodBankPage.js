import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

const INITIAL_STOCK = {
  'A+':14,'A-':6,'B+':18,'B-':4,'AB+':8,'AB-':2,'O+':22,'O-':7,
};

const GROUP_COLOR = {
  'A+':'#ef4444','A-':'#f97316','B+':'#3b82f6','B-':'#6366f1',
  'AB+':'#8b5cf6','AB-':'#ec4899','O+':'#059669','O-':'#0891b2',
};

const CRITICAL = 5;
const LOW      = 10;

function StockLevel({ units }) {
  if (units <= CRITICAL) return { label:'Critical', bg:'#fee2e2', c:'#dc2626' };
  if (units <= LOW)      return { label:'Low',      bg:'#fef3c7', c:'#d97706' };
  return                        { label:'Adequate', bg:'#dcfce7', c:'#15803d' };
}

export default function BloodBankPage() {
  const { user } = useAuth();
  const isAdmin = ['admin','nurse','doctor'].includes(user?.role);

  const [stock,     setStock]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('hms_bloodstock')) || INITIAL_STOCK; }
    catch { return INITIAL_STOCK; }
  });
  const [requests,  setRequests]  = useState([]);
  const [showReq,   setShowReq]   = useState(false);
  const [showAdd,   setShowAdd]   = useState(false);
  const [reqForm,   setReqForm]   = useState({ bloodGroup:'A+', units:1, reason:'', urgency:'routine', patientName:'' });
  const [addForm,   setAddForm]   = useState({ bloodGroup:'A+', units:1, donorName:'', donorId:'' });
  const [tab,       setTab]       = useState('stock');

  useEffect(() => {
    localStorage.setItem('hms_bloodstock', JSON.stringify(stock));
  }, [stock]);

  const submitRequest = (e) => {
    e.preventDefault();
    if (!reqForm.patientName) { toast.error('Patient name required'); return; }
    const id = String(Date.now());
    const newReq = { id, ...reqForm, requestedBy: user?.name, requestedAt: new Date().toISOString(), status:'pending' };
    setRequests(r => [newReq, ...r]);
    toast.success(`✅ Blood request placed — ${reqForm.units} unit(s) of ${reqForm.bloodGroup}`);
    setShowReq(false);
    setReqForm({ bloodGroup:'A+', units:1, reason:'', urgency:'routine', patientName:'' });
  };

  const addDonation = (e) => {
    e.preventDefault();
    if (!addForm.donorName) { toast.error('Donor name required'); return; }
    setStock(s => ({ ...s, [addForm.bloodGroup]: (s[addForm.bloodGroup] || 0) + Number(addForm.units) }));
    toast.success(`✅ ${addForm.units} unit(s) of ${addForm.bloodGroup} added`);
    setShowAdd(false);
    setAddForm({ bloodGroup:'A+', units:1, donorName:'', donorId:'' });
  };

  const approveRequest = (id) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    if ((stock[req.bloodGroup] || 0) < req.units) {
      toast.error(`Insufficient ${req.bloodGroup} stock`); return;
    }
    setStock(s => ({ ...s, [req.bloodGroup]: s[req.bloodGroup] - req.units }));
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status:'approved', approvedAt: new Date().toISOString() } : r));
    toast.success('Request approved — stock updated');
  };

  const rejectRequest = (id) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status:'rejected' } : r));
    toast('Request rejected');
  };

  const totalUnits = Object.values(stock).reduce((s, v) => s + v, 0);
  const criticalGroups = BLOOD_GROUPS.filter(g => (stock[g] || 0) <= CRITICAL);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const TABS = [
    { id:'stock',    label:'🩸 Stock' },
    { id:'requests', label:`📋 Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id:'history',  label:'📜 History' },
  ];

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:900, color:'#0f172a' }}>🩸 Blood Bank</div>
          <div style={{ fontSize:13, color:'#94a3b8', marginTop:3 }}>Manage blood inventory, donations &amp; patient requests</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setShowReq(true)}
            style={{ padding:'9px 18px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', borderRadius:11, color:'#fff', fontSize:13.5, fontWeight:700, cursor:'pointer' }}>
            🩸 Request Blood
          </button>
          {isAdmin && (
            <button onClick={() => setShowAdd(true)}
              style={{ padding:'9px 18px', background:'linear-gradient(135deg,#059669,#047857)', border:'none', borderRadius:11, color:'#fff', fontSize:13.5, fontWeight:700, cursor:'pointer' }}>
              + Add Donation
            </button>
          )}
        </div>
      </div>

      {/* Critical alert */}
      {criticalGroups.length > 0 && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'12px 18px', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
          <motion.span animate={{ scale:[1,1.2,1] }} transition={{ duration:1, repeat:Infinity }} style={{ fontSize:20 }}>⚠️</motion.span>
          <div>
            <span style={{ fontWeight:700, color:'#dc2626', fontSize:13.5 }}>Critical stock: </span>
            <span style={{ color:'#ef4444', fontSize:13 }}>{criticalGroups.join(', ')} — Immediate replenishment needed</span>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
        {[
          { label:'Total Units',   val:totalUnits,                                         bg:'#eff6ff', c:'#1d4ed8' },
          { label:'Adequate',      val:BLOOD_GROUPS.filter(g=>(stock[g]||0)>LOW).length,  bg:'#dcfce7', c:'#15803d' },
          { label:'Low Stock',     val:BLOOD_GROUPS.filter(g=>(stock[g]||0)>CRITICAL&&(stock[g]||0)<=LOW).length, bg:'#fef3c7', c:'#d97706' },
          { label:'Critical',      val:criticalGroups.length,                              bg:'#fee2e2', c:'#dc2626' },
          { label:'Pending Reqs',  val:pendingCount,                                       bg:'#f5f3ff', c:'#7c3aed' },
        ].map((s,i) => (
          <div key={i} style={{ background:s.bg, border:`1px solid ${s.c}20`, borderRadius:13, padding:'14px', textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:900, color:s.c }}>{s.val}</div>
            <div style={{ fontSize:11.5, fontWeight:700, color:s.c, opacity:.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:18, background:'#f1f5f9', padding:4, borderRadius:12, width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'8px 18px', borderRadius:9, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all .18s', background:tab===t.id?'#fff':'transparent', color:tab===t.id?'#0f172a':'#64748b', boxShadow:tab===t.id?'0 1px 6px rgba(0,0,0,.09)':'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stock Tab */}
      {tab === 'stock' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
          {BLOOD_GROUPS.map(g => {
            const units = stock[g] || 0;
            const lvl = StockLevel({ units });
            const pct = Math.min((units / 30) * 100, 100);
            return (
              <motion.div key={g} whileHover={{ y:-3 }}
                style={{ background:'#fff', border:`2px solid ${GROUP_COLOR[g]}30`, borderRadius:16, padding:'20px', textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${GROUP_COLOR[g]},${GROUP_COLOR[g]}80)`, borderRadius:'14px 14px 0 0' }} />
                <div style={{ fontSize:32, fontWeight:900, color:GROUP_COLOR[g], marginBottom:4 }}>{g}</div>
                <div style={{ fontSize:36, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{units}</div>
                <div style={{ fontSize:12, color:'#94a3b8', marginBottom:10 }}>units available</div>
                {/* Stock bar */}
                <div style={{ height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden', marginBottom:8 }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:.7, ease:'easeOut' }}
                    style={{ height:'100%', background:GROUP_COLOR[g], borderRadius:3 }} />
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, background:lvl.bg, color:lvl.c }}>{lvl.label}</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {requests.filter(r => r.status === 'pending').length === 0 && (
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'48px', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:10 }}>📋</div>
              <div style={{ fontWeight:700, color:'#0f172a', fontSize:15 }}>No pending requests</div>
            </div>
          )}
          {requests.filter(r => r.status === 'pending').map(r => {
            const urg = r.urgency === 'urgent' ? { bg:'#fef3c7', c:'#d97706' } : r.urgency === 'stat' ? { bg:'#fee2e2', c:'#dc2626' } : { bg:'#f1f5f9', c:'#64748b' };
            return (
              <div key={r.id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:13, padding:'16px 20px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${GROUP_COLOR[r.bloodGroup]}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:900, color:GROUP_COLOR[r.bloodGroup], flexShrink:0 }}>{r.bloodGroup}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:2 }}>{r.patientName} — {r.units} unit(s) of {r.bloodGroup}</div>
                  <div style={{ fontSize:12.5, color:'#64748b' }}>Requested by {r.requestedBy} · {new Date(r.requestedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                  {r.reason && <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{r.reason}</div>}
                </div>
                <span style={{ padding:'3px 10px', borderRadius:8, fontSize:11.5, fontWeight:700, background:urg.bg, color:urg.c }}>{r.urgency}</span>
                {isAdmin && (
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => approveRequest(r.id)} style={{ padding:'7px 14px', background:'#d1fae5', border:'none', borderRadius:8, color:'#065f46', fontWeight:700, fontSize:12.5, cursor:'pointer' }}>✅ Approve</button>
                    <button onClick={() => rejectRequest(r.id)} style={{ padding:'7px 14px', background:'#fee2e2', border:'none', borderRadius:8, color:'#dc2626', fontWeight:700, fontSize:12.5, cursor:'pointer' }}>✕ Reject</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {requests.length === 0 ? (
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'48px', textAlign:'center', color:'#94a3b8', fontSize:13 }}>No request history yet</div>
          ) : requests.map(r => {
            const sc = { pending:'#f59e0b', approved:'#22c55e', rejected:'#ef4444' }[r.status] || '#94a3b8';
            return (
              <div key={r.id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'13px 18px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`${GROUP_COLOR[r.bloodGroup]}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:GROUP_COLOR[r.bloodGroup] }}>{r.bloodGroup}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13.5, color:'#0f172a' }}>{r.patientName} — {r.units} unit(s)</div>
                  <div style={{ fontSize:11.5, color:'#94a3b8' }}>By {r.requestedBy} · {new Date(r.requestedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                </div>
                <span style={{ padding:'3px 10px', borderRadius:8, fontSize:11.5, fontWeight:700, background:`${sc}20`, color:sc, textTransform:'capitalize' }}>{r.status}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal */}
      <AnimatePresence>
        {showReq && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowReq(false); }}>
            <motion.div initial={{ scale:.96 }} animate={{ scale:1 }} exit={{ scale:.96 }} onClick={e => e.stopPropagation()}
              style={{ background:'#fff', borderRadius:20, padding:'26px', width:'100%', maxWidth:420 }}>
              <h3 style={{ margin:'0 0 20px', fontWeight:900, fontSize:18, color:'#0f172a' }}>🩸 Request Blood</h3>
              <form onSubmit={submitRequest} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Patient Name *</label>
                  <input required value={reqForm.patientName} onChange={e => setReqForm(f=>({...f,patientName:e.target.value}))} placeholder="Enter patient name"
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Blood Group *</label>
                    <select value={reqForm.bloodGroup} onChange={e => setReqForm(f=>({...f,bloodGroup:e.target.value}))}
                      style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }}>
                      {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Units *</label>
                    <input type="number" min={1} max={10} value={reqForm.units} onChange={e => setReqForm(f=>({...f,units:Number(e.target.value)}))}
                      style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Urgency</label>
                    <select value={reqForm.urgency} onChange={e => setReqForm(f=>({...f,urgency:e.target.value}))}
                      style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }}>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="stat">STAT</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Reason</label>
                  <input value={reqForm.reason} onChange={e => setReqForm(f=>({...f,reason:e.target.value}))} placeholder="Clinical reason for request"
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                </div>
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
                  <button type="button" onClick={() => setShowReq(false)} style={{ padding:'10px 20px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:9, fontWeight:600, cursor:'pointer', color:'#475569' }}>Cancel</button>
                  <button type="submit" style={{ padding:'10px 20px', background:'linear-gradient(135deg,#dc2626,#b91c1c)', border:'none', borderRadius:9, color:'#fff', fontWeight:700, cursor:'pointer' }}>🩸 Submit Request</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Donation Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
            <motion.div initial={{ scale:.96 }} animate={{ scale:1 }} exit={{ scale:.96 }} onClick={e => e.stopPropagation()}
              style={{ background:'#fff', borderRadius:20, padding:'26px', width:'100%', maxWidth:380 }}>
              <h3 style={{ margin:'0 0 20px', fontWeight:900, fontSize:18, color:'#0f172a' }}>+ Add Donation</h3>
              <form onSubmit={addDonation} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Donor Name *</label>
                  <input required value={addForm.donorName} onChange={e => setAddForm(f=>({...f,donorName:e.target.value}))} placeholder="Full name of donor"
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Donor ID</label>
                  <input value={addForm.donorId} onChange={e => setAddForm(f=>({...f,donorId:e.target.value}))} placeholder="ID / Aadhar no."
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Blood Group</label>
                    <select value={addForm.bloodGroup} onChange={e => setAddForm(f=>({...f,bloodGroup:e.target.value}))}
                      style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }}>
                      {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Units</label>
                    <input type="number" min={1} max={5} value={addForm.units} onChange={e => setAddForm(f=>({...f,units:Number(e.target.value)}))}
                      style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
                  <button type="button" onClick={() => setShowAdd(false)} style={{ padding:'10px 20px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:9, fontWeight:600, cursor:'pointer', color:'#475569' }}>Cancel</button>
                  <button type="submit" style={{ padding:'10px 20px', background:'linear-gradient(135deg,#059669,#047857)', border:'none', borderRadius:9, color:'#fff', fontWeight:700, cursor:'pointer' }}>✅ Add Units</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
