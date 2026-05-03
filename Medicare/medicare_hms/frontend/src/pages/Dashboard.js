// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Bar, Line, Doughnut } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
// import { useAuth } from '../context/AuthContext';
// import { analyticsAPI, appointmentsAPI, remindersAPI, alertsAPI } from '../utils/api';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// const CHART_OPTS = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.04)' } } } };

// function StatCard({ icon, value, label, change, color, delay = 0 }) {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     if (!value || isNaN(value)) return;
//     let start = 0;
//     const end = parseInt(value);
//     const step = Math.ceil(end / 28);
//     const timer = setInterval(() => {
//       start = Math.min(start + step, end);
//       setCount(start);
//       if (start >= end) clearInterval(timer);
//     }, 45);
//     return () => clearInterval(timer);
//   }, [value]);

//   return (
//     <motion.div className="stat-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
//       <div className="stat-icon" style={{ background: color }}>{icon}</div>
//       <div className="stat-value">{isNaN(value) ? value : count}</div>
//       <div className="stat-label">{label}</div>
//       {change && <div className={`stat-change ${change.dir}`}>{change.text}</div>}
//     </motion.div>
//   );
// }

// export default function Dashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [appointments, setAppointments] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [reminders, setReminders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [apptRes, alertRes, remRes] = await Promise.all([
//           appointmentsAPI.getAll({ limit: 6 }),
//           alertsAPI.getAll({ limit: 5 }),
//           remindersAPI.getAll({ status: 'active' }),
//         ]);
//         setAppointments(apptRes.value?.data?.data || []);
//         setAlerts(alertRes.value?.data?.data || []);
//         setReminders(remRes.value?.data?.data || []);
//         if (['admin', 'doctor'].includes(user?.role)) {
//           const anaRes = await analyticsAPI.getDashboard();
//           setStats(anaRes.data.data);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [user]);

//   if (loading) return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
//       <div className="spinner-lg" />
//     </div>
//   );

//   // ── PATIENT DASHBOARD ─────────────────────────────────────────────
//   if (user?.role === 'patient') {
//     const myAppts = appointments.filter(a => a.patient?._id === user.id || a.patient?.email === user.email);
//     const myRems = reminders.filter(r => r.patient?._id === user.id || r.patient?.email === user.email);
//     return (
//       <div>
//         <div className="page-header">
//           <div>
//             <div className="page-title">My Health Dashboard</div>
//             <div className="page-subtitle">Track your health, appointments & medications</div>
//           </div>
//           <button className="sos-button" onClick={async () => { try { await alertsAPI.create({ type: 'SOS', severity: 'critical', message: 'Emergency SOS' }); toast.error('🚨 SOS sent!', { duration: 8000 }); } catch { toast.error('SOS activated!'); } }}>
//             🚨<span>SOS</span>
//           </button>
//         </div>
//         <div className="stat-grid">
//           <StatCard icon="❤️" value="120/80" label="Blood Pressure" color="#fef2f2" delay={0} />
//           <StatCard icon="💓" value={72} label="Pulse (bpm)" color="#e8effe" delay={0.06} />
//           <StatCard icon="🌡️" value="98.6°F" label="Temperature" color="#fffbeb" delay={0.12} />
//           <StatCard icon="🩸" value="98%" label="SpO2" color="#ecfdf5" delay={0.18} />
//         </div>
//         <div className="grid-2">
//           <div className="card">
//             <div className="card-header">
//               <span className="card-title">📅 My Appointments</span>
//               <button className="btn btn-primary btn-xs" onClick={() => navigate('/appointments')}>Book New</button>
//             </div>
//             <div className="card-body-0">
//               <div className="table-wrap">
//                 <table>
//                   <thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
//                   <tbody>
//                     {myAppts.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No appointments yet</td></tr>
//                       : myAppts.slice(0, 4).map(a => (
//                       <tr key={a._id}>
//                         <td><div className="td-main">{a.doctor?.name}</div><div className="td-sub">{a.department}</div></td>
//                         <td className="text-sm">{new Date(a.date).toLocaleDateString()}<br /><span className="text-xs text-muted">{a.timeSlot}</span></td>
//                         <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>{a.status}</span></td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//           <div className="card">
//             <div className="card-header"><span className="card-title">⏰ Today's Medications</span></div>
//             <div className="card-body">
//               {myRems.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No reminders set</div>
//                 : myRems.slice(0, 4).map(r => (
//                 <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: 8, border: '1.5px solid #e2e8f0', marginBottom: 8, transition: 'border-color .18s' }}
//                   onMouseEnter={e => { e.currentTarget.style.borderColor = '#1648c9'; }}
//                   onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
//                 >
//                   <span style={{ fontSize: 22 }}>💊</span>
//                   <div style={{ flex: 1 }}><div className="fw-7 text-sm">{r.medicineName}</div><div className="text-xs text-muted">{r.dose} · {r.times?.[0]}</div></div>
//                   <button className="btn btn-success btn-xs" onClick={(e) => { e.currentTarget.textContent = '✓ Done'; e.currentTarget.disabled = true; e.currentTarget.className = 'btn btn-outline btn-xs'; toast.success('Medication marked as taken!'); }}>✓ Taken</button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── ADMIN / DOCTOR DASHBOARD ──────────────────────────────────────
//   const summary = stats?.summary || {};
//   const charts = stats?.charts || {};

//   const visitsData = {
//     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     datasets: [{
//       label: 'Patients', data: [24, 18, 32, 28, 42, 15, 8],
//       backgroundColor: 'rgba(22,72,201,.72)', borderRadius: 7, borderWidth: 0
//     }, {
//       label: 'Appointments', data: [18, 14, 26, 22, 35, 12, 6],
//       backgroundColor: 'rgba(8,145,178,.65)', borderRadius: 7, borderWidth: 0
//     }]
//   };

