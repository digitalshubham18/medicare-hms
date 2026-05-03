// // PatientsPage.js
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { usersAPI, recordsAPI } from '../utils/api';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';

// export default function PatientsPage() {
//   const { user } = useAuth();
//   const [patients, setPatients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [viewPatient, setViewPatient] = useState(null);
//   const [patientRecords, setPatientRecords] = useState([]);
//   const [showAdd, setShowAdd] = useState(false);
//   const [form, setForm] = useState({ name:'',email:'',password:'password123',role:'patient',phone:'',age:'',bloodGroup:'A+',weight:'',height:'' });
//   const [adding, setAdding] = useState(false);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await usersAPI.getAll({ role:'patient', status:'approved', ...(search?{ search }:{}) });
//       setPatients(res.data.data || []);
//     } catch { toast.error('Failed to load patients'); }
//     setLoading(false);
//   };
//   useEffect(() => { load(); }, [search]);

//   const viewDetails = async (p) => {
//     setViewPatient(p);
//     try {
//       const res = await recordsAPI.getAll({ patientId: p._id });
//       setPatientRecords(res.data.data || []);
//     } catch { setPatientRecords([]); }
//   };

//   const handleAdd = async (e) => {
//     e.preventDefault();
//     setAdding(true);
//     try {
//       const { authAPI } = require('../utils/api');
//       await authAPI.register(form);
//       // Auto-approve
//       const pRes = await usersAPI.getAll({ role:'patient' });
//       const newUser = pRes.data.data?.find(u => u.email === form.email);
//       if (newUser) await usersAPI.approve(newUser._id);
//       toast.success('Patient added!');
//       setShowAdd(false);
//       load();
//     } catch (err) { toast.error(err.response?.data?.error || 'Failed to add patient'); }
//     setAdding(false);
//   };

//   return (
//     <div>
//       <div className="page-header">
//         <div><div className="page-title">Patient Management</div><div className="page-subtitle">{patients.length} patients registered</div></div>
//         {['admin','doctor'].includes(user?.role) && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Patient</button>}
//       </div>
//       <div className="search-wrap mb-3">
//         <span className="search-icon">🔍</span>
//         <input className="form-input" style={{ paddingLeft:34 }} placeholder="Search by name, email…" value={search} onChange={e => setSearch(e.target.value)} />
//       </div>
//       <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }}>
//         <div className="card-body-0">
//           {loading ? <div style={{ padding:32,textAlign:'center' }}><div className="spinner-lg" style={{ margin:'0 auto' }} /></div> : (
//             <div className="table-wrap">
//               <table>
//                 <thead><tr><th>Patient</th><th>Age / Blood</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
//                 <tbody>
//                   {patients.length === 0 ? <tr><td colSpan={6} style={{ textAlign:'center',padding:24,color:'#94a3b8' }}>No patients found</td></tr>
//                     : patients.map(p => (
//                     <tr key={p._id}>
//                       <td><div style={{ display:'flex',alignItems:'center',gap:10 }}>
//                         <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#1648c9,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:11,flexShrink:0 }}>{p.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
//                         <div><div className="td-main">{p.name}</div><div className="td-sub">{p.email}</div></div>
//                       </div></td>
//                       <td className="text-sm">{p.age||'—'} yr · {p.bloodGroup||'—'}</td>
//                       <td className="text-sm">{p.phone||'—'}</td>
//                       <td className="text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
//                       <td><span className={`badge ${p.status==='approved'?'badge-success':'badge-warning'}`}>{p.status}</span></td>
//                       <td><div className="flex gap-1"><button className="btn btn-primary btn-xs" onClick={() => viewDetails(p)}>View</button></div></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </motion.div>

