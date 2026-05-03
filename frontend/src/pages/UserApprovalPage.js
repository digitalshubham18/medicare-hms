// // UserApprovalPage.js
// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { usersAPI } from '../utils/api';
// import toast from 'react-hot-toast';

// export default function UserApprovalPage() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await usersAPI.getAll();
//       setUsers(res.data.data || []);
//     } catch { toast.error('Failed to load users'); }
//     setLoading(false);
//   };
//   useEffect(() => { load(); }, []);

//   const approve = async (id) => {
//     try {
//       await usersAPI.approve(id);
//       toast.success('User approved!');
//       load();
//     } catch { toast.error('Failed to approve'); }
//   };

//   const reject = async (id) => {
//     try {
//       await usersAPI.delete(id);
//       toast.success('User rejected and removed');
//       load();
//     } catch { toast.error('Failed to reject'); }
//   };

//   const pending = users.filter(u => u.status === 'pending');

//   return (
//     <div>
//       <div className="page-header">
//         <div><div className="page-title">👤 User Management & Approvals</div><div className="page-subtitle">{pending.length} user(s) awaiting approval</div></div>
//       </div>
//       {pending.length > 0 && (
//         <motion.div className="card mb-3" style={{ border:'2px solid #fffbeb' }} initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }}>
//           <div className="card-header" style={{ background:'#fffbeb' }}><span className="card-title">⏳ Pending Approvals</span><span className="badge badge-warning">{pending.length} pending</span></div>
//           <div className="card-body-0">
//             <div className="table-wrap">
//               <table>
//                 <thead><tr><th>User</th><th>Role</th><th>Phone</th><th>Registered</th><th>Actions</th></tr></thead>
//                 <tbody>
//                   {pending.map(u => (
//                     <tr key={u._id} style={{ background:'#fffbeb' }}>
//                       <td><div style={{ display:'flex',alignItems:'center',gap:8 }}>
//                         <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#1648c9,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:11 }}>{u.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
//                         <div><div className="td-main">{u.name}</div><div className="td-sub">{u.email}</div></div>
//                       </div></td>
//                       <td><span className="badge badge-teal">{u.role}</span></td>
//                       <td className="text-sm">{u.phone}</td>
//                       <td className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
//                       <td><div className="flex gap-1"><button className="btn btn-success btn-xs" onClick={() => approve(u._id)}>✓ Approve</button><button className="btn btn-danger btn-xs" onClick={() => reject(u._id)}>✗ Reject</button></div></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </motion.div>
//       )}
//       <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}>
//         <div className="card-header"><span className="card-title">All System Users ({users.length})</span></div>
//         <div className="card-body-0">
//           {loading ? <div style={{ padding:32,textAlign:'center' }}><div className="spinner-lg" style={{ margin:'0 auto' }} /></div> : (
//             <div className="table-wrap">
//               <table>
//                 <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
//                 <tbody>
//                   {users.map(u => (
//                     <tr key={u._id}>
//                       <td><div style={{ display:'flex',alignItems:'center',gap:8 }}>
//                         <div style={{ width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#1648c9,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:10 }}>{u.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
//                         <div><div className="td-main">{u.name}</div><div className="td-sub">{u.email}</div></div>
//                       </div></td>
//                       <td><span className="badge badge-primary">{u.role}</span></td>
//                       <td className="text-sm">{u.department||'—'}</td>
//                       <td><span className={`badge ${u.status==='approved'?'badge-success':u.status==='pending'?'badge-warning':'badge-danger'}`}>{u.status}</span></td>
//                       <td className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
//                       <td>{u.status==='pending'?<button className="btn btn-success btn-xs" onClick={()=>approve(u._id)}>✓ Approve</button>:<button className="btn btn-outline btn-xs">Edit</button>}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ROLES = ['admin','doctor','patient','nurse','pharmacist','wardboy','sweeper','otboy'];
const ROLE_COLORS = { admin:'#6366f1',doctor:'#0891b2',patient:'#7c3aed',nurse:'#db2777',pharmacist:'#d97706',wardboy:'#059669',sweeper:'#f59e0b',otboy:'#ef4444' };
const DEPTS = ['Cardiology','Neurology','Orthopedics','General Medicine','Pediatrics','Psychiatry','Gynecology','Oncology','Surgery','ENT','Radiology','ICU','Emergency','Pharmacy','Ward A','Ward B','Ward C'];