//   const deptData = {
//     labels: ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'Pediatrics'],
//     datasets: [{ data: [30, 20, 18, 25, 7], backgroundColor: ['#1648c9','#0891b2','#059669','#d97706','#7c3aed'], borderWidth: 3, borderColor: '#fff' }]
//   };

//   const revenueData = {
//     labels: ['Jan','Feb','Mar','Apr','May','Jun'],
//     datasets: [{ label: 'Revenue', data: [35000,38000,42000,39000,45000,48290], borderColor: '#1648c9', backgroundColor: 'rgba(22,72,201,.06)', fill: true, tension: .4, borderWidth: 2, pointBackgroundColor: '#1648c9', pointRadius: 4 }]
//   };

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">{user?.role === 'doctor' ? 'Doctor Dashboard' : 'Admin Dashboard'}</div>
//           <div className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}!</div>
//         </div>
//         <div className="page-actions">
//           <button className="btn btn-outline btn-sm" onClick={() => navigate('/analytics')}>📄 Reports</button>
//           <button className="btn btn-primary btn-sm" onClick={() => navigate('/appointments')}>+ Appointment</button>
//         </div>
//       </div>

//       <div className="stat-grid">
//         <StatCard icon="👥" value={summary.totalPatients || 0} label="Total Patients" color="#e8effe" change={{ dir: 'up', text: '↑ 12% this month' }} delay={0} />
//         <StatCard icon="🩺" value={summary.totalDoctors || 0} label="Active Doctors" color="#e0f7fa" change={{ dir: 'up', text: '↑ 3 new' }} delay={0.07} />
//         <StatCard icon="📅" value={summary.todayAppointments || 0} label="Today's Appointments" color="#fffbeb" change={{ dir: 'up', text: '5 confirmed' }} delay={0.14} />
//         <StatCard icon="💊" value={summary.totalOrders || 0} label="Medicine Orders" color="#ecfdf5" change={{ dir: 'up', text: '↑ 8 today' }} delay={0.21} />
//         <StatCard icon="🚨" value={summary.activeAlerts || 0} label="Active Alerts" color="#fef2f2" change={{ dir: 'warn', text: 'Action needed' }} delay={0.28} />
//         <StatCard icon="⏳" value={summary.pendingUsers || 0} label="Pending Approvals" color="#f5f3ff" change={{ dir: 'warn', text: 'Requires review' }} delay={0.35} />
//       </div>

//       <div className="grid-2 mt-2">
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">📈 Patient Visits</span>
//             <select className="form-input" style={{ width: 120, padding: '5px 28px 5px 8px', fontSize: 12 }}>
//               <option>This Week</option><option>This Month</option>
//             </select>
//           </div>
//           <div className="card-body">
//             <div style={{ height: 190, position: 'relative' }}>
//               <Bar data={visitsData} options={{ ...CHART_OPTS, plugins: { legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 10 } } } }} />
//             </div>
//           </div>
//         </motion.div>
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27, duration: 0.38 }}>
//           <div className="card-header"><span className="card-title">🏥 Department Load</span></div>
//           <div className="card-body">
//             <div style={{ height: 190, position: 'relative' }}>
//               <Doughnut data={deptData} options={{ responsive: true, maintainAspectRatio: false, cutout: '67%', plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 9, padding: 6 } } } }} />
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       <div className="grid-2 mt-2">
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">📅 Recent Appointments</span>
//             <button className="btn btn-outline btn-xs" onClick={() => navigate('/appointments')}>View All</button>
//           </div>
//           <div className="card-body-0">
//             <div className="table-wrap">
//               <table>
//                 <thead><tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead>
//                 <tbody>
//                   {appointments.slice(0, 5).map(a => (
//                     <tr key={a._id}>
//                       <td><div className="td-main">{a.patient?.name}</div><div className="td-sub">{a.department}</div></td>
//                       <td className="text-sm">{a.doctor?.name}</td>
//                       <td className="text-sm">{a.timeSlot}<br /><span className="text-xs text-muted">{new Date(a.date).toLocaleDateString()}</span></td>
//                       <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>{a.status}</span></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </motion.div>
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.41, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">🚨 Alert Log</span>
//             <button className="btn btn-outline btn-xs" onClick={() => navigate('/emergency')}>View All</button>
//           </div>
//           <div className="card-body">
//             {alerts.slice(0, 3).map(a => (
//               <div key={a._id} style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 8, background: a.severity === 'critical' ? '#fef2f2' : a.severity === 'high' ? '#fffbeb' : '#f0f4ff', marginBottom: 8 }}>
//                 <span style={{ fontSize: 18 }}>{a.type === 'SOS' ? '🚨' : a.type === 'Medication' ? '⏰' : '❤️'}</span>
//                 <div style={{ flex: 1 }}>
//                   <div className="fw-7 text-sm">{a.patient?.name} · {a.type}</div>
//                   <div className="text-xs text-muted">{a.message}</div>
//                 </div>
//                 <span className={`badge badge-${a.status === 'resolved' ? 'success' : 'danger'}`}>{a.status}</span>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       </div>

//       <motion.div className="card mt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.38 }}>
//         <div className="card-header">
//           <span className="card-title">💰 Monthly Revenue</span>
//           <button className="btn btn-outline btn-xs" onClick={() => navigate('/analytics')}>Full Analytics</button>
//         </div>
//         <div className="card-body">
//           <div style={{ height: 175, position: 'relative' }}>
//             <Line data={revenueData} options={{ ...CHART_OPTS, scales: { x: { grid: { display: false } }, y: { beginAtZero: false, ticks: { callback: v => '$' + Math.round(v / 1000) + 'k' }, grid: { color: 'rgba(0,0,0,.04)' } } } }} />
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }


// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Bar, Line, Doughnut } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
// import { useAuth } from '../context/AuthContext';
// import { analyticsAPI, appointmentsAPI, remindersAPI, alertsAPI } from '../utils/api';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { TodayScheduleWidget, WeeklyTimetableWidget, MyTasksWidget, LeaveNotificationsWidget } from '../components/DashboardWidgets';

// ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// const CHART_OPTS = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.04)' } } } };

// function StatCard({ icon, value, label, change, color, delay = 0 }) {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     if (!value || isNaN(value)) return;
//     let start = 0;
//     const end = parseInt(value);
//     const step = Math.ceil(end / 28);
//     const timer = setInterval(() => {
//       start = Math.min(start + step, end);
//       setCount(start);
//       if (start >= end) clearInterval(timer);
//     }, 45);
//     return () => clearInterval(timer);
//   }, [value]);

//   return (
//     <motion.div className="stat-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
//       <div className="stat-icon" style={{ background: color }}>{icon}</div>
//       <div className="stat-value">{isNaN(value) ? value : count}</div>
//       <div className="stat-label">{label}</div>
//       {change && <div className={`stat-change ${change.dir}`}>{change.text}</div>}
//     </motion.div>
//   );
// }

// export default function Dashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [appointments, setAppointments] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [reminders, setReminders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [apptRes, alertRes, remRes] = await Promise.all([
//           appointmentsAPI.getAll({ limit: 6 }),
//           alertsAPI.getAll({ limit: 5 }),
//           remindersAPI.getAll({ status: 'active' }),
//         ]);
//         setAppointments(apptRes.value?.data?.data || []);
//         setAlerts(alertRes.value?.data?.data || []);
//         setReminders(remRes.value?.data?.data || []);
//         if (['admin', 'doctor'].includes(user?.role)) {
//           const anaRes = await analyticsAPI.getDashboard();
//           setStats(anaRes.data.data);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [user]);

//   if (loading) return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
//       <div className="spinner-lg" />
//     </div>
//   );

//   // ── PATIENT DASHBOARD ─────────────────────────────────────────────
//   if (user?.role === 'patient') {
//     const myAppts = appointments.filter(a => a.patient?._id === user.id || a.patient?.email === user.email);
//     const myRems = reminders.filter(r => r.patient?._id === user.id || r.patient?.email === user.email);
//     return (
//       <div>
//         <div className="page-header">
//           <div>
//             <div className="page-title">My Health Dashboard</div>
//             <div className="page-subtitle">Track your health, appointments & medications</div>
//           </div>
//           <button className="sos-button" onClick={async () => { try { await alertsAPI.create({ type: 'SOS', severity: 'critical', message: 'Emergency SOS' }); toast.error('🚨 SOS sent!', { duration: 8000 }); } catch { toast.error('SOS activated!'); } }}>
//             🚨<span>SOS</span>
//           </button>
//         </div>
//         <div className="stat-grid">
//           <StatCard icon="❤️" value="120/80" label="Blood Pressure" color="#fef2f2" delay={0} />
//           <StatCard icon="💓" value={72} label="Pulse (bpm)" color="#e8effe" delay={0.06} />
//           <StatCard icon="🌡️" value="98.6°F" label="Temperature" color="#fffbeb" delay={0.12} />
//           <StatCard icon="🩸" value="98%" label="SpO2" color="#ecfdf5" delay={0.18} />
//         </div>
//         <div className="grid-2">
//           <div className="card">
//             <div className="card-header">
//               <span className="card-title">📅 My Appointments</span>
//               <button className="btn btn-primary btn-xs" onClick={() => navigate('/appointments')}>Book New</button>
//             </div>
//             <div className="card-body-0">
//               <div className="table-wrap">
//                 <table>
//                   <thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
//                   <tbody>
//                     {myAppts.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No appointments yet</td></tr>
//                       : myAppts.slice(0, 4).map(a => (
//                       <tr key={a._id}>
//                         <td><div className="td-main">{a.doctor?.name}</div><div className="td-sub">{a.department}</div></td>
//                         <td className="text-sm">{new Date(a.date).toLocaleDateString()}<br /><span className="text-xs text-muted">{a.timeSlot}</span></td>
//                         <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>{a.status}</span></td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//           <div className="card">
//             <div className="card-header"><span className="card-title">⏰ Today's Medications</span></div>
//             <div className="card-body">
//               {myRems.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No reminders set</div>
//                 : myRems.slice(0, 4).map(r => (
//                 <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: 8, border: '1.5px solid #e2e8f0', marginBottom: 8, transition: 'border-color .18s' }}
//                   onMouseEnter={e => { e.currentTarget.style.borderColor = '#1648c9'; }}
//                   onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
//                 >
//                   <span style={{ fontSize: 22 }}>💊</span>
//                   <div style={{ flex: 1 }}><div className="fw-7 text-sm">{r.medicineName}</div><div className="text-xs text-muted">{r.dose} · {r.times?.[0]}</div></div>
//                   <button className="btn btn-success btn-xs" onClick={(e) => { e.currentTarget.textContent = '✓ Done'; e.currentTarget.disabled = true; e.currentTarget.className = 'btn btn-outline btn-xs'; toast.success('Medication marked as taken!'); }}>✓ Taken</button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── ADMIN / DOCTOR DASHBOARD ──────────────────────────────────────
//   const summary = stats?.summary || {};
//   const charts = stats?.charts || {};

