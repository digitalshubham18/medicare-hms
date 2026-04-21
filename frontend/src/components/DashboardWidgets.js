// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { facilityAPI, tasksAPI, leavesAPI } from '../utils/api';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { getSocket } from '../utils/socket';
// import toast from 'react-hot-toast';

// const SHIFTS = { morning:{label:'Morning',time:'08:00–16:00',icon:'🌅',bg:'#dcfce7',color:'#15803d'}, afternoon:{label:'Afternoon',time:'14:00–22:00',icon:'🌇',bg:'#fef3c7',color:'#92400e'}, night:{label:'Night',time:'22:00–08:00',icon:'🌙',bg:'#e0e7ff',color:'#3730a3'}, full:{label:'Full Day',time:'07:00–19:00',icon:'☀️',bg:'#f0f9ff',color:'#0369a1'} };
// const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
// const PRIORITY_CFG = { urgent:{bg:'#fee2e2',color:'#dc2626',dot:'#ef4444'}, high:{bg:'#fef3c7',color:'#92400e',dot:'#f59e0b'}, medium:{bg:'#eff6ff',color:'#1d4ed8',dot:'#3b82f6'}, low:{bg:'#f0fdf4',color:'#15803d',dot:'#22c55e'} };
// const ROLE_COLOR = { admin:'#6366f1',doctor:'#0891b2',patient:'#7c3aed',nurse:'#db2777',pharmacist:'#d97706',wardboy:'#059669',sweeper:'#f59e0b',otboy:'#ef4444' };

// // ═══════════════════════════════════════════════════════
// // TODAY'S SCHEDULE — shows ONLY current user's schedule
// // ═══════════════════════════════════════════════════════
// export function TodayScheduleWidget() {
//   const { user } = useAuth();
//   const nav = useNavigate();
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     facilityAPI.getSchedules({ userId: user?._id, date: new Date().toISOString() })
//       .then(r => { setSchedules(r.data.data || []); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [user?._id]);

//   const ac = ROLE_COLOR[user?.role] || '#2563eb';

//   return (
//     <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
//       <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <span style={{ fontSize:18 }}>📆</span>
//           <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>Today's Schedule</span>
//         </div>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <span style={{ fontSize:12, color:'#94a3b8' }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})}</span>
//           <button onClick={()=>nav('/rooms')} style={{ padding:'4px 10px',borderRadius:8,border:`1px solid ${ac}30`,background:`${ac}08`,color:ac,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>Full →</button>
//         </div>
//       </div>
//       <div style={{ padding:'12px 16px' }}>
//         {loading ? <div style={{ padding:20,textAlign:'center',color:'#94a3b8',fontSize:13 }}>Loading…</div>
//         : schedules.length === 0 ? (
//           <div style={{ padding:'20px 0', textAlign:'center', color:'#94a3b8' }}>
//             <div style={{ fontSize:32,marginBottom:8 }}>😌</div>
//             <div style={{ fontWeight:600,fontSize:14 }}>No shifts today</div>
//             <div style={{ fontSize:12,marginTop:3 }}>Enjoy your day off!</div>
//           </div>
//         ) : schedules.map((s,i) => {
//           const sd = SHIFTS[s.shift] || SHIFTS.morning;
//           return (
//             <div key={i} style={{ padding:'11px 14px',background:sd.bg,borderRadius:12,marginBottom:8,borderLeft:`3px solid ${sd.color}` }}>
//               <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
//                 <span style={{ fontWeight:700,color:'#0f172a',fontSize:13 }}>{sd.icon} {sd.label} Shift</span>
//                 <span style={{ fontSize:12,fontWeight:600,color:sd.color }}>{sd.time}</span>
//               </div>
//               {s.department && <div style={{ fontSize:12,color:'#64748b' }}>🏥 {s.department}</div>}
//               {s.task && <div style={{ fontSize:12,color:'#64748b',marginTop:2 }}>📋 {s.task}</div>}
//               {s.room && <div style={{ fontSize:12,color:ac,fontWeight:600,marginTop:2 }}>📍 {s.room?.name||'Assigned Room'}</div>}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════
// // WEEKLY TIMETABLE — shows ONLY current user's schedule
// // ═══════════════════════════════════════════════════════
// export function WeeklyTimetableWidget() {
//   const { user } = useAuth();
//   const [schedules, setSchedules] = useState([]);
//   const [weekOffset, setWeekOffset] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const getWeekDates = (off=0) => {
//     const now = new Date(); const day = now.getDay();
//     const mon = new Date(now); mon.setDate(now.getDate() - day + 1 + off*7);
//     return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
//   };
//   const weekDates = getWeekDates(weekOffset);

//   useEffect(() => {
//     setLoading(true);
//     facilityAPI.getSchedules({ userId: user?._id, week: weekDates[0].toISOString() })
//       .then(r => { setSchedules(r.data.data||[]); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [user?._id, weekOffset]);

//   const ac = ROLE_COLOR[user?.role] || '#2563eb';

//   return (
//     <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
//       <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <span style={{ fontSize:18 }}>📅</span>
//           <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>My Timetable</span>
//         </div>
//         <div style={{ display:'flex', alignItems:'center', gap:6 }}>
//           <button onClick={()=>setWeekOffset(w=>w-1)} style={{ padding:'5px 10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600 }}>←</button>
//           <span style={{ fontSize:12,fontWeight:600,color:'#374151',whiteSpace:'nowrap' }}>
//             {weekDates[0].toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {weekDates[6].toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
//           </span>
//           <button onClick={()=>setWeekOffset(w=>w+1)} style={{ padding:'5px 10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600 }}>→</button>
//           {weekOffset!==0&&<button onClick={()=>setWeekOffset(0)} style={{ padding:'5px 10px',borderRadius:8,border:`1px solid ${ac}`,background:`${ac}10`,color:ac,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:700 }}>Now</button>}
//         </div>
//       </div>
//       <div style={{ overflowX:'auto' }}>
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(100px,1fr))', borderBottom:'1px solid #f1f5f9', minWidth:700 }}>
//           {weekDates.map((d,i) => {
//             const isToday = d.toDateString()===new Date().toDateString();
//             return (
//               <div key={i} style={{ padding:'10px 8px',textAlign:'center',background:isToday?`${ac}10`:'#f8fafc',borderRight:i<6?'1px solid #f1f5f9':'none' }}>
//                 <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:600 }}>{DAYS[d.getDay()]}</div>
//                 <div style={{ fontSize:17,fontWeight:800,color:isToday?ac:'#0f172a',marginTop:2 }}>{d.getDate()}</div>
//                 {isToday&&<div style={{ width:5,height:5,borderRadius:'50%',background:ac,margin:'3px auto 0' }} />}
//               </div>
//             );
//           })}
//         </div>
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(100px,1fr))', minWidth:700, minHeight:120 }}>
//           {weekDates.map((d,di) => {
//             const dayScheds = schedules.filter(s=>new Date(s.date).toDateString()===d.toDateString());
//             const isToday = d.toDateString()===new Date().toDateString();
//             return (
//               <div key={di} style={{ padding:6,borderRight:di<6?'1px solid #f8fafc':'none',background:isToday?`${ac}04`:undefined,minHeight:100 }}>
//                 {loading ? <div style={{ height:40,background:'#f1f5f9',borderRadius:8,margin:2 }} /> :
//                 dayScheds.length===0 ?
//                   <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
//                     <span style={{ fontSize:16,opacity:.18 }}>—</span>
//                   </div> :
//                 dayScheds.map((s,si) => {
//                   const sd=SHIFTS[s.shift]||SHIFTS.morning;
//                   return (
//                     <div key={si} style={{ padding:'5px 7px',borderRadius:8,marginBottom:4,background:sd.bg,borderLeft:`2.5px solid ${sd.color}` }}>
//                       <div style={{ fontSize:10.5,fontWeight:700,color:sd.color }}>{sd.icon} {s.shift}</div>
//                       {s.department&&<div style={{ fontSize:9.5,color:'#64748b',marginTop:1 }}>{s.department}</div>}
//                       <div style={{ fontSize:9,color:'#94a3b8',marginTop:1 }}>{sd.time}</div>
//                     </div>
//                   );
//                 })}
//               </div>
//             );
//           })}
//         </div>
//         {!loading&&schedules.length===0&&(
//           <div style={{ padding:'24px',textAlign:'center',color:'#94a3b8',borderTop:'1px solid #f1f5f9' }}>
//             <div style={{ fontSize:32,marginBottom:8 }}>📅</div>
//             <div style={{ fontWeight:700,fontSize:14 }}>No schedule this week</div>
//             <div style={{ fontSize:12,marginTop:3 }}>Check with your admin for shift assignments</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════
// // MY TASKS WIDGET
// // ═══════════════════════════════════════════════════════
// export function MyTasksWidget() {
//   const { user } = useAuth();
//   const nav = useNavigate();
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(null);
//   const ac = ROLE_COLOR[user?.role] || '#2563eb';

