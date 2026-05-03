// import React, { useState, useEffect, useCallback } from 'react';
// import { motion } from 'framer-motion';
// import { appointmentsAPI, usersAPI } from '../utils/api';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';

// const STATUS_BADGE = { confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger', completed: 'badge-primary', 'no-show': 'badge-gray' };

// export default function AppointmentsPage() {
//   const { user } = useAuth();
//   const [appointments, setAppointments] = useState([]);
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterStatus, setFilterStatus] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [slots, setSlots] = useState([]);
//   const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '', department: 'Cardiology', type: 'Consultation', notes: '' });
//   const [submitting, setSubmitting] = useState(false);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [apptRes, docRes] = await Promise.all([
//         appointmentsAPI.getAll(filterStatus ? { status: filterStatus } : {}),
//         usersAPI.getAll({ role: 'doctor', status: 'approved' }),
//       ]);
//       setAppointments(apptRes.value?.data?.data || []);
//       setDoctors(docRes.value?.data?.data || []);
//       if (docRes.value?.data?.data?.length) setForm(f => ({ ...f, doctorId: docRes.value?.data?.data[0]._id }));
//     } catch (err) { toast.error('Failed to load appointments'); }
//     setLoading(false);
//   }, [filterStatus]);

//   useEffect(() => { load(); }, [load]);

//   const fetchSlots = async (doctorId, date) => {
//     if (!doctorId || !date) return;
//     try {
//       const res = await appointmentsAPI.getSlots(doctorId, date);
//       setSlots(res.data.data?.available || []);
//       if (res.data.data?.available?.length) setForm(f => ({ ...f, timeSlot: res.data.data.available[0] }));
//     } catch { setSlots([]); }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.doctorId || !form.date || !form.timeSlot) { toast.error('Please fill all required fields'); return; }
//     setSubmitting(true);
//     try {
//       await appointmentsAPI.create(form);
//       toast.success('Appointment booked successfully!');
//       setShowModal(false);
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || 'Booking failed'); }
//     setSubmitting(false);
//   };

//   const handleStatusChange = async (id, status) => {
//     try {
//       await appointmentsAPI.update(id, { status });
//       toast.success(`Appointment ${status}`);
//       load();
//     } catch { toast.error('Update failed'); }
//   };

//   const DEPTS = ['Cardiology','Neurology','Orthopedics','General','Pediatrics','Dermatology','Gastroenterology'];
//   const TYPES = ['Consultation','Follow-up','Emergency','Surgery Consult','Checkup','X-Ray Review'];

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">Appointment Management</div>
//           <div className="page-subtitle">Schedule and manage all appointments</div>
//         </div>
//         <div className="page-actions">
//           <select className="form-input" style={{ width: 140, padding: '8px 28px 8px 10px', fontSize: 13 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
//             <option value="">All Status</option>
//             {['confirmed','pending','cancelled','completed'].map(s => <option key={s}>{s}</option>)}
//           </select>
//           <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Book Appointment</button>
//         </div>
//       </div>

//       <div className="grid-2 mb-3">
//         {[
//           { label: 'Total', val: appointments.length, icon: '📅', color: '#e8effe' },
//           { label: 'Confirmed', val: appointments.filter(a => a.status === 'confirmed').length, icon: '✅', color: '#ecfdf5' },
//           { label: 'Pending', val: appointments.filter(a => a.status === 'pending').length, icon: '⏳', color: '#fffbeb' },
//           { label: 'Cancelled', val: appointments.filter(a => a.status === 'cancelled').length, icon: '❌', color: '#fef2f2' },
//         ].map((s, i) => (
//           <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
//             <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
//             <div className="stat-value">{s.val}</div>
//             <div className="stat-label">{s.label}</div>
//           </motion.div>
//         ))}
//       </div>