//   const visitsData = {
//     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     datasets: [{
//       label: 'Patients', data: [24, 18, 32, 28, 42, 15, 8],
//       backgroundColor: 'rgba(22,72,201,.72)', borderRadius: 7, borderWidth: 0
//     }, {
//       label: 'Appointments', data: [18, 14, 26, 22, 35, 12, 6],
//       backgroundColor: 'rgba(8,145,178,.65)', borderRadius: 7, borderWidth: 0
//     }]
//   };

//   const deptData = {
//     labels: ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'Pediatrics'],
//     datasets: [{ data: [30, 20, 18, 25, 7], backgroundColor: ['#1648c9','#0891b2','#059669','#d97706','#7c3aed'], borderWidth: 3, borderColor: '#fff' }]
//   };

//   const revenueData = {
//     labels: ['Jan','Feb','Mar','Apr','May','Jun'],
//     datasets: [{ label: 'Revenue', data: [35000,38000,42000,39000,45000,48290], borderColor: '#1648c9', backgroundColor: 'rgba(22,72,201,.06)', fill: true, tension: .4, borderWidth: 2, pointBackgroundColor: '#1648c9', pointRadius: 4 }]
//   };

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">{user?.role === 'doctor' ? 'Doctor Dashboard' : 'Admin Dashboard'}</div>
//           <div className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}!</div>
//         </div>
//         <div className="page-actions">
//           <button className="btn btn-outline btn-sm" onClick={() => navigate('/analytics')}>📄 Reports</button>
//           <button className="btn btn-primary btn-sm" onClick={() => navigate('/appointments')}>+ Appointment</button>
//         </div>
//       </div>

//       <div className="stat-grid">
//         <StatCard icon="👥" value={summary.totalPatients || 0} label="Total Patients" color="#e8effe" change={{ dir: 'up', text: '↑ 12% this month' }} delay={0} />
//         <StatCard icon="🩺" value={summary.totalDoctors || 0} label="Active Doctors" color="#e0f7fa" change={{ dir: 'up', text: '↑ 3 new' }} delay={0.07} />
//         <StatCard icon="📅" value={summary.todayAppointments || 0} label="Today's Appointments" color="#fffbeb" change={{ dir: 'up', text: '5 confirmed' }} delay={0.14} />
//         <StatCard icon="💊" value={summary.totalOrders || 0} label="Medicine Orders" color="#ecfdf5" change={{ dir: 'up', text: '↑ 8 today' }} delay={0.21} />
//         <StatCard icon="🚨" value={summary.activeAlerts || 0} label="Active Alerts" color="#fef2f2" change={{ dir: 'warn', text: 'Action needed' }} delay={0.28} />
//         <StatCard icon="⏳" value={summary.pendingUsers || 0} label="Pending Approvals" color="#f5f3ff" change={{ dir: 'warn', text: 'Requires review' }} delay={0.35} />
//       </div>

//       <div className="grid-2 mt-2">
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">📈 Patient Visits</span>
//             <select className="form-input" style={{ width: 120, padding: '5px 28px 5px 8px', fontSize: 12 }}>
//               <option>This Week</option><option>This Month</option>
//             </select>
//           </div>
//           <div className="card-body">
//             <div style={{ height: 190, position: 'relative' }}>
//               <Bar data={visitsData} options={{ ...CHART_OPTS, plugins: { legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 10 } } } }} />
//             </div>
//           </div>
//         </motion.div>
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27, duration: 0.38 }}>
//           <div className="card-header"><span className="card-title">🏥 Department Load</span></div>
//           <div className="card-body">
//             <div style={{ height: 190, position: 'relative' }}>
//               <Doughnut data={deptData} options={{ responsive: true, maintainAspectRatio: false, cutout: '67%', plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 9, padding: 6 } } } }} />
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       <div className="grid-2 mt-2">
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">📅 Recent Appointments</span>
//             <button className="btn btn-outline btn-xs" onClick={() => navigate('/appointments')}>View All</button>
//           </div>
//           <div className="card-body-0">
//             <div className="table-wrap">
//               <table>
//                 <thead><tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead>
//                 <tbody>
//                   {appointments.slice(0, 5).map(a => (
//                     <tr key={a._id}>
//                       <td><div className="td-main">{a.patient?.name}</div><div className="td-sub">{a.department}</div></td>
//                       <td className="text-sm">{a.doctor?.name}</td>
//                       <td className="text-sm">{a.timeSlot}<br /><span className="text-xs text-muted">{new Date(a.date).toLocaleDateString()}</span></td>
//                       <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>{a.status}</span></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </motion.div>
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.41, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">🚨 Alert Log</span>
//             <button className="btn btn-outline btn-xs" onClick={() => navigate('/emergency')}>View All</button>
//           </div>
//           <div className="card-body">
//             {alerts.slice(0, 3).map(a => (
//               <div key={a._id} style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 8, background: a.severity === 'critical' ? '#fef2f2' : a.severity === 'high' ? '#fffbeb' : '#f0f4ff', marginBottom: 8 }}>
//                 <span style={{ fontSize: 18 }}>{a.type === 'SOS' ? '🚨' : a.type === 'Medication' ? '⏰' : '❤️'}</span>
//                 <div style={{ flex: 1 }}>
//                   <div className="fw-7 text-sm">{a.patient?.name} · {a.type}</div>
//                   <div className="text-xs text-muted">{a.message}</div>
//                 </div>
//                 <span className={`badge badge-${a.status === 'resolved' ? 'success' : 'danger'}`}>{a.status}</span>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       </div>