//   const load = () => {
//     tasksAPI.getAll({ assignedTo: user?._id })
//       .then(r => { setTasks(r.data.data||[]); setLoading(false); })
//       .catch(() => setLoading(false));
//   };
//   useEffect(() => { load(); }, [user?._id]);

//   const markComplete = async (id) => {
//     setUpdating(id);
//     try {
//       await tasksAPI.update(id, { status:'completed' });
//       setTasks(ts => ts.map(t => t._id===id ? {...t,status:'completed',completedAt:new Date()} : t));
//       toast.success('✅ Task marked complete!');
//     } catch { toast.error('Update failed'); }
//     setUpdating(null);
//   };

//   const markProgress = async (id) => {
//     setUpdating(id);
//     try {
//       await tasksAPI.update(id, { status:'in_progress' });
//       setTasks(ts => ts.map(t => t._id===id ? {...t,status:'in_progress'} : t));
//     } catch {}
//     setUpdating(null);
//   };

//   const pending = tasks.filter(t=>t.status!=='completed'&&t.status!=='cancelled');
//   const done    = tasks.filter(t=>t.status==='completed');

//   const STATUS_CFG = { pending:{bg:'#fef3c7',c:'#92400e',label:'Pending'}, in_progress:{bg:'#eff6ff',c:'#1d4ed8',label:'In Progress'}, completed:{bg:'#dcfce7',c:'#15803d',label:'Done'}, cancelled:{bg:'#f1f5f9',c:'#64748b',label:'Cancelled'} };

//   return (
//     <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
//       <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <span style={{ fontSize:18 }}>✅</span>
//           <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>My Tasks</span>
//           {pending.length>0&&<span style={{ padding:'2px 8px',borderRadius:20,background:'#fef3c7',color:'#92400e',fontSize:11,fontWeight:700 }}>{pending.length}</span>}
//         </div>
//         <span style={{ fontSize:12,color:'#94a3b8' }}>{done.length}/{tasks.length} done</span>
//       </div>

//       {tasks.length>0 && (
//         <div style={{ padding:'8px 18px 0', borderBottom:'1px solid #f8fafc' }}>
//           <div style={{ height:5,background:'#f1f5f9',borderRadius:3,marginBottom:8 }}>
//             <div style={{ height:'100%',background:`linear-gradient(90deg,${ac},${ac}cc)`,borderRadius:3,width:`${tasks.length?Math.round((done.length/tasks.length)*100):0}%`,transition:'width .5s' }} />
//           </div>
//         </div>
//       )}

//       <div style={{ maxHeight:360, overflowY:'auto', padding:'10px 16px 14px' }}>
//         {loading ? <div style={{ padding:20,textAlign:'center',color:'#94a3b8' }}>Loading…</div>
//         : tasks.length===0 ? (
//           <div style={{ padding:'24px 0',textAlign:'center',color:'#94a3b8' }}>
//             <div style={{ fontSize:36,marginBottom:8 }}>🎉</div>
//             <div style={{ fontWeight:700,fontSize:14 }}>No tasks assigned</div>
//             <div style={{ fontSize:12,marginTop:3 }}>You're all caught up!</div>
//           </div>
//         ) : (
//           <>
//             {pending.length>0&&<div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:8 }}>Pending ({pending.length})</div>}
//             {pending.map(t => {
//               const pc = PRIORITY_CFG[t.priority]||PRIORITY_CFG.medium;
//               const sc = STATUS_CFG[t.status]||STATUS_CFG.pending;
//               return (
//                 <motion.div key={t._id} layout
//                   style={{ padding:'12px 13px',background:'#f8fafc',borderRadius:12,marginBottom:7,border:`1px solid ${t.priority==='urgent'?'#fecaca':'#e8edf3'}`,borderLeft:`3px solid ${pc.dot}` }}>
//                   <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8 }}>
//                     <div style={{ flex:1,minWidth:0 }}>
//                       <div style={{ fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:3 }}>{t.title}</div>
//                       {t.description&&<div style={{ fontSize:12,color:'#64748b',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.description}</div>}
//                       <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
//                         <span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,fontWeight:700,background:pc.bg,color:pc.color }}>{t.priority}</span>
//                         <span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,fontWeight:700,background:sc.bg,color:sc.c }}>{sc.label}</span>
//                         {t.dueDate&&<span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,color:'#64748b',background:'#f1f5f9' }}>📅 {new Date(t.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
//                         {t.assignedBy&&<span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,color:'#94a3b8',background:'#f8fafc' }}>by {t.assignedBy.name?.split(' ')[0]}</span>}
//                       </div>
//                     </div>
//                     <div style={{ display:'flex',flexDirection:'column',gap:4,flexShrink:0 }}>
//                       {t.status==='pending'&&(
//                         <button onClick={()=>markProgress(t._id)} disabled={updating===t._id}
//                           style={{ padding:'5px 9px',borderRadius:7,border:'1px solid #bfdbfe',background:'#eff6ff',color:'#2563eb',fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>
//                           Start
//                         </button>
//                       )}
//                       <button onClick={()=>markComplete(t._id)} disabled={updating===t._id}
//                         style={{ padding:'5px 9px',borderRadius:7,border:'none',background:ac,color:'#fff',fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4 }}>
//                         {updating===t._id?'…':'✓ Done'}
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//             {done.length>0&&(
//               <>
//                 <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',margin:'12px 0 8px' }}>Completed ({done.length})</div>
//                 {done.slice(0,3).map(t=>(
//                   <div key={t._id} style={{ padding:'9px 13px',background:'#f0fdf4',borderRadius:10,marginBottom:5,opacity:.7,display:'flex',alignItems:'center',gap:8 }}>
//                     <span style={{ color:'#22c55e',fontSize:14 }}>✓</span>
//                     <span style={{ fontSize:12.5,color:'#64748b',textDecoration:'line-through' }}>{t.title}</span>
//                   </div>
//                 ))}
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════
// // LEAVE NOTIFICATIONS — role-aware
// // ═══════════════════════════════════════════════════════
// export function LeaveNotificationsWidget() {
//   const { user } = useAuth();
//   const [todayLeaves, setTodayLeaves] = useState([]);
//   const [myLeaves, setMyLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const ac = ROLE_COLOR[user?.role] || '#2563eb';