//       <motion.div className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//         <div className="card-body-0">
//           {loading ? (
//             <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner-lg" style={{ margin: '0 auto' }} /></div>
//           ) : (
//             <div className="table-wrap">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Patient</th><th>Doctor</th><th>Department</th>
//                     <th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {appointments.length === 0 ? (
//                     <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No appointments found</td></tr>
//                   ) : appointments.map(a => (
//                     <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                       <td><div className="td-main">{a.patient?.name}</div><div className="td-sub">{a.patient?.phone}</div></td>
//                       <td className="text-sm">{a.doctor?.name}<div className="td-sub">{a.doctor?.specialization}</div></td>
//                       <td><span className="badge badge-teal">{a.department}</span></td>
//                       <td className="text-sm">{new Date(a.date).toLocaleDateString()}<br /><span className="text-xs text-muted">{a.timeSlot}</span></td>
//                       <td><span className="badge badge-primary">{a.type}</span></td>
//                       <td><span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`}>{a.status}</span></td>
//                       <td>
//                         <div className="flex gap-1">
//                           {a.status === 'pending' && ['admin','doctor'].includes(user?.role) && (
//                             <button className="btn btn-success btn-xs" onClick={() => handleStatusChange(a._id, 'confirmed')}>✓ Approve</button>
//                           )}
//                           {a.status !== 'cancelled' && a.status !== 'completed' && (
//                             <button className="btn btn-outline btn-xs" onClick={() => handleStatusChange(a._id, 'cancelled')}>✗</button>
//                           )}
//                         </div>
//                       </td>
//                     </motion.tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </motion.div>

//       {showModal && (
//         <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
//           <motion.div className="modal-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
//             <div className="modal-header">
//               <span className="modal-title">📅 Book Appointment</span>
//               <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">
//                 <div className="form-row">
//                   <div className="form-group">
//                     <label className="form-label">Doctor *</label>
//                     <select className="form-input" value={form.doctorId} onChange={e => { setForm(f => ({ ...f, doctorId: e.target.value })); if (form.date) fetchSlots(e.target.value, form.date); }}>
//                       {doctors.map(d => <option key={d._id} value={d._id}>{d.name} – {d.specialization}</option>)}
//                     </select>
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Department *</label>
//                     <select className="form-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
//                       {DEPTS.map(d => <option key={d}>{d}</option>)}
//                     </select>
//                   </div>
//                 </div>
//                 <div className="form-row">
//                   <div className="form-group">
//                     <label className="form-label">Date *</label>
//                     <input className="form-input" type="date" min={new Date().toISOString().split('T')[0]} value={form.date}
//                       onChange={e => { setForm(f => ({ ...f, date: e.target.value })); fetchSlots(form.doctorId, e.target.value); }} />
//                   </div>
//                   <div className="form-group">
//                     <label className="form-label">Time Slot *</label>
//                     {slots.length > 0 ? (
//                       <select className="form-input" value={form.timeSlot} onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))}>
//                         {slots.map(s => <option key={s}>{s}</option>)}
//                       </select>
//                     ) : (
//                       <input className="form-input" placeholder={form.date ? 'No slots available' : 'Select date first'} disabled />
//                     )}
//                   </div>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Appointment Type</label>
//                   <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
//                     {TYPES.map(t => <option key={t}>{t}</option>)}
//                   </select>
//                 </div>
//                 <div className="form-group">
//                   <label className="form-label">Notes</label>
//                   <textarea className="form-input" rows={2} placeholder="Additional notes or symptoms…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
//                 </div>
//                 {slots.length > 0 && (
//                   <div style={{ background: '#ecfdf5', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#065f46' }}>
//                     ✅ {slots.length} slot(s) available for this date
//                   </div>
//                 )}
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={submitting}>
//                   {submitting ? <><span className="spinner-sm" /> Booking…</> : '📅 Confirm Booking'}
//                 </button>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appointmentsAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';