//       <motion.div className="card mt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.38 }}>
//         <div className="card-header">
//           <span className="card-title">💰 Monthly Revenue</span>
//           <button className="btn btn-outline btn-xs" onClick={() => navigate('/analytics')}>Full Analytics</button>
//         </div>
//         <div className="card-body">
//           <div style={{ height: 175, position: 'relative' }}>
//             <Line data={revenueData} options={{ ...CHART_OPTS, scales: { x: { grid: { display: false } }, y: { beginAtZero: false, ticks: { callback: v => '$' + Math.round(v / 1000) + 'k' }, grid: { color: 'rgba(0,0,0,.04)' } } } }} />
//           </div>
//         </div>
//       </motion.div>
//         <div className="grid-2" style={{ marginTop:20 }}>
//           <TodayScheduleWidget />
//           <MyTasksWidget />
//         </div>
//         <div style={{ marginTop:16 }}>
//           <WeeklyTimetableWidget />
//         </div>
//         <div style={{ marginTop:16 }}>
//           <LeaveNotificationsWidget />
//         </div>
//     </div>
//   );
// }

// import React, { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Bar, Line, Doughnut } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
// import { useAuth } from '../context/AuthContext';
// import { analyticsAPI, appointmentsAPI, remindersAPI, alertsAPI } from '../utils/api';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { TodayScheduleWidget, MyTasksWidget, LeaveNotificationsWidget } from '../components/DashboardWidgets';

// ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// const CHART_OPTS = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.04)' } } } };

// function StatCard({ icon, value, label, change, color, delay = 0 }) {
//   const [count, setCount] = useState(0);
//   useEffect(() => {
//     if (!value || isNaN(value)) return;
//     let start = 0;
//     const end = parseInt(value);
//     const step = Math.ceil(end / 28);
//     const timer = setInterval(() => {
//       start = Math.min(start + step, end);
//       setCount(start);
//       if (start >= end) clearInterval(timer);
//     }, 45);
//     return () => clearInterval(timer);
//   }, [value]);

//   return (
//     <motion.div className="stat-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
//       <div className="stat-icon" style={{ background: color }}>{icon}</div>
//       <div className="stat-value">{isNaN(value) ? value : count}</div>
//       <div className="stat-label">{label}</div>
//       {change && <div className={`stat-change ${change.dir}`}>{change.text}</div>}
//     </motion.div>
//   );
// }

// export default function Dashboard() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [appointments, setAppointments] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [reminders, setReminders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [apptRes, alertRes, remRes] = await Promise.all([
//           appointmentsAPI.getAll({ limit: 6 }),
//           alertsAPI.getAll({ limit: 5 }),
//           remindersAPI.getAll({ status: 'active' }),
//         ]);
//         setAppointments(apptRes.value?.data?.data || []);
//         setAlerts(alertRes.value?.data?.data || []);
//         setReminders(remRes.value?.data?.data || []);
//         if (['admin', 'doctor'].includes(user?.role)) {
//           const anaRes = await analyticsAPI.getDashboard();
//           setStats(anaRes.data.data);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [user]);

//   if (loading) return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
//       <div className="spinner-lg" />
//     </div>
//   );

//   // ── PATIENT DASHBOARD ─────────────────────────────────────────────
//   if (user?.role === 'patient') {
//     const myAppts = appointments.filter(a => a.patient?._id === user.id || a.patient?.email === user.email);
//     const myRems = reminders.filter(r => r.patient?._id === user.id || r.patient?.email === user.email);
//     return (
//       <div>
//         <div className="page-header">
//           <div>
//             <div className="page-title">My Health Dashboard</div>
//             <div className="page-subtitle">Track your health, appointments & medications</div>
//           </div>
//           <button className="sos-button" onClick={async () => { try { await alertsAPI.create({ type: 'SOS', severity: 'critical', message: 'Emergency SOS' }); toast.error('🚨 SOS sent!', { duration: 8000 }); } catch { toast.error('SOS activated!'); } }}>
//             🚨<span>SOS</span>
//           </button>
//         </div>
//         <div className="stat-grid">
//           <StatCard icon="❤️" value="120/80" label="Blood Pressure" color="#fef2f2" delay={0} />
//           <StatCard icon="💓" value={72} label="Pulse (bpm)" color="#e8effe" delay={0.06} />
//           <StatCard icon="🌡️" value="98.6°F" label="Temperature" color="#fffbeb" delay={0.12} />
//           <StatCard icon="🩸" value="98%" label="SpO2" color="#ecfdf5" delay={0.18} />
//         </div>
//         <div className="grid-2">
//           <div className="card">
//             <div className="card-header">
//               <span className="card-title">📅 My Appointments</span>
//               <button className="btn btn-primary btn-xs" onClick={() => navigate('/appointments')}>Book New</button>
//             </div>
//             <div className="card-body-0">
//               <div className="table-wrap">
//                 <table>
//                   <thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
//                   <tbody>
//                     {myAppts.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No appointments yet</td></tr>
//                       : myAppts.slice(0, 4).map(a => (
//                       <tr key={a._id}>
//                         <td><div className="td-main">{a.doctor?.name}</div><div className="td-sub">{a.department}</div></td>
//                         <td className="text-sm">{new Date(a.date).toLocaleDateString()}<br /><span className="text-xs text-muted">{a.timeSlot}</span></td>
//                         <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>{a.status}</span></td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//           <div className="card">
//             <div className="card-header"><span className="card-title">⏰ Today's Medications</span></div>
//             <div className="card-body">
//               {myRems.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No reminders set</div>
//                 : myRems.slice(0, 4).map(r => (
//                 <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: 8, border: '1.5px solid #e2e8f0', marginBottom: 8, transition: 'border-color .18s' }}
//                   onMouseEnter={e => { e.currentTarget.style.borderColor = '#1648c9'; }}
//                   onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
//                 >
//                   <span style={{ fontSize: 22 }}>💊</span>
//                   <div style={{ flex: 1 }}><div className="fw-7 text-sm">{r.medicineName}</div><div className="text-xs text-muted">{r.dose} · {r.times?.[0]}</div></div>
//                   <button className="btn btn-success btn-xs" onClick={(e) => { e.currentTarget.textContent = '✓ Done'; e.currentTarget.disabled = true; e.currentTarget.className = 'btn btn-outline btn-xs'; toast.success('Medication marked as taken!'); }}>✓ Taken</button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── ADMIN / DOCTOR DASHBOARD ──────────────────────────────────────
//   const summary = stats?.summary || {};
//   const charts = stats?.charts || {};