//   const load = useCallback(() => {
//     Promise.all([
//       leavesAPI.getToday(),
//       leavesAPI.getAll({ userId: user?._id }),
//     ]).then(([tRes,mRes]) => {
//       let todayL = tRes.data.data || [];
//       // Filter: patients only see doctors on leave, not all staff
//       if (user?.role === 'patient') todayL = todayL.filter(l => l.user?.role === 'doctor');
//       setTodayLeaves(todayL.filter(l => l.user?._id !== user?._id));
//       setMyLeaves((mRes.data.data||[]).slice(0,5));
//       setLoading(false);
//     }).catch(() => setLoading(false));
//   }, [user?._id, user?.role]);

//   useEffect(() => {
//     load();
//     // Listen for real-time leave updates
//     const socket = getSocket();
//     if (socket) {
//       const handler = () => load();
//       socket.on('leave_reviewed', handler);
//       return () => socket.off('leave_reviewed', handler);
//     }
//   }, [load]);

//   const ini = n => n?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';

//   return (
//     <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
//       <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:8 }}>
//         <span style={{ fontSize:18 }}>🔔</span>
//         <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>Leave Notifications</span>
//         {todayLeaves.length>0&&<span style={{ padding:'2px 8px',borderRadius:20,background:'#fee2e2',color:'#dc2626',fontSize:11,fontWeight:700 }}>{todayLeaves.length} on leave</span>}
//       </div>
//       <div style={{ padding:'12px 16px' }}>
//         {loading ? <div style={{ padding:16,textAlign:'center',color:'#94a3b8',fontSize:13 }}>Loading…</div> : (
//           <>
//             {todayLeaves.length>0 && (
//               <>
//                 <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:8 }}>On Leave Today</div>
//                 {todayLeaves.map(l=>(
//                   <div key={l._id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'#fef3c7',borderRadius:11,marginBottom:6,border:'1px solid #fde68a' }}>
//                     <div style={{ width:34,height:34,borderRadius:'50%',background:`linear-gradient(135deg,${ROLE_COLOR[l.user?.role]||'#64748b'},${ROLE_COLOR[l.user?.role]||'#64748b'}99)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,flexShrink:0 }}>{ini(l.user?.name)}</div>
//                     <div style={{ flex:1,minWidth:0 }}>
//                       <div style={{ fontWeight:700,color:'#0f172a',fontSize:13 }}>{l.user?.name} <span style={{ fontSize:11,color:'#92400e' }}>is on {l.type} leave today</span></div>
//                       <div style={{ fontSize:11,color:'#b45309' }}>{l.user?.role} · {new Date(l.from).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(l.to).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
//                     </div>
//                     <span style={{ fontSize:20 }}>🏖️</span>
//                   </div>
//                 ))}
//               </>
//             )}
//             {todayLeaves.length===0&&(
//               <div style={{ textAlign:'center',padding:'12px 0 4px',color:'#94a3b8' }}>
//                 <div style={{ fontSize:28,marginBottom:6 }}>✅</div>
//                 <div style={{ fontSize:13,fontWeight:600 }}>All staff on duty today</div>
//               </div>
//             )}

//             {/* My recent leave status */}
//             {myLeaves.length>0&&(
//               <>
//                 <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',margin:'12px 0 8px' }}>My Leave Status</div>
//                 {myLeaves.map(l=>{
//                   const sc = {pending:{bg:'#fef3c7',c:'#92400e',i:'⏳'},approved:{bg:'#dcfce7',c:'#15803d',i:'✅'},rejected:{bg:'#fee2e2',c:'#dc2626',i:'❌'}}[l.status];
//                   return (
//                     <div key={l._id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 11px',background:'#f8fafc',borderRadius:10,marginBottom:5 }}>
//                       <div>
//                         <div style={{ fontSize:12.5,fontWeight:700,color:'#0f172a' }}>{l.type} · {l.days}d</div>
//                         <div style={{ fontSize:11,color:'#64748b' }}>{new Date(l.from).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(l.to).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
//                       </div>
//                       <span style={{ padding:'3px 9px',borderRadius:20,fontSize:11.5,fontWeight:700,background:sc?.bg,color:sc?.c }}>
//                         {sc?.i} {l.status}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { facilityAPI, tasksAPI, leavesAPI } from '../utils/api';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { getSocket } from '../utils/socket';
// import toast from 'react-hot-toast';

// const SHIFTS = { morning:{label:'Morning',time:'08:00–16:00',icon:'🌅',bg:'#dcfce7',color:'#15803d'}, afternoon:{label:'Afternoon',time:'14:00–22:00',icon:'🌇',bg:'#fef3c7',color:'#92400e'}, night:{label:'Night',time:'22:00–08:00',icon:'🌙',bg:'#e0e7ff',color:'#3730a3'}, full:{label:'Full Day',time:'07:00–19:00',icon:'☀️',bg:'#f0f9ff',color:'#0369a1'} };
// const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
// const PRIORITY_CFG = { urgent:{bg:'#fee2e2',color:'#dc2626',dot:'#ef4444'}, high:{bg:'#fef3c7',color:'#92400e',dot:'#f59e0b'}, medium:{bg:'#eff6ff',color:'#1d4ed8',dot:'#3b82f6'}, low:{bg:'#f0fdf4',color:'#15803d',dot:'#22c55e'} };
// const ROLE_COLOR = { admin:'#6366f1',doctor:'#0891b2',patient:'#7c3aed',nurse:'#db2777',pharmacist:'#d97706',wardboy:'#059669',sweeper:'#f59e0b',otboy:'#ef4444' };

// // ═══════════════════════════════════════════════════════
// // TODAY'S SCHEDULE — shows ONLY current user's schedule
// // ═══════════════════════════════════════════════════════
// export function TodayScheduleWidget() {
//   const { user } = useAuth();
//   const nav = useNavigate();
//   const [schedules, setSchedules] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     facilityAPI.getSchedules({ userId: user?._id, date: new Date().toISOString() })
//       .then(r => { setSchedules(r.data.data || []); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [user?._id]);