//       {viewPatient && (
//         <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget)setViewPatient(null); }}>
//           <motion.div className="modal-box" initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
//             <div className="modal-header"><span className="modal-title">Patient: {viewPatient.name}</span><button className="btn btn-ghost btn-icon" onClick={()=>setViewPatient(null)}>✕</button></div>
//             <div className="modal-body">
//               <div style={{ display:'flex',gap:12,padding:12,background:'#f8fafc',borderRadius:10,marginBottom:16 }}>
//                 <div style={{ width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#1648c9,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:16 }}>{viewPatient.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
//                 <div><div className="fw-7" style={{ fontSize:15 }}>{viewPatient.name}</div><div className="text-xs text-muted">{viewPatient.email} · {viewPatient.phone}</div><div className="text-xs text-muted">Blood: {viewPatient.bloodGroup||'—'} · Age: {viewPatient.age||'—'} · Weight: {viewPatient.weight||'—'}kg</div></div>
//               </div>
//               <div className="fw-7 text-sm mb-2">Recent Records</div>
//               {patientRecords.length === 0 ? <div className="text-sm text-muted">No records found</div>
//                 : patientRecords.slice(0,4).map(r => (
//                 <div key={r._id} style={{ padding:'9px 11px',border:'1.5px solid #e2e8f0',borderRadius:8,marginBottom:6 }}>
//                   <div className="fw-7 text-sm">{r.type} · {new Date(r.createdAt).toLocaleDateString()}</div>
//                   <div className="text-xs text-muted">{r.notes?.slice(0,80)}</div>
//                 </div>
//               ))}
//             </div>
//             <div className="modal-footer"><button className="btn btn-outline" onClick={()=>setViewPatient(null)}>Close</button></div>
//           </motion.div>
//         </div>
//       )}

//       {showAdd && (
//         <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}}>
//           <motion.div className="modal-box" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
//             <div className="modal-header"><span className="modal-title">+ Add New Patient</span><button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}>✕</button></div>
//             <form onSubmit={handleAdd}>
//               <div className="modal-body">
//                 <div className="form-row">
//                   <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Patient full name"/></div>
//                   <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@example.com"/></div>
//                 </div>
//                 <div className="form-row">
//                   <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+1-555-0000"/></div>
//                   <div className="form-group"><label className="form-label">Blood Group</label><select className="form-input" value={form.bloodGroup} onChange={e=>setForm(f=>({...f,bloodGroup:e.target.value}))}>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}</select></div>
//                 </div>
//                 <div className="form-row">
//                   <div className="form-group"><label className="form-label">Age</label><input className="form-input" type="number" value={form.age} onChange={e=>setForm(f=>({...f,age:e.target.value}))} placeholder="Age"/></div>
//                   <div className="form-group"><label className="form-label">Weight (kg)</label><input className="form-input" type="number" value={form.weight} onChange={e=>setForm(f=>({...f,weight:e.target.value}))} placeholder="kg"/></div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={adding}>{adding?<><span className="spinner-sm"/> Adding…</>:'Add Patient'}</button>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }


// PatientsPage.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usersAPI, recordsAPI, appointmentsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewPatient, setViewPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'',email:'',password:'password123',role:'patient',phone:'',age:'',bloodGroup:'A+',weight:'',height:'' });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (user?.role === 'doctor') {
        // Doctors see only patients with confirmed appointments with them
        const apptRes = await appointmentsAPI.getAll({ status:'confirmed', doctorId: user._id });
        const appts = apptRes.data.data || [];
        const uniquePatients = [];
        const seen = new Set();
        for (const a of appts) {
          if (a.patient && !seen.has(a.patient._id)) {
            seen.add(a.patient._id);
            uniquePatients.push({ ...a.patient, lastAppointment: a.date, appointmentType: a.type });
          }
        }
        setPatients(uniquePatients.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase())));
      } else {
        const res = await usersAPI.getAll({ role:'patient', status:'approved', ...(search?{ search }:{}) });
        setPatients(res.data.data || []);
      }
    } catch { toast.error('Failed to load patients'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [search, user?._id]);

  const viewDetails = async (p) => {
    setViewPatient(p);
    try {
      const res = await recordsAPI.getAll({ patientId: p._id });
      setPatientRecords(res.data.data || []);
    } catch { setPatientRecords([]); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { authAPI } = require('../utils/api');
      await authAPI.register(form);
      // Auto-approve
      const pRes = await usersAPI.getAll({ role:'patient' });
      const newUser = pRes.data.data?.find(u => u.email === form.email);
      if (newUser) await usersAPI.approve(newUser._id);
      toast.success('Patient added!');
      setShowAdd(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to add patient'); }
    setAdding(false);
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Patient Management</div><div className="page-subtitle">{patients.length} patients registered</div></div>
        {['admin','doctor'].includes(user?.role) && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Patient</button>}
      </div>
      <div className="search-wrap mb-3">
        <span className="search-icon">🔍</span>
        <input className="form-input" style={{ paddingLeft:34 }} placeholder="Search by name, email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }}>
        <div className="card-body-0">
          {loading ? <div style={{ padding:32,textAlign:'center' }}><div className="spinner-lg" style={{ margin:'0 auto' }} /></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>Age / Blood</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {patients.length === 0 ? <tr><td colSpan={6} style={{ textAlign:'center',padding:24,color:'#94a3b8' }}>No patients found</td></tr>
                    : patients.map(p => (
                    <tr key={p._id}>
                      <td><div style={{ display:'flex',alignItems:'center',gap:10 }}>
                        <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#1648c9,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:11,flexShrink:0 }}>{p.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
                        <div><div className="td-main">{p.name}</div><div className="td-sub">{p.email}</div></div>
                      </div></td>
                      <td className="text-sm">{p.age||'—'} yr · {p.bloodGroup||'—'}</td>
                      <td className="text-sm">{p.phone||'—'}</td>
                      <td className="text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${p.status==='approved'?'badge-success':'badge-warning'}`}>{p.status}</span></td>
                      <td><div className="flex gap-1"><button className="btn btn-primary btn-xs" onClick={() => viewDetails(p)}>View</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {viewPatient && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget)setViewPatient(null); }}>
          <motion.div className="modal-box" initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
            <div className="modal-header"><span className="modal-title">Patient: {viewPatient.name}</span><button className="btn btn-ghost btn-icon" onClick={()=>setViewPatient(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{ display:'flex',gap:12,padding:12,background:'#f8fafc',borderRadius:10,marginBottom:16 }}>
                <div style={{ width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#1648c9,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:16 }}>{viewPatient.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
                <div><div className="fw-7" style={{ fontSize:15 }}>{viewPatient.name}</div><div className="text-xs text-muted">{viewPatient.email} · {viewPatient.phone}</div><div className="text-xs text-muted">Blood: {viewPatient.bloodGroup||'—'} · Age: {viewPatient.age||'—'} · Weight: {viewPatient.weight||'—'}kg</div></div>
              </div>
              <div className="fw-7 text-sm mb-2">Recent Records</div>
              {patientRecords.length === 0 ? <div className="text-sm text-muted">No records found</div>
                : patientRecords.slice(0,4).map(r => (
                <div key={r._id} style={{ padding:'9px 11px',border:'1.5px solid #e2e8f0',borderRadius:8,marginBottom:6 }}>
                  <div className="fw-7 text-sm">{r.type} · {new Date(r.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-muted">{r.notes?.slice(0,80)}</div>
                </div>
              ))}
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={()=>setViewPatient(null)}>Close</button></div>
          </motion.div>
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}}>
          <motion.div className="modal-box" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <div className="modal-header"><span className="modal-title">+ Add New Patient</span><button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}>✕</button></div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Patient full name"/></div>
                  <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@example.com"/></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+1-555-0000"/></div>
                  <div className="form-group"><label className="form-label">Blood Group</label><select className="form-input" value={form.bloodGroup} onChange={e=>setForm(f=>({...f,bloodGroup:e.target.value}))}>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}</select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Age</label><input className="form-input" type="number" value={form.age} onChange={e=>setForm(f=>({...f,age:e.target.value}))} placeholder="Age"/></div>
                  <div className="form-group"><label className="form-label">Weight (kg)</label><input className="form-input" type="number" value={form.weight} onChange={e=>setForm(f=>({...f,weight:e.target.value}))} placeholder="kg"/></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={adding}>{adding?<><span className="spinner-sm"/> Adding…</>:'Add Patient'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}