const STATUS_BADGE = { confirmed:'badge-success', pending:'badge-warning', cancelled:'badge-danger', completed:'badge-primary', 'no-show':'badge-gray' };
const DEPTS = ['Cardiology','Neurology','Orthopedics','General Medicine','Pediatrics','Dermatology','Psychiatry','Gynecology','Oncology','Surgery','ENT'];
const TYPES = ['Consultation','Follow-up','Emergency','Surgery Consult','Checkup','X-Ray Review'];
const FEES  = { Cardiology:800, Neurology:900, Orthopedics:700, Psychiatry:1000, Surgery:1500, General:500, default:600 };

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ doctorId:'', date:'', timeSlot:'', department:'Cardiology', type:'Consultation', notes:'', symptoms:'' });
  const [submitting, setSubmitting] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null); // { appointmentId, amount, description }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [apptRes, docRes] = await Promise.allSettled([
        appointmentsAPI.getAll(filterStatus ? { status: filterStatus } : {}),
        usersAPI.getAll({ role:'doctor', status:'approved' }),
      ]);
      setAppointments(apptRes.value?.data?.data || []);
      setDoctors(docRes.value?.data?.data || []);
      if (docRes.value?.data?.data?.length) setForm(f => ({ ...f, doctorId: docRes.value?.data?.data[0]._id }));
    } catch { toast.error('Failed to load appointments'); }
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const fetchSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      const res = await appointmentsAPI.getSlots(doctorId, date);
      setSlots(res.data.data?.available || []);
      if (res.data.data?.available?.length) setForm(f => ({ ...f, timeSlot: res.data.data.available[0] }));
    } catch { setSlots([]); }
  };

  // Step 1: create appointment (pending), then open payment
  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.date || !form.timeSlot) { toast.error('Please fill all required fields'); return; }
    setSubmitting(true);
    try {
      const selDoc = doctors.find(d => d._id === form.doctorId);
      const fee = FEES[form.department] || FEES.default;
      const res = await appointmentsAPI.create({ ...form, fee, symptoms: form.symptoms ? form.symptoms.split(',').map(s=>s.trim()) : [] });
      const appt = res.data.data;
      setShowModal(false);
      setPendingPayment({
        appointmentId: appt._id,
        amount: fee,
        description: `Consultation with Dr. ${selDoc?.name || 'Doctor'} — ${new Date(form.date).toLocaleDateString('en-IN')} ${form.timeSlot}`,
      });
    } catch (err) { toast.error(err.response?.data?.error || 'Booking failed'); }
    setSubmitting(false);
  };

  const handlePaymentSuccess = (txn) => {
    setPendingPayment(null);
    toast.success(`✅ Payment of ₹${txn.amount} confirmed! Appointment booked.`);
    load();
  };

  const handleStatusChange = async (id, status) => {
    try { await appointmentsAPI.update(id, { status }); toast.success(`Appointment ${status}`); load(); }
    catch { toast.error('Update failed'); }
  };

  const selDoc = doctors.find(d => d._id === form.doctorId);
  const estFee = FEES[form.department] || FEES.default;

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">📅 Appointment Management</div><div className="page-subtitle">Schedule and manage all appointments</div></div>
        <div className="page-actions">
          <select className="form-input" style={{ width:140, padding:'8px 28px 8px 10px', fontSize:13 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {['confirmed','pending','cancelled','completed'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Book Appointment</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-2 mb-3" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {[
          { label:'Total',     val:appointments.length, icon:'📅', color:'#e8effe' },
          { label:'Confirmed', val:appointments.filter(a=>a.status==='confirmed').length, icon:'✅', color:'#ecfdf5' },
          { label:'Pending',   val:appointments.filter(a=>a.status==='pending').length,   icon:'⏳', color:'#fffbeb' },
          { label:'Cancelled', val:appointments.filter(a=>a.status==='cancelled').length, icon:'❌', color:'#fef2f2' },
        ].map((s,i) => (
          <motion.div key={s.label} className="stat-card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.07 }}>
            <div className="stat-icon" style={{ background:s.color }}>{s.icon}</div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:.2 }}>
        <div className="card-body-0">
          {loading ? <div style={{ padding:40, textAlign:'center' }}><div className="spinner-lg" style={{ margin:'0 auto' }} /></div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Dept</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Payment</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign:'center', padding:32, color:'#94a3b8' }}>No appointments found</td></tr>
                  ) : appointments.map(a => (
                    <motion.tr key={a._id} initial={{ opacity:0 }} animate={{ opacity:1 }}>
                      <td><div className="td-main">{a.patient?.name}</div><div className="td-sub">{a.patient?.phone}</div></td>
                      <td className="text-sm">{a.doctor?.name}<div className="td-sub">{a.doctor?.specialization}</div></td>
                      <td><span className="badge badge-teal">{a.department}</span></td>
                      <td className="text-sm">{new Date(a.date).toLocaleDateString('en-IN')}<div className="td-sub">{a.timeSlot}</div></td>
                      <td className="text-sm">{a.type}</td>
                      <td><span className={`badge ${STATUS_BADGE[a.status]||'badge-gray'}`}>{a.status}</span></td>
                      <td>
                        <span style={{ padding:'3px 8px', borderRadius:20, fontSize:11, fontWeight:700,
                          background: a.paymentStatus==='paid'?'#dcfce7':'#fef3c7',
                          color:       a.paymentStatus==='paid'?'#15803d':'#92400e' }}>
                          {a.paymentStatus==='paid' ? `✅ ₹${a.fee||0}` : `⏳ ₹${a.fee||estFee}`}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {a.paymentStatus !== 'paid' && user?.role === 'patient' && (
                            <button className="btn btn-primary btn-xs"
                              onClick={() => setPendingPayment({ appointmentId:a._id, amount:a.fee||estFee, description:`Appointment on ${new Date(a.date).toLocaleDateString('en-IN')}` })}>
                              Pay Now
                            </button>
                          )}
                          {['doctor','admin'].includes(user?.role) && a.status === 'pending' && (
                            <button className="btn btn-success btn-xs" onClick={() => handleStatusChange(a._id,'confirmed')}>Confirm</button>
                          )}
                          {a.status !== 'cancelled' && a.status !== 'completed' && (
                            <button className="btn btn-outline btn-xs" onClick={() => handleStatusChange(a._id,'cancelled')}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Book Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setShowModal(false); }}>
            <motion.div className="modal-box" style={{ maxWidth:540 }} initial={{ opacity:0,y:24,scale:.96 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:24,scale:.96 }}>
              <div className="modal-header">
                <span className="modal-title">📅 Book Appointment</span>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleBook}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Select Doctor *</label>
                      <select className="form-input" value={form.doctorId} onChange={e => { setForm(f=>({...f,doctorId:e.target.value})); fetchSlots(e.target.value, form.date); }}>
                        {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <select className="form-input" value={form.department} onChange={e => setForm(f=>({...f,department:e.target.value}))}>
                        {DEPTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Date *</label>
                      <input type="date" className="form-input" value={form.date} min={new Date().toISOString().split('T')[0]}
                        onChange={e => { setForm(f=>({...f,date:e.target.value,timeSlot:''})); fetchSlots(form.doctorId, e.target.value); }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time Slot *</label>
                      <select className="form-input" value={form.timeSlot} onChange={e => setForm(f=>({...f,timeSlot:e.target.value}))}>
                        <option value="">Select time</option>
                        {slots.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Visit Type</label>
                      <select className="form-input" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                        {TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Symptoms (comma-sep.)</label>
                      <input className="form-input" value={form.symptoms} placeholder="fever, headache…" onChange={e => setForm(f=>({...f,symptoms:e.target.value}))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Any additional information…" />
                  </div>

                  {/* Fee preview */}
                  <div style={{ background:'linear-gradient(135deg,#eff6ff,#e0f2fe)', border:'1px solid #bfdbfe', borderRadius:12, padding:'14px 16px', marginBottom:4, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontWeight:700, color:'#1e40af', fontSize:14 }}>Consultation Fee</div>
                      <div style={{ fontSize:12, color:'#3b82f6' }}>Payment required to confirm booking</div>
                    </div>
                    <div style={{ fontSize:22, fontWeight:900, color:'#1e40af' }}>₹{estFee}</div>
                  </div>

                  <div className="modal-footer" style={{ marginTop:16 }}>
                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Creating…' : `Proceed to Pay ₹${estFee} →`}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      {pendingPayment && (
        <PaymentModal
          type="appointment"
          refId={pendingPayment.appointmentId}
          amount={pendingPayment.amount}
          description={pendingPayment.description}
          onSuccess={handlePaymentSuccess}
          onClose={() => { setPendingPayment(null); load(); }}
        />
      )}
    </div>
  );
}