//   const ac = ROLE_COLOR[user?.role] || '#2563eb';

//   return (
//     <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
//       <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <span style={{ fontSize:18 }}>📆</span>
//           <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>Today's Schedule</span>
//         </div>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <span style={{ fontSize:12, color:'#94a3b8' }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})}</span>
//           <button onClick={()=>nav('/rooms')} style={{ padding:'4px 10px',borderRadius:8,border:`1px solid ${ac}30`,background:`${ac}08`,color:ac,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>Full →</button>
//         </div>
//       </div>
//       <div style={{ padding:'12px 16px' }}>
//         {loading ? <div style={{ padding:20,textAlign:'center',color:'#94a3b8',fontSize:13 }}>Loading…</div>
//         : schedules.length === 0 ? (
//           <div style={{ padding:'20px 0', textAlign:'center', color:'#94a3b8' }}>
//             <div style={{ fontSize:32,marginBottom:8 }}>😌</div>
//             <div style={{ fontWeight:600,fontSize:14 }}>No shifts today</div>
//             <div style={{ fontSize:12,marginTop:3 }}>Enjoy your day off!</div>
//           </div>
//         ) : schedules.map((s,i) => {
//           const sd = SHIFTS[s.shift] || SHIFTS.morning;
//           return (
//             <div key={i} style={{ padding:'11px 14px',background:sd.bg,borderRadius:12,marginBottom:8,borderLeft:`3px solid ${sd.color}` }}>
//               <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
//                 <span style={{ fontWeight:700,color:'#0f172a',fontSize:13 }}>{sd.icon} {sd.label} Shift</span>
//                 <span style={{ fontSize:12,fontWeight:600,color:sd.color }}>{sd.time}</span>
//               </div>
//               {s.department && <div style={{ fontSize:12,color:'#64748b' }}>🏥 {s.department}</div>}
//               {s.task && <div style={{ fontSize:12,color:'#64748b',marginTop:2 }}>📋 {s.task}</div>}
//               {s.room && <div style={{ fontSize:12,color:ac,fontWeight:600,marginTop:2 }}>📍 {s.room?.name||'Assigned Room'}</div>}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════
// // WEEKLY TIMETABLE — shows ONLY current user's schedule
// // ═══════════════════════════════════════════════════════
// export function WeeklyTimetableWidget() {
//   const { user } = useAuth();
//   const [schedules, setSchedules] = useState([]);
//   const [weekOffset, setWeekOffset] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const getWeekDates = (off=0) => {
//     const now = new Date(); const day = now.getDay();
//     const mon = new Date(now); mon.setDate(now.getDate() - day + 1 + off*7);
//     return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
//   };
//   const weekDates = getWeekDates(weekOffset);

//   useEffect(() => {
//     setLoading(true);
//     facilityAPI.getSchedules({ userId: user?._id, week: weekDates[0].toISOString() })
//       .then(r => { setSchedules(r.data.data||[]); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, [user?._id, weekOffset]);

//   const ac = ROLE_COLOR[user?.role] || '#2563eb';

//   return (
//     <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
//       <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <span style={{ fontSize:18 }}>📅</span>
//           <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>My Timetable</span>
//         </div>
//         <div style={{ display:'flex', alignItems:'center', gap:6 }}>
//           <button onClick={()=>setWeekOffset(w=>w-1)} style={{ padding:'5px 10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600 }}>←</button>
//           <span style={{ fontSize:12,fontWeight:600,color:'#374151',whiteSpace:'nowrap' }}>
//             {weekDates[0].toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {weekDates[6].toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
//           </span>
//           <button onClick={()=>setWeekOffset(w=>w+1)} style={{ padding:'5px 10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600 }}>→</button>
//           {weekOffset!==0&&<button onClick={()=>setWeekOffset(0)} style={{ padding:'5px 10px',borderRadius:8,border:`1px solid ${ac}`,background:`${ac}10`,color:ac,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:700 }}>Now</button>}
//         </div>
//       </div>
//       <div style={{ overflowX:'auto' }}>
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(100px,1fr))', borderBottom:'1px solid #f1f5f9', minWidth:700 }}>
//           {weekDates.map((d,i) => {
//             const isToday = d.toDateString()===new Date().toDateString();
//             return (
//               <div key={i} style={{ padding:'10px 8px',textAlign:'center',background:isToday?`${ac}10`:'#f8fafc',borderRight:i<6?'1px solid #f1f5f9':'none' }}>
//                 <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:600 }}>{DAYS[d.getDay()]}</div>
//                 <div style={{ fontSize:17,fontWeight:800,color:isToday?ac:'#0f172a',marginTop:2 }}>{d.getDate()}</div>
//                 {isToday&&<div style={{ width:5,height:5,borderRadius:'50%',background:ac,margin:'3px auto 0' }} />}
//               </div>
//             );
//           })}
//         </div>
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(100px,1fr))', minWidth:700, minHeight:120 }}>
//           {weekDates.map((d,di) => {
//             const dayScheds = schedules.filter(s=>new Date(s.date).toDateString()===d.toDateString());
//             const isToday = d.toDateString()===new Date().toDateString();
//             return (
//               <div key={di} style={{ padding:6,borderRight:di<6?'1px solid #f8fafc':'none',background:isToday?`${ac}04`:undefined,minHeight:100 }}>
//                 {loading ? <div style={{ height:40,background:'#f1f5f9',borderRadius:8,margin:2 }} /> :
//                 dayScheds.length===0 ?
//                   <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
//                     <span style={{ fontSize:16,opacity:.18 }}>—</span>
//                   </div> :
//                 dayScheds.map((s,si) => {
//                   const sd=SHIFTS[s.shift]||SHIFTS.morning;
//                   return (
//                     <div key={si} style={{ padding:'5px 7px',borderRadius:8,marginBottom:4,background:sd.bg,borderLeft:`2.5px solid ${sd.color}` }}>
//                       <div style={{ fontSize:10.5,fontWeight:700,color:sd.color }}>{sd.icon} {s.shift}</div>
//                       {s.department&&<div style={{ fontSize:9.5,color:'#64748b',marginTop:1 }}>{s.department}</div>}
//                       <div style={{ fontSize:9,color:'#94a3b8',marginTop:1 }}>{sd.time}</div>
//                     </div>
//                   );
//                 })}
//               </div>
//             );
//           })}
//         </div>
//         {!loading&&schedules.length===0&&(
//           <div style={{ padding:'24px',textAlign:'center',color:'#94a3b8',borderTop:'1px solid #f1f5f9' }}>
//             <div style={{ fontSize:32,marginBottom:8 }}>📅</div>
//             <div style={{ fontWeight:700,fontSize:14 }}>No schedule this week</div>
//             <div style={{ fontSize:12,marginTop:3 }}>Check with your admin for shift assignments</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════
// // MY TASKS WIDGET
// // ═══════════════════════════════════════════════════════
// export function MyTasksWidget() {
//   const { user } = useAuth();
//   const nav = useNavigate();
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(null);
//   const ac = ROLE_COLOR[user?.role] || '#2563eb';