export default function UserApprovalPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data.data || []);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await usersAPI.approve(id); toast.success('User approved!'); load(); } 
    catch { toast.error('Failed to approve'); }
  };

  const reject = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    try { await usersAPI.delete(id); toast.success('User removed'); load(); }
    catch { toast.error('Failed'); }
  };

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, phone: u.phone||'', role: u.role, department: u.department||'', specialization: u.specialization||'', licenseNumber: u.licenseNumber||'', status: u.status, bloodGroup: u.bloodGroup||'', address: u.address||'' });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await usersAPI.update(editUser._id, editForm);
      toast.success('User updated successfully!');
      setEditUser(null);
      load();
    } catch(e) { toast.error(e.response?.data?.error || 'Update failed'); }
    setSaving(false);
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const pending = users.filter(u => u.status === 'pending');
  const ini = (n) => n?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?';
  const rc = (role) => ROLE_COLORS[role] || '#64748b';

  const FIELD = (label, key, type='text', opts=null) => (
    <div key={key}>
      <label style={LS}>{label}</label>
      {opts ? (
        <select style={IS} value={editForm[key]||''} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))}>
          <option value="">Select…</option>
          {opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
        </select>
      ) : (
        <input type={type} style={IS} value={editForm[key]||''} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))} />
      )}
    </div>
  );
  const LS = { display:'block', fontSize:10.5, fontWeight:700, color:'#64748b', letterSpacing:.5, textTransform:'uppercase', marginBottom:5 };
  const IS = { width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:10, fontFamily:'inherit', fontSize:13.5, outline:'none', background:'#fff', boxSizing:'border-box', transition:'border-color .2s' };

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); input:focus,select:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px #2563eb18;}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#0f172a', margin:0 }}>👤 User Management</h1>
          <p style={{ color:'#94a3b8', fontSize:13, marginTop:3 }}>{users.length} total users · {pending.length} awaiting approval</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search name or email…"
            style={{ padding:'9px 14px', border:'1.5px solid #e2e8f0', borderRadius:12, fontSize:13, fontFamily:'inherit', outline:'none', width:220 }} />
          <select value={filterRole} onChange={e=>setFilterRole(e.target.value)}
            style={{ padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:12, fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}>
            <option value="">All Roles</option>
            {ROLES.map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
          </select>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            style={{ padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:12, fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Pending banner */}
      {pending.length > 0 && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          style={{ background:'linear-gradient(135deg,#fffbeb,#fef9c3)', border:'1.5px solid #fde68a', borderRadius:16, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>⏳</div>
          <div>
            <div style={{ fontWeight:800, color:'#92400e', fontSize:15 }}>{pending.length} user{pending.length>1?'s':''} waiting for approval</div>
            <div style={{ fontSize:12.5, color:'#b45309' }}>Review and approve or reject new registrations below</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            {pending.slice(0,3).map(u => (
              <div key={u._id} title={u.name} style={{ width:32, height:32, borderRadius:'50%', background:`linear-gradient(135deg,${rc(u.role)},${rc(u.role)}99)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:11, border:'2px solid #fff' }}>{ini(u.name)}</div>
            ))}
            {pending.length > 3 && <div style={{ width:32, height:32, borderRadius:'50%', background:'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#64748b' }}>+{pending.length-3}</div>}
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginBottom:20 }}>
        {[
          { label:'Total Users', val:users.length, icon:'👥', bg:'#eff6ff', c:'#1d4ed8' },
          { label:'Approved',    val:users.filter(u=>u.status==='approved').length, icon:'✅', bg:'#dcfce7', c:'#15803d' },
          { label:'Pending',     val:pending.length, icon:'⏳', bg:'#fef3c7', c:'#92400e' },
          { label:'Doctors',     val:users.filter(u=>u.role==='doctor').length, icon:'⚕️', bg:'#ecfeff', c:'#0e7490' },
          { label:'Patients',    val:users.filter(u=>u.role==='patient').length, icon:'🧑', bg:'#f5f3ff', c:'#6d28d9' },
          { label:'Support',     val:users.filter(u=>['wardboy','sweeper','otboy'].includes(u.role)).length, icon:'🛏️', bg:'#f0fdf4', c:'#15803d' },
        ].map((s,i) => (
          <motion.div key={i} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.05 }}
            style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{s.icon}</div>
            <div><div style={{ fontSize:20, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{s.val}</div><div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{s.label}</div></div>
          </motion.div>
        ))}
      </div>

      {/* Users table */}
      <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:18, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>All Users ({filtered.length})</span>
        </div>
        {loading ? (
          <div style={{ padding:48, textAlign:'center' }}><div style={{ width:32,height:32,border:'3px solid #e2e8f0',borderTopColor:'#2563eb',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:48, textAlign:'center', color:'#94a3b8' }}><div style={{ fontSize:40,marginBottom:10 }}>🔍</div><div style={{ fontWeight:700 }}>No users found</div></div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['User','Role','Department','Status','User ID','Joined','Actions'].map(h => (
                    <th key={h} style={{ padding:'11px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:.5, textTransform:'uppercase', borderBottom:'1px solid #f1f5f9', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u,i) => (
                  <motion.tr key={u._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*.02 }}
                    style={{ borderBottom:'1px solid #f8fafc', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#fafbfc'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${rc(u.role)},${rc(u.role)}99)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>{ini(u.name)}</div>
                        <div>
                          <div style={{ fontWeight:700, color:'#0f172a', fontSize:13.5 }}>{u.name}</div>
                          <div style={{ fontSize:11.5, color:'#94a3b8' }}>{u.email}</div>
                          {u.phone && <div style={{ fontSize:11, color:'#64748b' }}>{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11.5, fontWeight:700, background:`${rc(u.role)}18`, color:rc(u.role) }}>{u.role}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:13, color:'#64748b' }}>{u.department||'—'}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <span style={{ padding:'4px 10px', borderRadius:20, fontSize:11.5, fontWeight:700,
                        background: u.status==='approved'?'#dcfce7':u.status==='pending'?'#fef3c7':'#fee2e2',
                        color: u.status==='approved'?'#15803d':u.status==='pending'?'#92400e':'#dc2626' }}>
                        {u.status==='approved'?'✅':u.status==='pending'?'⏳':'🚫'} {u.status}
                      </span>
                    </td>
                    <td style={{ padding:'12px 16px', fontFamily:'monospace', fontSize:11.5, color:'#64748b' }}>{u._id.slice(-8).toUpperCase()}</td>
                    <td style={{ padding:'12px 16px', fontSize:12.5, color:'#64748b', whiteSpace:'nowrap' }}>{new Date(u.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                        {u.status==='pending' && (
                          <button onClick={()=>approve(u._id)}
                            style={{ padding:'5px 12px', borderRadius:8, border:'none', background:'#059669', color:'#fff', fontFamily:'inherit', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>
                            ✓ Approve
                          </button>
                        )}
                        <button onClick={()=>openEdit(u)}
                          style={{ padding:'5px 12px', borderRadius:8, border:'1.5px solid #2563eb', background:'#eff6ff', color:'#2563eb', fontFamily:'inherit', fontSize:11.5, fontWeight:700, cursor:'pointer', transition:'all .15s' }}
                          onMouseEnter={e=>{e.currentTarget.style.background='#2563eb';e.currentTarget.style.color='#fff';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='#eff6ff';e.currentTarget.style.color='#2563eb';}}>
                          ✏️ Edit
                        </button>
                        <button onClick={()=>setViewUser(u)}
                          style={{ padding:'5px 12px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#374151', fontFamily:'inherit', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>
                          👁 View
                        </button>
                        {u.status==='pending' && (
                          <button onClick={()=>reject(u._id)}
                            style={{ padding:'5px 10px', borderRadius:8, border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', fontFamily:'inherit', fontSize:11.5, fontWeight:700, cursor:'pointer' }}>
                            ✗
                          </button>
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

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {editUser && (
          <div onClick={e=>{if(e.target===e.currentTarget)setEditUser(null)}}
            style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16,overflowY:'auto' }}>
            <motion.div initial={{ opacity:0,y:24,scale:.96 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:24,scale:.96 }}
              style={{ background:'#fff',borderRadius:24,width:'100%',maxWidth:560,boxShadow:'0 32px 80px rgba(0,0,0,.25)',overflow:'hidden' }}>

              {/* Header */}
              <div style={{ background:`linear-gradient(135deg,${rc(editUser.role)},${rc(editUser.role)}cc)`, padding:'20px 24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:48,height:48,borderRadius:14,background:'rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:18 }}>{ini(editUser.name)}</div>
                  <div>
                    <div style={{ color:'#fff',fontWeight:800,fontSize:17 }}>Edit User — {editUser.name}</div>
                    <div style={{ color:'rgba(255,255,255,.7)',fontSize:12 }}>{editUser.email} · ID: {editUser._id.slice(-8).toUpperCase()}</div>
                  </div>
                  <button onClick={()=>setEditUser(null)} style={{ marginLeft:'auto',background:'rgba(255,255,255,.2)',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',color:'#fff',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
                </div>
              </div>

              <div style={{ padding:'24px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  {FIELD('Full Name','name')}
                  {FIELD('Phone','phone','tel')}
                  {FIELD('Role','role','text',ROLES.map(r=>({v:r,l:r.charAt(0).toUpperCase()+r.slice(1)})))}
                  {FIELD('Status','status','text',[{v:'pending',l:'Pending'},{v:'approved',l:'Approved'},{v:'suspended',l:'Suspended'}])}
                  {FIELD('Department','department','text',DEPTS.map(d=>({v:d,l:d})))}
                  {FIELD('Specialization','specialization')}
                  {FIELD('License Number','licenseNumber')}
                  {FIELD('Blood Group','bloodGroup','text',[...'A+ A- B+ B- AB+ AB- O+ O-'.split(' ')].map(b=>({v:b,l:b})))}
                </div>
                {FIELD('Address','address')}

                <div style={{ display:'flex',gap:10,marginTop:20 }}>
                  <button onClick={()=>setEditUser(null)} style={{ flex:1,padding:'12px',borderRadius:12,border:'1.5px solid #e2e8f0',background:'#fff',fontFamily:'inherit',fontWeight:700,cursor:'pointer',fontSize:14 }}>Cancel</button>
                  <button onClick={saveEdit} disabled={saving}
                    style={{ flex:2,padding:'12px',borderRadius:12,border:'none',background:`linear-gradient(135deg,${rc(editUser.role)},${rc(editUser.role)}cc)`,color:'#fff',fontFamily:'inherit',fontWeight:800,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                    {saving ? <><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }} />Saving…</> : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── VIEW MODAL ── */}
      <AnimatePresence>
        {viewUser && (
          <div onClick={e=>{if(e.target===e.currentTarget)setViewUser(null)}}
            style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16 }}>
            <motion.div initial={{ opacity:0,y:20,scale:.96 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:20,scale:.96 }}
              style={{ background:'#fff',borderRadius:24,width:'100%',maxWidth:480,boxShadow:'0 32px 80px rgba(0,0,0,.25)',overflow:'hidden' }}>
              <div style={{ background:`linear-gradient(135deg,${rc(viewUser.role)},${rc(viewUser.role)}cc)`, padding:'20px 24px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:52,height:52,borderRadius:14,background:'rgba(255,255,255,.25)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:20 }}>{ini(viewUser.name)}</div>
                  <div><div style={{ color:'#fff',fontWeight:800,fontSize:17 }}>{viewUser.name}</div><div style={{ color:'rgba(255,255,255,.75)',fontSize:12 }}>{viewUser.role} · {viewUser.department||'No Dept'}</div></div>
                  <button onClick={()=>setViewUser(null)} style={{ marginLeft:'auto',background:'rgba(255,255,255,.2)',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',color:'#fff',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
                </div>
              </div>
              <div style={{ padding:'20px 24px' }}>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  {[
                    ['📧 Email',viewUser.email],['📞 Phone',viewUser.phone||'—'],
                    ['🏥 Dept',viewUser.department||'—'],['🔬 Spec.',viewUser.specialization||'—'],
                    ['🆔 ID',viewUser._id.slice(-8).toUpperCase()],['📅 Joined',new Date(viewUser.createdAt).toLocaleDateString('en-IN')],
                    ['🩸 Blood',viewUser.bloodGroup||'—'],['⭐ Rating',`${viewUser.rating||4.5}/5`],
                  ].map(([l,v])=>(
                    <div key={l} style={{ background:'#f8fafc',borderRadius:10,padding:'10px 12px' }}>
                      <div style={{ fontSize:10.5,color:'#94a3b8',marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:13,fontWeight:700,color:'#0f172a',wordBreak:'break-all' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex',gap:8,marginTop:18 }}>
                  {viewUser.status==='pending'&&<button onClick={()=>{approve(viewUser._id);setViewUser(null);}} style={{ flex:1,padding:'10px',borderRadius:12,border:'none',background:'#059669',color:'#fff',fontFamily:'inherit',fontWeight:700,cursor:'pointer' }}>✓ Approve</button>}
                  <button onClick={()=>{openEdit(viewUser);setViewUser(null);}} style={{ flex:2,padding:'10px',borderRadius:12,border:'none',background:'#2563eb',color:'#fff',fontFamily:'inherit',fontWeight:700,cursor:'pointer' }}>✏️ Edit User</button>
                  <button onClick={()=>setViewUser(null)} style={{ flex:1,padding:'10px',borderRadius:12,border:'1.5px solid #e2e8f0',background:'#fff',fontFamily:'inherit',fontWeight:700,cursor:'pointer' }}>Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