//   const visitsData = {
//     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
//     datasets: [{
//       label: 'Patients', data: [24, 18, 32, 28, 42, 15, 8],
//       backgroundColor: 'rgba(22,72,201,.72)', borderRadius: 7, borderWidth: 0
//     }, {
//       label: 'Appointments', data: [18, 14, 26, 22, 35, 12, 6],
//       backgroundColor: 'rgba(8,145,178,.65)', borderRadius: 7, borderWidth: 0
//     }]
//   };

//   const deptData = {
//     labels: ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'Pediatrics'],
//     datasets: [{ data: [30, 20, 18, 25, 7], backgroundColor: ['#1648c9','#0891b2','#059669','#d97706','#7c3aed'], borderWidth: 3, borderColor: '#fff' }]
//   };

//   const revenueData = {
//     labels: ['Jan','Feb','Mar','Apr','May','Jun'],
//     datasets: [{ label: 'Revenue', data: [35000,38000,42000,39000,45000,48290], borderColor: '#1648c9', backgroundColor: 'rgba(22,72,201,.06)', fill: true, tension: .4, borderWidth: 2, pointBackgroundColor: '#1648c9', pointRadius: 4 }]
//   };

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">{user?.role === 'doctor' ? 'Doctor Dashboard' : 'Admin Dashboard'}</div>
//           <div className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}!</div>
//         </div>
//         <div className="page-actions">
//           <button className="btn btn-outline btn-sm" onClick={() => navigate('/analytics')}>📄 Reports</button>
//           <button className="btn btn-primary btn-sm" onClick={() => navigate('/appointments')}>+ Appointment</button>
//         </div>
//       </div>

//       <div className="stat-grid">
//         <StatCard icon="👥" value={summary.totalPatients || 0} label="Total Patients" color="#e8effe" change={{ dir: 'up', text: '↑ 12% this month' }} delay={0} />
//         <StatCard icon="🩺" value={summary.totalDoctors || 0} label="Active Doctors" color="#e0f7fa" change={{ dir: 'up', text: '↑ 3 new' }} delay={0.07} />
//         <StatCard icon="📅" value={summary.todayAppointments || 0} label="Today's Appointments" color="#fffbeb" change={{ dir: 'up', text: '5 confirmed' }} delay={0.14} />
//         <StatCard icon="💊" value={summary.totalOrders || 0} label="Medicine Orders" color="#ecfdf5" change={{ dir: 'up', text: '↑ 8 today' }} delay={0.21} />
//         <StatCard icon="🚨" value={summary.activeAlerts || 0} label="Active Alerts" color="#fef2f2" change={{ dir: 'warn', text: 'Action needed' }} delay={0.28} />
//         <StatCard icon="⏳" value={summary.pendingUsers || 0} label="Pending Approvals" color="#f5f3ff" change={{ dir: 'warn', text: 'Requires review' }} delay={0.35} />
//       </div>

//       <div className="grid-2 mt-2">
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">📈 Patient Visits</span>
//             <select className="form-input" style={{ width: 120, padding: '5px 28px 5px 8px', fontSize: 12 }}>
//               <option>This Week</option><option>This Month</option>
//             </select>
//           </div>
//           <div className="card-body">
//             <div style={{ height: 190, position: 'relative' }}>
//               <Bar data={visitsData} options={{ ...CHART_OPTS, plugins: { legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 10 } } } }} />
//             </div>
//           </div>
//         </motion.div>
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27, duration: 0.38 }}>
//           <div className="card-header"><span className="card-title">🏥 Department Load</span></div>
//           <div className="card-body">
//             <div style={{ height: 190, position: 'relative' }}>
//               <Doughnut data={deptData} options={{ responsive: true, maintainAspectRatio: false, cutout: '67%', plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 9, padding: 6 } } } }} />
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       <div className="grid-2 mt-2">
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">📅 Recent Appointments</span>
//             <button className="btn btn-outline btn-xs" onClick={() => navigate('/appointments')}>View All</button>
//           </div>
//           <div className="card-body-0">
//             <div className="table-wrap">
//               <table>
//                 <thead><tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead>
//                 <tbody>
//                   {appointments.slice(0, 5).map(a => (
//                     <tr key={a._id}>
//                       <td><div className="td-main">{a.patient?.name}</div><div className="td-sub">{a.department}</div></td>
//                       <td className="text-sm">{a.doctor?.name}</td>
//                       <td className="text-sm">{a.timeSlot}<br /><span className="text-xs text-muted">{new Date(a.date).toLocaleDateString()}</span></td>
//                       <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>{a.status}</span></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </motion.div>
//         <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.41, duration: 0.38 }}>
//           <div className="card-header">
//             <span className="card-title">🚨 Alert Log</span>
//             <button className="btn btn-outline btn-xs" onClick={() => navigate('/emergency')}>View All</button>
//           </div>
//           <div className="card-body">
//             {alerts.slice(0, 3).map(a => (
//               <div key={a._id} style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 8, background: a.severity === 'critical' ? '#fef2f2' : a.severity === 'high' ? '#fffbeb' : '#f0f4ff', marginBottom: 8 }}>
//                 <span style={{ fontSize: 18 }}>{a.type === 'SOS' ? '🚨' : a.type === 'Medication' ? '⏰' : '❤️'}</span>
//                 <div style={{ flex: 1 }}>
//                   <div className="fw-7 text-sm">{a.patient?.name} · {a.type}</div>
//                   <div className="text-xs text-muted">{a.message}</div>
//                 </div>
//                 <span className={`badge badge-${a.status === 'resolved' ? 'success' : 'danger'}`}>{a.status}</span>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       </div>