//   const load = () => {
//     tasksAPI.getAll({ assignedTo: user?._id })
//       .then(r => { setTasks(r.data.data||[]); setLoading(false); })
//       .catch(() => setLoading(false));
//   };
//   useEffect(() => { load(); }, [user?._id]);

//   const markComplete = async (id) => {
//     setUpdating(id);
//     try {
//       await tasksAPI.update(id, { status:'completed' });
//       setTasks(ts => ts.map(t => t._id===id ? {...t,status:'completed',completedAt:new Date()} : t));
//       toast.success('✅ Task marked complete!');
//     } catch { toast.error('Update failed'); }
//     setUpdating(null);
//   };

//   const markProgress = async (id) => {
//     setUpdating(id);
//     try {
//       await tasksAPI.update(id, { status:'in_progress' });
//       setTasks(ts => ts.map(t => t._id===id ? {...t,status:'in_progress'} : t));
//     } catch {}
//     setUpdating(null);
//   };

//   const pending = tasks.filter(t=>t.status!=='completed'&&t.status!=='cancelled');
//   const done    = tasks.filter(t=>t.status==='completed');

//   const STATUS_CFG = { pending:{bg:'#fef3c7',c:'#92400e',label:'Pending'}, in_progress:{bg:'#eff6ff',c:'#1d4ed8',label:'In Progress'}, completed:{bg:'#dcfce7',c:'#15803d',label:'Done'}, cancelled:{bg:'#f1f5f9',c:'#64748b',label:'Cancelled'} };

//   return (
//     <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
//       <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//           <span style={{ fontSize:18 }}>✅</span>
//           <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>My Tasks</span>
//           {pending.length>0&&<span style={{ padding:'2px 8px',borderRadius:20,background:'#fef3c7',color:'#92400e',fontSize:11,fontWeight:700 }}>{pending.length}</span>}
//         </div>
//         <span style={{ fontSize:12,color:'#94a3b8' }}>{done.length}/{tasks.length} done</span>
//       </div>

//       {tasks.length>0 && (
//         <div style={{ padding:'8px 18px 0', borderBottom:'1px solid #f8fafc' }}>
//           <div style={{ height:5,background:'#f1f5f9',borderRadius:3,marginBottom:8 }}>
//             <div style={{ height:'100%',background:`linear-gradient(90deg,${ac},${ac}cc)`,borderRadius:3,width:`${tasks.length?Math.round((done.length/tasks.length)*100):0}%`,transition:'width .5s' }} />
//           </div>
//         </div>
//       )}

//       <div style={{ maxHeight:360, overflowY:'auto', padding:'10px 16px 14px' }}>
//         {loading ? <div style={{ padding:20,textAlign:'center',color:'#94a3b8' }}>Loading…</div>
//         : tasks.length===0 ? (
//           <div style={{ padding:'24px 0',textAlign:'center',color:'#94a3b8' }}>
//             <div style={{ fontSize:36,marginBottom:8 }}>🎉</div>
//             <div style={{ fontWeight:700,fontSize:14 }}>No tasks assigned</div>
//             <div style={{ fontSize:12,marginTop:3 }}>You're all caught up!</div>
//           </div>
//         ) : (
//           <>
//             {pending.length>0&&<div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:8 }}>Pending ({pending.length})</div>}
//             {pending.map(t => {
//               const pc = PRIORITY_CFG[t.priority]||PRIORITY_CFG.medium;
//               const sc = STATUS_CFG[t.status]||STATUS_CFG.pending;
//               return (
//                 <motion.div key={t._id} layout
//                   style={{ padding:'12px 13px',background:'#f8fafc',borderRadius:12,marginBottom:7,border:`1px solid ${t.priority==='urgent'?'#fecaca':'#e8edf3'}`,borderLeft:`3px solid ${pc.dot}` }}>
//                   <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8 }}>
//                     <div style={{ flex:1,minWidth:0 }}>
//                       <div style={{ fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:3 }}>{t.title}</div>
//                       {t.description&&<div style={{ fontSize:12,color:'#64748b',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.description}</div>}
//                       <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
//                         <span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,fontWeight:700,background:pc.bg,color:pc.color }}>{t.priority}</span>
//                         <span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,fontWeight:700,background:sc.bg,color:sc.c }}>{sc.label}</span>
//                         {t.dueDate&&<span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,color:'#64748b',background:'#f1f5f9' }}>📅 {new Date(t.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
//                         {t.assignedBy&&<span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,color:'#94a3b8',background:'#f8fafc' }}>by {t.assignedBy.name?.split(' ')[0]}</span>}
//                       </div>
//                     </div>
//                     <div style={{ display:'flex',flexDirection:'column',gap:4,flexShrink:0 }}>
//                       {t.status==='pending'&&(
//                         <button onClick={()=>markProgress(t._id)} disabled={updating===t._id}
//                           style={{ padding:'5px 9px',borderRadius:7,border:'1px solid #bfdbfe',background:'#eff6ff',color:'#2563eb',fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>
//                           Start
//                         </button>
//                       )}
//                       <button onClick={()=>markComplete(t._id)} disabled={updating===t._id}
//                         style={{ padding:'5px 9px',borderRadius:7,border:'none',background:ac,color:'#fff',fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4 }}>
//                         {updating===t._id?'…':'✓ Done'}
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//             {done.length>0&&(
//               <>
//                 <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',margin:'12px 0 8px' }}>Completed ({done.length})</div>
//                 {done.slice(0,3).map(t=>(
//                   <div key={t._id} style={{ padding:'9px 13px',background:'#f0fdf4',borderRadius:10,marginBottom:5,opacity:.7,display:'flex',alignItems:'center',gap:8 }}>
//                     <span style={{ color:'#22c55e',fontSize:14 }}>✓</span>
//                     <span style={{ fontSize:12.5,color:'#64748b',textDecoration:'line-through' }}>{t.title}</span>
//                   </div>
//                 ))}
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════
// // LEAVE NOTIFICATIONS — role-aware
// // ═══════════════════════════════════════════════════════
// export function LeaveNotificationsWidget() {
//   const { user } = useAuth();
//   const [todayLeaves, setTodayLeaves] = useState([]);
//   const [myLeaves, setMyLeaves] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const ac = ROLE_COLOR[user?.role] || '#2563eb';

//   const load = useCallback(() => {
//     Promise.all([
//       leavesAPI.getToday(),
//       leavesAPI.getAll({ userId: user?._id }),
//     ]).then(([tRes,mRes]) => {
//       let todayL = tRes.data.data || [];
//       // Filter: patients only see doctors on leave, not all staff
//       if (user?.role === 'patient') todayL = todayL.filter(l => l.user?.role === 'doctor');
//       setTodayLeaves(todayL.filter(l => l.user?._id !== user?._id));
//       setMyLeaves((mRes.data.data||[]).slice(0,5));
//       setLoading(false);
//     }).catch(() => setLoading(false));
//   }, [user?._id, user?.role]);

//   useEffect(() => {
//     load();
//     // Listen for real-time leave updates
//     const socket = getSocket();
//     if (socket) {
//       const handler = () => load();
//       socket.on('leave_reviewed', handler);
//       return () => socket.off('leave_reviewed', handler);
//     }
//   }, [load]);

//   const ini = n => n?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';

//   return (
//     <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
//       <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:8 }}>
//         <span style={{ fontSize:18 }}>🔔</span>
//         <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>Leave Notifications</span>
//         {todayLeaves.length>0&&<span style={{ padding:'2px 8px',borderRadius:20,background:'#fee2e2',color:'#dc2626',fontSize:11,fontWeight:700 }}>{todayLeaves.length} on leave</span>}
//       </div>
//       <div style={{ padding:'12px 16px' }}>
//         {loading ? <div style={{ padding:16,textAlign:'center',color:'#94a3b8',fontSize:13 }}>Loading…</div> : (
//           <>
//             {todayLeaves.length>0 && (
//               <>
//                 <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:8 }}>On Leave Today</div>
//                 {todayLeaves.map(l=>(
//                   <div key={l._id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'#fef3c7',borderRadius:11,marginBottom:6,border:'1px solid #fde68a' }}>
//                     <div style={{ width:34,height:34,borderRadius:'50%',background:`linear-gradient(135deg,${ROLE_COLOR[l.user?.role]||'#64748b'},${ROLE_COLOR[l.user?.role]||'#64748b'}99)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,flexShrink:0 }}>{ini(l.user?.name)}</div>
//                     <div style={{ flex:1,minWidth:0 }}>
//                       <div style={{ fontWeight:700,color:'#0f172a',fontSize:13 }}>{l.user?.name} <span style={{ fontSize:11,color:'#92400e' }}>is on {l.type} leave today</span></div>
//                       <div style={{ fontSize:11,color:'#b45309' }}>{l.user?.role} · {new Date(l.from).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(l.to).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
//                     </div>
//                     <span style={{ fontSize:20 }}>🏖️</span>
//                   </div>
//                 ))}
//               </>
//             )}
//             {todayLeaves.length===0&&(
//               <div style={{ textAlign:'center',padding:'12px 0 4px',color:'#94a3b8' }}>
//                 <div style={{ fontSize:28,marginBottom:6 }}>✅</div>
//                 <div style={{ fontSize:13,fontWeight:600 }}>All staff on duty today</div>
//               </div>
//             )}

//             {/* My recent leave status */}
//             {myLeaves.length>0&&(
//               <>
//                 <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',margin:'12px 0 8px' }}>My Leave Status</div>
//                 {myLeaves.map(l=>{
//                   const sc = {pending:{bg:'#fef3c7',c:'#92400e',i:'⏳'},approved:{bg:'#dcfce7',c:'#15803d',i:'✅'},rejected:{bg:'#fee2e2',c:'#dc2626',i:'❌'}}[l.status];
//                   return (
//                     <div key={l._id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 11px',background:'#f8fafc',borderRadius:10,marginBottom:5 }}>
//                       <div>
//                         <div style={{ fontSize:12.5,fontWeight:700,color:'#0f172a' }}>{l.type} · {l.days}d</div>
//                         <div style={{ fontSize:11,color:'#64748b' }}>{new Date(l.from).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(l.to).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
//                       </div>
//                       <span style={{ padding:'3px 9px',borderRadius:20,fontSize:11.5,fontWeight:700,background:sc?.bg,color:sc?.c }}>
//                         {sc?.i} {l.status}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { facilityAPI, tasksAPI, leavesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const SHIFTS = { morning:{label:'Morning',time:'08:00–16:00',icon:'🌅',bg:'#dcfce7',color:'#15803d'}, afternoon:{label:'Afternoon',time:'14:00–22:00',icon:'🌇',bg:'#fef3c7',color:'#92400e'}, night:{label:'Night',time:'22:00–08:00',icon:'🌙',bg:'#e0e7ff',color:'#3730a3'}, full:{label:'Full Day',time:'07:00–19:00',icon:'☀️',bg:'#f0f9ff',color:'#0369a1'} };
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const PRIORITY_CFG = { urgent:{bg:'#fee2e2',color:'#dc2626',dot:'#ef4444'}, high:{bg:'#fef3c7',color:'#92400e',dot:'#f59e0b'}, medium:{bg:'#eff6ff',color:'#1d4ed8',dot:'#3b82f6'}, low:{bg:'#f0fdf4',color:'#15803d',dot:'#22c55e'} };
const ROLE_COLOR = { admin:'#6366f1',doctor:'#0891b2',patient:'#7c3aed',nurse:'#db2777',pharmacist:'#d97706',wardboy:'#059669',sweeper:'#f59e0b',otboy:'#ef4444' };