//       <motion.div className="card mt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.38 }}>
//         <div className="card-header">
//           <span className="card-title">💰 Monthly Revenue</span>
//           <button className="btn btn-outline btn-xs" onClick={() => navigate('/analytics')}>Full Analytics</button>
//         </div>
//         <div className="card-body">
//           <div style={{ height: 175, position: 'relative' }}>
//             <Line data={revenueData} options={{ ...CHART_OPTS, scales: { x: { grid: { display: false } }, y: { beginAtZero: false, ticks: { callback: v => '$' + Math.round(v / 1000) + 'k' }, grid: { color: 'rgba(0,0,0,.04)' } } } }} />
//           </div>
//         </div>
//       </motion.div>
//         <div className="grid-2" style={{ marginTop:20 }}>
//           <TodayScheduleWidget />
//           <MyTasksWidget />
//         </div>

//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, appointmentsAPI, remindersAPI, alertsAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TodayScheduleWidget, MyTasksWidget, LeaveNotificationsWidget } from '../components/DashboardWidgets';
import MySalaryWidget from '../components/MySalaryWidget';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_OPTS = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.04)' } } } };

function StatCard({ icon, value, label, change, color, delay = 0 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!value || isNaN(value)) return;
    let start = 0;
    const end = parseInt(value);
    const step = Math.ceil(end / 28);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div className="stat-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div className="stat-value">{isNaN(value) ? value : count}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${change.dir}`}>{change.text}</div>}
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, alertRes, remRes] = await Promise.allSettled([
          appointmentsAPI.getAll({ limit: 6 }),
          alertsAPI.getAll({ limit: 5 }),
          remindersAPI.getAll({ status: 'active' }),
        ]);
        setAppointments(apptRes.value?.data?.data || []);
        setAlerts(alertRes.value?.data?.data || []);
        setReminders(remRes.value?.data?.data || []);
        if (['admin', 'doctor'].includes(user?.role)) {
          const anaRes = await analyticsAPI.getDashboard();
          setStats(anaRes.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner-lg" />
    </div>
  );

  // ── PATIENT DASHBOARD ─────────────────────────────────────────────
  if (user?.role === 'patient') {
    const myAppts = appointments.filter(a => a.patient?._id === user.id || a.patient?.email === user.email);
    const myRems = reminders.filter(r => r.patient?._id === user.id || r.patient?.email === user.email);
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">My Health Dashboard</div>
            <div className="page-subtitle">Track your health, appointments & medications</div>
          </div>
          <button className="sos-button" onClick={async () => { try { await alertsAPI.create({ type: 'SOS', severity: 'critical', message: 'Emergency SOS' }); toast.error('🚨 SOS sent!', { duration: 8000 }); } catch { toast.error('SOS activated!'); } }}>
            🚨<span>SOS</span>
          </button>
        </div>
        <div className="stat-grid">
          <StatCard icon="❤️" value="120/80" label="Blood Pressure" color="#fef2f2" delay={0} />
          <StatCard icon="💓" value={72} label="Pulse (bpm)" color="#e8effe" delay={0.06} />
          <StatCard icon="🌡️" value="98.6°F" label="Temperature" color="#fffbeb" delay={0.12} />
          <StatCard icon="🩸" value="98%" label="SpO2" color="#ecfdf5" delay={0.18} />
        </div>
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">📅 My Appointments</span>
              <button className="btn btn-primary btn-xs" onClick={() => navigate('/appointments')}>Book New</button>
            </div>
            <div className="card-body-0">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {myAppts.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No appointments yet</td></tr>
                      : myAppts.slice(0, 4).map(a => (
                      <tr key={a._id}>
                        <td><div className="td-main">{a.doctor?.name}</div><div className="td-sub">{a.department}</div></td>
                        <td className="text-sm">{new Date(a.date).toLocaleDateString()}<br /><span className="text-xs text-muted">{a.timeSlot}</span></td>
                        <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">⏰ Today's Medications</span></div>
            <div className="card-body">
              {myRems.length === 0 ? <div style={{ textAlign: 'center', padding: 20, color: '#94a3b8' }}>No reminders set</div>
                : myRems.slice(0, 4).map(r => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: 8, border: '1.5px solid #e2e8f0', marginBottom: 8, transition: 'border-color .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1648c9'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <span style={{ fontSize: 22 }}>💊</span>
                  <div style={{ flex: 1 }}><div className="fw-7 text-sm">{r.medicineName}</div><div className="text-xs text-muted">{r.dose} · {r.times?.[0]}</div></div>
                  <button className="btn btn-success btn-xs" onClick={(e) => { e.currentTarget.textContent = '✓ Done'; e.currentTarget.disabled = true; e.currentTarget.className = 'btn btn-outline btn-xs'; toast.success('Medication marked as taken!'); }}>✓ Taken</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ADMIN / DOCTOR DASHBOARD ──────────────────────────────────────
  const summary = stats?.summary || {};
  const charts = stats?.charts || {};

  const visitsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Patients', data: [24, 18, 32, 28, 42, 15, 8],
      backgroundColor: 'rgba(22,72,201,.72)', borderRadius: 7, borderWidth: 0
    }, {
      label: 'Appointments', data: [18, 14, 26, 22, 35, 12, 6],
      backgroundColor: 'rgba(8,145,178,.65)', borderRadius: 7, borderWidth: 0
    }]
  };

  const deptData = {
    labels: ['Cardiology', 'Neurology', 'Orthopedics', 'General', 'Pediatrics'],
    datasets: [{ data: [30, 20, 18, 25, 7], backgroundColor: ['#1648c9','#0891b2','#059669','#d97706','#7c3aed'], borderWidth: 3, borderColor: '#fff' }]
  };

  const revenueData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{ label: 'Revenue', data: [35000,38000,42000,39000,45000,48290], borderColor: '#1648c9', backgroundColor: 'rgba(22,72,201,.06)', fill: true, tension: .4, borderWidth: 2, pointBackgroundColor: '#1648c9', pointRadius: 4 }]
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{user?.role === 'doctor' ? 'Doctor Dashboard' : 'Admin Dashboard'}</div>
          <div className="page-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}!</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/analytics')}>📄 Reports</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/appointments')}>+ Appointment</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="👥" value={summary.totalPatients || 0} label="Total Patients" color="#e8effe" change={{ dir: 'up', text: '↑ 12% this month' }} delay={0} />
        <StatCard icon="🩺" value={summary.totalDoctors || 0} label="Active Doctors" color="#e0f7fa" change={{ dir: 'up', text: '↑ 3 new' }} delay={0.07} />
        <StatCard icon="📅" value={summary.todayAppointments || 0} label="Today's Appointments" color="#fffbeb" change={{ dir: 'up', text: '5 confirmed' }} delay={0.14} />
        <StatCard icon="💊" value={summary.totalOrders || 0} label="Medicine Orders" color="#ecfdf5" change={{ dir: 'up', text: '↑ 8 today' }} delay={0.21} />
        <StatCard icon="🚨" value={summary.activeAlerts || 0} label="Active Alerts" color="#fef2f2" change={{ dir: 'warn', text: 'Action needed' }} delay={0.28} />
        <StatCard icon="⏳" value={summary.pendingUsers || 0} label="Pending Approvals" color="#f5f3ff" change={{ dir: 'warn', text: 'Requires review' }} delay={0.35} />
      </div>

      <div className="grid-2 mt-2">
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.38 }}>
          <div className="card-header">
            <span className="card-title">📈 Patient Visits</span>
            <select className="form-input" style={{ width: 120, padding: '5px 28px 5px 8px', fontSize: 12 }}>
              <option>This Week</option><option>This Month</option>
            </select>
          </div>
          <div className="card-body">
            <div style={{ height: 190, position: 'relative' }}>
              <Bar data={visitsData} options={{ ...CHART_OPTS, plugins: { legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 10 } } } }} />
            </div>
          </div>
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27, duration: 0.38 }}>
          <div className="card-header"><span className="card-title">🏥 Department Load</span></div>
          <div className="card-body">
            <div style={{ height: 190, position: 'relative' }}>
              <Doughnut data={deptData} options={{ responsive: true, maintainAspectRatio: false, cutout: '67%', plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 9, padding: 6 } } } }} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid-2 mt-2">
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.38 }}>
          <div className="card-header">
            <span className="card-title">📅 Recent Appointments</span>
            <button className="btn btn-outline btn-xs" onClick={() => navigate('/appointments')}>View All</button>
          </div>
          <div className="card-body-0">
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>
                  {appointments.slice(0, 5).map(a => (
                    <tr key={a._id}>
                      <td><div className="td-main">{a.patient?.name}</div><div className="td-sub">{a.department}</div></td>
                      <td className="text-sm">{a.doctor?.name}</td>
                      <td className="text-sm">{a.timeSlot}<br /><span className="text-xs text-muted">{new Date(a.date).toLocaleDateString()}</span></td>
                      <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'pending' ? 'warning' : 'danger'}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.41, duration: 0.38 }}>
          <div className="card-header">
            <span className="card-title">🚨 Alert Log</span>
            <button className="btn btn-outline btn-xs" onClick={() => navigate('/emergency')}>View All</button>
          </div>
          <div className="card-body">
            {alerts.slice(0, 3).map(a => (
              <div key={a._id} style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 8, background: a.severity === 'critical' ? '#fef2f2' : a.severity === 'high' ? '#fffbeb' : '#f0f4ff', marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{a.type === 'SOS' ? '🚨' : a.type === 'Medication' ? '⏰' : '❤️'}</span>
                <div style={{ flex: 1 }}>
                  <div className="fw-7 text-sm">{a.patient?.name} · {a.type}</div>
                  <div className="text-xs text-muted">{a.message}</div>
                </div>
                <span className={`badge badge-${a.status === 'resolved' ? 'success' : 'danger'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div className="card mt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.38 }}>
        <div className="card-header">
          <span className="card-title">💰 Monthly Revenue</span>
          <button className="btn btn-outline btn-xs" onClick={() => navigate('/analytics')}>Full Analytics</button>
        </div>
        <div className="card-body">
          <div style={{ height: 175, position: 'relative' }}>
            <Line data={revenueData} options={{ ...CHART_OPTS, scales: { x: { grid: { display: false } }, y: { beginAtZero: false, ticks: { callback: v => '$' + Math.round(v / 1000) + 'k' }, grid: { color: 'rgba(0,0,0,.04)' } } } }} />
          </div>
        </div>
      </motion.div>
        <div className="grid-2" style={{ marginTop:20 }}>
          <TodayScheduleWidget />
          <MyTasksWidget />
        </div>
        <div className="grid-2" style={{ marginTop:16 }}>
          <LeaveNotificationsWidget />
          <MySalaryWidget />
        </div>

    </div>
  );
}