// ═══════════════════════════════════════════════════════
// TODAY'S SCHEDULE — shows ONLY current user's schedule
// ═══════════════════════════════════════════════════════
export function TodayScheduleWidget() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facilityAPI.getSchedules({ userId: user?._id, date: new Date().toISOString() })
      .then(r => { setSchedules(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?._id]);

  const ac = ROLE_COLOR[user?.role] || '#2563eb';

  return (
    <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>📆</span>
          <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>Today's Schedule</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color:'#94a3b8' }}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})}</span>
          <button onClick={()=>nav('/rooms')} style={{ padding:'4px 10px',borderRadius:8,border:`1px solid ${ac}30`,background:`${ac}08`,color:ac,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>Full →</button>
        </div>
      </div>
      <div style={{ padding:'12px 16px' }}>
        {loading ? <div style={{ padding:20,textAlign:'center',color:'#94a3b8',fontSize:13 }}>Loading…</div>
        : schedules.length === 0 ? (
          <div style={{ padding:'20px 0', textAlign:'center', color:'#94a3b8' }}>
            <div style={{ fontSize:32,marginBottom:8 }}>😌</div>
            <div style={{ fontWeight:600,fontSize:14 }}>No shifts today</div>
            <div style={{ fontSize:12,marginTop:3 }}>Enjoy your day off!</div>
          </div>
        ) : schedules.map((s,i) => {
          const sd = SHIFTS[s.shift] || SHIFTS.morning;
          return (
            <div key={i} style={{ padding:'11px 14px',background:sd.bg,borderRadius:12,marginBottom:8,borderLeft:`3px solid ${sd.color}` }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4 }}>
                <span style={{ fontWeight:700,color:'#0f172a',fontSize:13 }}>{sd.icon} {sd.label} Shift</span>
                <span style={{ fontSize:12,fontWeight:600,color:sd.color }}>{sd.time}</span>
              </div>
              {s.department && <div style={{ fontSize:12,color:'#64748b' }}>🏥 {s.department}</div>}
              {s.task && <div style={{ fontSize:12,color:'#64748b',marginTop:2 }}>📋 {s.task}</div>}
              {s.room && <div style={{ fontSize:12,color:ac,fontWeight:600,marginTop:2 }}>📍 {s.room?.name||'Assigned Room'}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// WEEKLY TIMETABLE — shows ONLY current user's schedule
// ═══════════════════════════════════════════════════════
export function WeeklyTimetableWidget() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const getWeekDates = (off=0) => {
    const now = new Date(); const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - day + 1 + off*7);
    return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
  };
  const weekDates = getWeekDates(weekOffset);

  useEffect(() => {
    setLoading(true);
    facilityAPI.getSchedules({ userId: user?._id, week: weekDates[0].toISOString() })
      .then(r => { setSchedules(r.data.data||[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?._id, weekOffset]);

  const ac = ROLE_COLOR[user?.role] || '#2563eb';

  return (
    <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>📅</span>
          <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>My Timetable</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <button onClick={()=>setWeekOffset(w=>w-1)} style={{ padding:'5px 10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600 }}>←</button>
          <span style={{ fontSize:12,fontWeight:600,color:'#374151',whiteSpace:'nowrap' }}>
            {weekDates[0].toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {weekDates[6].toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
          </span>
          <button onClick={()=>setWeekOffset(w=>w+1)} style={{ padding:'5px 10px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600 }}>→</button>
          {weekOffset!==0&&<button onClick={()=>setWeekOffset(0)} style={{ padding:'5px 10px',borderRadius:8,border:`1px solid ${ac}`,background:`${ac}10`,color:ac,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:700 }}>Now</button>}
        </div>
      </div>
      <div style={{ overflowX:'auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(100px,1fr))', borderBottom:'1px solid #f1f5f9', minWidth:700 }}>
          {weekDates.map((d,i) => {
            const isToday = d.toDateString()===new Date().toDateString();
            return (
              <div key={i} style={{ padding:'10px 8px',textAlign:'center',background:isToday?`${ac}10`:'#f8fafc',borderRight:i<6?'1px solid #f1f5f9':'none' }}>
                <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:600 }}>{DAYS[d.getDay()]}</div>
                <div style={{ fontSize:17,fontWeight:800,color:isToday?ac:'#0f172a',marginTop:2 }}>{d.getDate()}</div>
                {isToday&&<div style={{ width:5,height:5,borderRadius:'50%',background:ac,margin:'3px auto 0' }} />}
              </div>
            );
          })}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,minmax(100px,1fr))', minWidth:700, minHeight:120 }}>
          {weekDates.map((d,di) => {
            const dayScheds = schedules.filter(s=>new Date(s.date).toDateString()===d.toDateString());
            const isToday = d.toDateString()===new Date().toDateString();
            return (
              <div key={di} style={{ padding:6,borderRight:di<6?'1px solid #f8fafc':'none',background:isToday?`${ac}04`:undefined,minHeight:100 }}>
                {loading ? <div style={{ height:40,background:'#f1f5f9',borderRadius:8,margin:2 }} /> :
                dayScheds.length===0 ?
                  <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <span style={{ fontSize:16,opacity:.18 }}>—</span>
                  </div> :
                dayScheds.map((s,si) => {
                  const sd=SHIFTS[s.shift]||SHIFTS.morning;
                  return (
                    <div key={si} style={{ padding:'5px 7px',borderRadius:8,marginBottom:4,background:sd.bg,borderLeft:`2.5px solid ${sd.color}` }}>
                      <div style={{ fontSize:10.5,fontWeight:700,color:sd.color }}>{sd.icon} {s.shift}</div>
                      {s.department&&<div style={{ fontSize:9.5,color:'#64748b',marginTop:1 }}>{s.department}</div>}
                      <div style={{ fontSize:9,color:'#94a3b8',marginTop:1 }}>{sd.time}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {!loading&&schedules.length===0&&(
          <div style={{ padding:'24px',textAlign:'center',color:'#94a3b8',borderTop:'1px solid #f1f5f9' }}>
            <div style={{ fontSize:32,marginBottom:8 }}>📅</div>
            <div style={{ fontWeight:700,fontSize:14 }}>No schedule this week</div>
            <div style={{ fontSize:12,marginTop:3 }}>Check with your admin for shift assignments</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MY TASKS WIDGET
// ═══════════════════════════════════════════════════════
export function MyTasksWidget() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const ac = ROLE_COLOR[user?.role] || '#2563eb';

  const load = () => {
    tasksAPI.getAll({ assignedTo: user?._id })
      .then(r => { setTasks(r.data.data||[]); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [user?._id]);

  const markComplete = async (id) => {
    setUpdating(id);
    try {
      await tasksAPI.update(id, { status:'completed' });
      setTasks(ts => ts.map(t => t._id===id ? {...t,status:'completed',completedAt:new Date()} : t));
      toast.success('✅ Task marked complete!');
    } catch { toast.error('Update failed'); }
    setUpdating(null);
  };

  const markProgress = async (id) => {
    setUpdating(id);
    try {
      await tasksAPI.update(id, { status:'in_progress' });
      setTasks(ts => ts.map(t => t._id===id ? {...t,status:'in_progress'} : t));
    } catch {}
    setUpdating(null);
  };

  const pending = tasks.filter(t=>t.status!=='completed'&&t.status!=='cancelled');
  const done    = tasks.filter(t=>t.status==='completed');

  const STATUS_CFG = { pending:{bg:'#fef3c7',c:'#92400e',label:'Pending'}, in_progress:{bg:'#eff6ff',c:'#1d4ed8',label:'In Progress'}, completed:{bg:'#dcfce7',c:'#15803d',label:'Done'}, cancelled:{bg:'#f1f5f9',c:'#64748b',label:'Cancelled'} };

  return (
    <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>✅</span>
          <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>My Tasks</span>
          {pending.length>0&&<span style={{ padding:'2px 8px',borderRadius:20,background:'#fef3c7',color:'#92400e',fontSize:11,fontWeight:700 }}>{pending.length}</span>}
        </div>
        <span style={{ fontSize:12,color:'#94a3b8' }}>{done.length}/{tasks.length} done</span>
      </div>

      {tasks.length>0 && (
        <div style={{ padding:'8px 18px 0', borderBottom:'1px solid #f8fafc' }}>
          <div style={{ height:5,background:'#f1f5f9',borderRadius:3,marginBottom:8 }}>
            <div style={{ height:'100%',background:`linear-gradient(90deg,${ac},${ac}cc)`,borderRadius:3,width:`${tasks.length?Math.round((done.length/tasks.length)*100):0}%`,transition:'width .5s' }} />
          </div>
        </div>
      )}

      <div style={{ maxHeight:360, overflowY:'auto', padding:'10px 16px 14px' }}>
        {loading ? <div style={{ padding:20,textAlign:'center',color:'#94a3b8' }}>Loading…</div>
        : tasks.length===0 ? (
          <div style={{ padding:'24px 0',textAlign:'center',color:'#94a3b8' }}>
            <div style={{ fontSize:36,marginBottom:8 }}>🎉</div>
            <div style={{ fontWeight:700,fontSize:14 }}>No tasks assigned</div>
            <div style={{ fontSize:12,marginTop:3 }}>You're all caught up!</div>
          </div>
        ) : (
          <>
            {pending.length>0&&<div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:8 }}>Pending ({pending.length})</div>}
            {pending.map(t => {
              const pc = PRIORITY_CFG[t.priority]||PRIORITY_CFG.medium;
              const sc = STATUS_CFG[t.status]||STATUS_CFG.pending;
              return (
                <motion.div key={t._id} layout
                  style={{ padding:'12px 13px',background:'#f8fafc',borderRadius:12,marginBottom:7,border:`1px solid ${t.priority==='urgent'?'#fecaca':'#e8edf3'}`,borderLeft:`3px solid ${pc.dot}` }}>
                  <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8 }}>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:3 }}>{t.title}</div>
                      {t.description&&<div style={{ fontSize:12,color:'#64748b',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.description}</div>}
                      <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                        <span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,fontWeight:700,background:pc.bg,color:pc.color }}>{t.priority}</span>
                        <span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,fontWeight:700,background:sc.bg,color:sc.c }}>{sc.label}</span>
                        {t.dueDate&&<span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,color:'#64748b',background:'#f1f5f9' }}>📅 {new Date(t.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                        {t.assignedBy&&<span style={{ padding:'2px 7px',borderRadius:8,fontSize:11,color:'#94a3b8',background:'#f8fafc' }}>by {t.assignedBy.name?.split(' ')[0]}</span>}
                      </div>
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',gap:4,flexShrink:0 }}>
                      {t.status==='pending'&&(
                        <button onClick={()=>markProgress(t._id)} disabled={updating===t._id}
                          style={{ padding:'5px 9px',borderRadius:7,border:'1px solid #bfdbfe',background:'#eff6ff',color:'#2563eb',fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>
                          Start
                        </button>
                      )}
                      <button onClick={()=>markComplete(t._id)} disabled={updating===t._id}
                        style={{ padding:'5px 9px',borderRadius:7,border:'none',background:ac,color:'#fff',fontFamily:'inherit',fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4 }}>
                        {updating===t._id?'…':'✓ Done'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {done.length>0&&(
              <>
                <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',margin:'12px 0 8px' }}>Completed ({done.length})</div>
                {done.slice(0,3).map(t=>(
                  <div key={t._id} style={{ padding:'9px 13px',background:'#f0fdf4',borderRadius:10,marginBottom:5,opacity:.7,display:'flex',alignItems:'center',gap:8 }}>
                    <span style={{ color:'#22c55e',fontSize:14 }}>✓</span>
                    <span style={{ fontSize:12.5,color:'#64748b',textDecoration:'line-through' }}>{t.title}</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// LEAVE NOTIFICATIONS — role-aware
// ═══════════════════════════════════════════════════════
export function LeaveNotificationsWidget() {
  const { user } = useAuth();
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const ac = ROLE_COLOR[user?.role] || '#2563eb';

  const load = useCallback(() => {
    Promise.all([
      leavesAPI.getToday(),
      leavesAPI.getAll({ userId: user?._id }),
    ]).then(([tRes,mRes]) => {
      let todayL = tRes.data.data || [];
      // Filter: patients only see doctors on leave, not all staff
      if (user?.role === 'patient') todayL = todayL.filter(l => l.user?.role === 'doctor');
      setTodayLeaves(todayL.filter(l => l.user?._id !== user?._id));
      setMyLeaves((mRes.data.data||[]).slice(0,5));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?._id, user?.role]);

  useEffect(() => {
    load();
    // Listen for real-time leave updates
    const socket = getSocket();
    if (socket) {
      const handler = () => load();
      socket.on('leave_reviewed', handler);
      return () => socket.off('leave_reviewed', handler);
    }
  }, [load]);

  const ini = n => n?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';

  return (
    <div style={{ background:'#fff', border:'1px solid #e8edf3', borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:18 }}>🔔</span>
        <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>Leave Notifications</span>
        {todayLeaves.length>0&&<span style={{ padding:'2px 8px',borderRadius:20,background:'#fee2e2',color:'#dc2626',fontSize:11,fontWeight:700 }}>{todayLeaves.length} on leave</span>}
      </div>
      <div style={{ padding:'12px 16px' }}>
        {loading ? <div style={{ padding:16,textAlign:'center',color:'#94a3b8',fontSize:13 }}>Loading…</div> : (
          <>
            {todayLeaves.length>0 && (
              <>
                <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',marginBottom:8 }}>On Leave Today</div>
                {todayLeaves.map(l=>(
                  <div key={l._id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 12px',background:'#fef3c7',borderRadius:11,marginBottom:6,border:'1px solid #fde68a' }}>
                    <div style={{ width:34,height:34,borderRadius:'50%',background:`linear-gradient(135deg,${ROLE_COLOR[l.user?.role]||'#64748b'},${ROLE_COLOR[l.user?.role]||'#64748b'}99)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12,flexShrink:0 }}>{ini(l.user?.name)}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:700,color:'#0f172a',fontSize:13 }}>{l.user?.name} <span style={{ fontSize:11,color:'#92400e' }}>is on {l.type} leave today</span></div>
                      <div style={{ fontSize:11,color:'#b45309' }}>{l.user?.role} · {new Date(l.from).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(l.to).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                    </div>
                    <span style={{ fontSize:20 }}>🏖️</span>
                  </div>
                ))}
              </>
            )}
            {todayLeaves.length===0&&(
              <div style={{ textAlign:'center',padding:'12px 0 4px',color:'#94a3b8' }}>
                <div style={{ fontSize:28,marginBottom:6 }}>✅</div>
                <div style={{ fontSize:13,fontWeight:600 }}>All staff on duty today</div>
              </div>
            )}

            {/* My recent leave status */}
            {myLeaves.length>0&&(
              <>
                <div style={{ fontSize:10.5,color:'#94a3b8',fontWeight:700,letterSpacing:.8,textTransform:'uppercase',margin:'12px 0 8px' }}>My Leave Status</div>
                {myLeaves.map(l=>{
                  const sc = {pending:{bg:'#fef3c7',c:'#92400e',i:'⏳'},approved:{bg:'#dcfce7',c:'#15803d',i:'✅'},rejected:{bg:'#fee2e2',c:'#dc2626',i:'❌'}}[l.status];
                  return (
                    <div key={l._id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 11px',background:'#f8fafc',borderRadius:10,marginBottom:5 }}>
                      <div>
                        <div style={{ fontSize:12.5,fontWeight:700,color:'#0f172a' }}>{l.type} · {l.days}d</div>
                        <div style={{ fontSize:11,color:'#64748b' }}>{new Date(l.from).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} – {new Date(l.to).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      </div>
                      <span style={{ padding:'3px 9px',borderRadius:20,fontSize:11.5,fontWeight:700,background:sc?.bg,color:sc?.c }}>
                        {sc?.i} {l.status}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
