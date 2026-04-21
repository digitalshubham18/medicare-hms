import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../utils/socket';
import { alertsAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import SupportBot from '../SupportBot';

const NAV = {
  admin: [
    { sec:'Overview', items:[{id:'dashboard',icon:'📊',label:'Dashboard'},{id:'analytics',icon:'📈',label:'Analytics'}]},
    { sec:'Management', items:[{id:'patients',icon:'👥',label:'Patients'},{id:'doctors',icon:'🩺',label:'Doctors'},{id:'user-approval',icon:'👤',label:'Approvals',badge:'pending'},{id:'appointments',icon:'📅',label:'Appointments'}]},
    { sec:'Hospital', items:[{id:'pharmacy',icon:'💊',label:'Pharmacy'},{id:'orders',icon:'🛒',label:'Orders'},{id:'records',icon:'📋',label:'Records'},{id:'emergency',icon:'🚨',label:'Emergency',badge:'alerts'}]},
    { sec:'Facility', items:[{id:'rooms',icon:'🏥',label:'Rooms & OT'},{id:'maintenance-admin',icon:'🔧',label:'Maintenance Hub',badge:'maint'},{id:'chat',icon:'💬',label:'Chat'}]},
    { sec:'Timetable', items:[{id:'admin-timetable',icon:'📆',label:'All Timetables'},{id:'my-timetable',icon:'🗓️',label:'My Schedule'}]},
    { sec:'HR & Staff', items:[{id:'leaves',icon:'🌴',label:'Leaves'},{id:'salary',icon:'💰',label:'Salary'},{id:'notice-board',icon:'📢',label:'Notice Board'}]},
    { sec:'Tools', items:[{id:'reminders',icon:'⏰',label:'Reminders'},{id:'symptom-checker',icon:'🤖',label:'AI Checker'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
  doctor: [
    { sec:'Practice', items:[{id:'dashboard',icon:'📊',label:'Dashboard'},{id:'appointments',icon:'📅',label:'Appointments'},{id:'patients',icon:'👥',label:'Patients'}]},
    { sec:'Clinical', items:[{id:'records',icon:'📋',label:'Records'},{id:'prescriptions',icon:'📝',label:'Prescriptions'},{id:'emergency',icon:'🚨',label:'Alerts',badge:'alerts'}]},
    { sec:'Schedule', items:[{id:'my-timetable',icon:'📅',label:'My Timetable'},{id:'rooms',icon:'🏥',label:'Rooms & OT'},{id:'chat',icon:'💬',label:'Chat'}]},
    { sec:'HR', items:[{id:'leaves',icon:'🌴',label:'My Leaves'},{id:'salary',icon:'💰',label:'My Salary'},{id:'notice-board',icon:'📢',label:'Notice Board'}]},
    { sec:'Tools', items:[{id:'symptom-checker',icon:'🤖',label:'AI Checker'},{id:'reminders',icon:'⏰',label:'Reminders'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
  patient: [
    { sec:'My Health', items:[{id:'dashboard',icon:'📊',label:'Dashboard'},{id:'appointments',icon:'📅',label:'Appointments'},{id:'records',icon:'📋',label:'My Records'}]},
    { sec:'Pharmacy', items:[{id:'pharmacy',icon:'💊',label:'Order Medicine'},{id:'orders',icon:'🛒',label:'My Orders'},{id:'reminders',icon:'⏰',label:'Reminders'}]},
    { sec:'Help', items:[{id:'emergency',icon:'🚨',label:'SOS Emergency'},{id:'symptom-checker',icon:'🤖',label:'AI Checker'},{id:'notice-board',icon:'📢',label:'Notice Board'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
  nurse: [
    { sec:'Ward', items:[{id:'dashboard',icon:'📊',label:'Dashboard'},{id:'patients',icon:'👥',label:'Patients'},{id:'records',icon:'📋',label:'Records'}]},
    { sec:'Schedule', items:[{id:'my-timetable',icon:'📅',label:'My Timetable'},{id:'rooms',icon:'🏥',label:'Rooms'},{id:'chat',icon:'💬',label:'Chat'}]},
    { sec:'Clinical', items:[{id:'emergency',icon:'🚨',label:'Alerts'},{id:'reminders',icon:'⏰',label:'Reminders'}]},
    { sec:'HR', items:[{id:'leaves',icon:'🌴',label:'My Leaves'},{id:'salary',icon:'💰',label:'My Salary'},{id:'notice-board',icon:'📢',label:'Notice Board'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
  pharmacist: [
    { sec:'Pharmacy', items:[{id:'dashboard',icon:'📊',label:'Dashboard'},{id:'pharmacy',icon:'💊',label:'Inventory'},{id:'orders',icon:'🛒',label:'Orders'}]},
    { sec:'Schedule', items:[{id:'my-timetable',icon:'📅',label:'My Timetable'},{id:'chat',icon:'💬',label:'Chat'}]},
    { sec:'HR', items:[{id:'leaves',icon:'🌴',label:'My Leaves'},{id:'salary',icon:'💰',label:'My Salary'},{id:'notice-board',icon:'📢',label:'Notice Board'},{id:'reminders',icon:'⏰',label:'Reminders'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
  wardboy: [
    { sec:'My Work', items:[{id:'staff-dashboard',icon:'🛏️',label:'Dashboard'},{id:'rooms',icon:'🏥',label:'Rooms'}]},
    { sec:'Schedule', items:[{id:'my-timetable',icon:'📅',label:'My Timetable'}]},
    { sec:'HR', items:[{id:'leaves',icon:'🌴',label:'My Leaves'},{id:'salary',icon:'💰',label:'My Salary'},{id:'notice-board',icon:'📢',label:'Notice Board'},{id:'chat',icon:'💬',label:'Chat'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
  sweeper: [
    { sec:'My Work', items:[{id:'maintenance-dashboard',icon:'🧹',label:'Dashboard'}]},
    { sec:'Schedule', items:[{id:'my-timetable',icon:'📅',label:'My Timetable'}]},
    { sec:'HR', items:[{id:'leaves',icon:'🌴',label:'My Leaves'},{id:'salary',icon:'💰',label:'My Salary'},{id:'notice-board',icon:'📢',label:'Notice Board'},{id:'chat',icon:'💬',label:'Chat'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
  otboy: [
    { sec:'My Work', items:[{id:'staff-dashboard',icon:'🔪',label:'Dashboard'},{id:'rooms',icon:'🏥',label:'OT Rooms'}]},
    { sec:'Schedule', items:[{id:'my-timetable',icon:'📅',label:'My Timetable'}]},
    { sec:'HR', items:[{id:'leaves',icon:'🌴',label:'My Leaves'},{id:'salary',icon:'💰',label:'My Salary'},{id:'notice-board',icon:'📢',label:'Notice Board'},{id:'chat',icon:'💬',label:'Chat'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
  finance: [
    { sec:'Finance', items:[{id:'finance',icon:'💰',label:'Dashboard'},{id:'salary',icon:'💵',label:'Salary Mgmt'}]},
    { sec:'Schedule', items:[{id:'my-timetable',icon:'📅',label:'My Timetable'}]},
    { sec:'HR', items:[{id:'leaves',icon:'🌴',label:'My Leaves'},{id:'notice-board',icon:'📢',label:'Notice Board'},{id:'chat',icon:'💬',label:'Chat'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ],
};

// All maintenance specialist roles share the same nav structure, just different icons
const MAINT_ROLES = {
  electrician:     { icon:'⚡',  label:'Electrician',      color:'#f59e0b' },
  plumber:         { icon:'🔧',  label:'Plumber',          color:'#0891b2' },
  it_technician:   { icon:'💻',  label:'IT Technician',    color:'#6366f1' },
  equipment_tech:  { icon:'🔩',  label:'Equipment Tech',   color:'#8b5cf6' },
  biomedical:      { icon:'🩺',  label:'Biomedical Eng.',  color:'#059669' },
  security:        { icon:'🔐',  label:'Security Officer', color:'#374151' },
  receptionist:    { icon:'🏨',  label:'Receptionist',     color:'#db2777' },
  ambulance_driver:{ icon:'🚑',  label:'Ambulance Driver', color:'#dc2626' },
};

function maintNav(role) {
  const cfg = MAINT_ROLES[role] || { icon:'🔧', label:'Staff' };
  return [
    { sec:'My Work', items:[{id:'maintenance-dashboard',icon:cfg.icon,label:'My Dashboard'}]},
    { sec:'Schedule', items:[{id:'my-timetable',icon:'📅',label:'My Timetable'}]},
    { sec:'HR', items:[{id:'leaves',icon:'🌴',label:'My Leaves'},{id:'salary',icon:'💰',label:'My Salary'},{id:'notice-board',icon:'📢',label:'Notice Board'},{id:'chat',icon:'💬',label:'Chat'},{id:'settings',icon:'⚙️',label:'Settings'}]},
  ];
}

const ROLE_COLORS = { admin:'#6366f1',doctor:'#0891b2',patient:'#7c3aed',nurse:'#db2777',pharmacist:'#d97706',wardboy:'#059669',sweeper:'#f59e0b',otboy:'#8b5cf6',finance:'#8b5cf6',electrician:'#f59e0b',plumber:'#0891b2',it_technician:'#6366f1',equipment_tech:'#8b5cf6',biomedical:'#059669',security:'#374151',receptionist:'#db2777',ambulance_driver:'#dc2626' };
const ROLE_LABELS = { admin:'Administrator',doctor:'Doctor',patient:'Patient',nurse:'Nurse',pharmacist:'Pharmacist',wardboy:'Ward Boy',sweeper:'Sweeper',otboy:'OT Boy',finance:'Finance Officer',electrician:'Electrician',plumber:'Plumber',it_technician:'IT Technician',equipment_tech:'Equipment Tech',biomedical:'Biomedical Eng.',security:'Security Officer',receptionist:'Receptionist',ambulance_driver:'Ambulance Driver' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifs, setNotifs]         = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [maintCount, setMaintCount] = useState(0);
  const page = location.pathname.replace('/','');
  const ac   = ROLE_COLORS[user?.role] || '#1648c9';

  const navConfig = MAINT_ROLES[user?.role]
    ? maintNav(user.role)
    : (NAV[user?.role] || NAV.patient);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const uid = user?._id || user?.id;
    if (uid) socket.emit('join_user_room', uid);

    socket.on('emergency_alert', d => {
      toast.error(`🚨 SOS: ${d.patientName}`, {duration:8000});
      setAlertCount(c=>c+1);
      setNotifs(p=>[{id:Date.now(),title:'🚨 Emergency SOS',msg:`${d.patientName} – ${d.message}`,icon:'🚨',bg:'#fef2f2',read:false},...p.slice(0,19)]);
    });
    socket.on('task_assigned', d => {
      toast(`📋 New task: ${d.title}`, {duration:5000});
      setNotifs(p=>[{id:Date.now(),title:'New Task Assigned',msg:d.title,icon:'📋',bg:'#eff6ff',read:false},...p.slice(0,19)]);
    });
    socket.on('leave_reviewed', d => {
      toast(`${d.status==='approved'?'✅':'❌'} Leave ${d.status}`);
      setNotifs(p=>[{id:Date.now(),title:`Leave ${d.status}`,msg:`${d.userName} – ${d.type}`,icon:'🌴',bg:'#f0fdf4',read:false},...p.slice(0,19)]);
    });
    socket.on('schedule_assigned', d => {
      toast(`📅 New shift: ${new Date(d.date).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}`);
      setNotifs(p=>[{id:Date.now(),title:'Shift Scheduled',msg:`New shift assigned`,icon:'📅',bg:'#eff6ff',read:false},...p.slice(0,19)]);
    });
    // Maintenance alerts — ALL staff except patients
    socket.on('room_maintenance', d => {
      if (user?.role==='patient') return;
      toast(`🔧 ${d.name} under maintenance`, {duration:7000,style:{background:'#fffbeb',border:'1px solid #fde68a',color:'#92400e'}});
      setMaintCount(c=>c+1);
      setNotifs(p=>[{id:Date.now(),title:'🔧 Room Maintenance',msg:`${d.name} · Room ${d.number}`,icon:'🔧',bg:'#fffbeb',read:false,urgent:true},...p.slice(0,19)]);
    });
    socket.on('room_maintenance_end', d => {
      if (user?.role==='patient') return;
      toast.success(`✅ ${d.name} maintenance complete`);
      setNotifs(p=>[{id:Date.now(),title:'✅ Maintenance Complete',msg:`${d.name} · Now ${d.newStatus}`,icon:'✅',bg:'#f0fdf4',read:false},...p.slice(0,19)]);
    });
    socket.on('low_stock_alert', d => {
      if (['admin','pharmacist'].includes(user?.role)) toast.error(`⚠️ Low stock: ${d.count} item(s)`);
    });
    return () => {
      ['emergency_alert','task_assigned','leave_reviewed','schedule_assigned','room_maintenance','room_maintenance_end','low_stock_alert'].forEach(e=>socket.off(e));
    };
  }, [user]);

  const triggerSOS = useCallback(async () => {
    try { await alertsAPI.create({type:'SOS',severity:'critical',message:'Emergency SOS from dashboard'}); toast.error('🚨 SOS ACTIVATED!',{duration:8000}); }
    catch { toast.error('SOS sent!'); }
  }, []);

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U';
  const unread   = notifs.filter(n=>!n.read).length;

  return (
    <div className="hms-layout">
      {/* ── SIDEBAR ── */}
      <motion.aside animate={{width:collapsed?56:222}} transition={{duration:.25,ease:[.4,0,.2,1]}}
        style={{background:'#0c1f4a',display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',flexShrink:0,zIndex:10}}>
        {/* Logo */}
        <div style={{padding:'16px 12px',display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid rgba(255,255,255,.06)',minHeight:60}}>
          <div style={{width:34,height:34,background:`linear-gradient(135deg,${ac},#0891b2)`,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>🏥</div>
          {!collapsed&&<motion.div initial={{opacity:0}} animate={{opacity:1}} style={{flex:1,overflow:'hidden'}}>
            <div style={{color:'#fff',fontWeight:800,fontSize:14,whiteSpace:'nowrap'}}>MediCare</div>
            <div style={{color:'#64748b',fontSize:10,whiteSpace:'nowrap',letterSpacing:.5}}>HMS v4.0</div>
          </motion.div>}
          <button onClick={()=>setCollapsed(c=>!c)}
            style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',color:'#94a3c8',cursor:'pointer',padding:'5px 7px',borderRadius:7,fontSize:12,flexShrink:0,transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center'}}
            title={collapsed?'Expand sidebar':'Collapse sidebar'}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.15)';e.currentTarget.style.color='#fff'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.07)';e.currentTarget.style.color='#94a3c8'}}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
        {/* Nav */}
        <nav style={{flex:1,overflowY:'auto',overflowX:'hidden',padding:'8px 0'}}>
          {navConfig.map(section=>(
            <div key={section.sec}>
              {!collapsed&&<div style={{color:'#475569',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.2px',padding:'9px 16px 3px',whiteSpace:'nowrap'}}>{section.sec}</div>}
              {section.items.map(item=>{
                const isActive=page===item.id||(item.id==='dashboard'&&page==='');
                return (
                  <button key={item.id} onClick={()=>navigate(`/${item.id}`)}
                    style={{display:'flex',alignItems:'center',gap:9,padding:collapsed?'9px 11px':'8px 12px',cursor:'pointer',borderRadius:7,transition:'all .15s',color:isActive?'#fff':'#94a3c8',background:isActive?`${ac}30`:'transparent',border:`1px solid ${isActive?`${ac}50`:'transparent'}`,width:'calc(100% - 12px)',margin:'1px 6px',fontSize:12.5,fontWeight:600,position:'relative',justifyContent:collapsed?'center':'flex-start'}}>
                    {isActive&&<span style={{position:'absolute',left:-6,top:'50%',transform:'translateY(-50%)',width:3,height:16,background:ac,borderRadius:'0 3px 3px 0'}}/>}
                    <span style={{fontSize:15,width:18,textAlign:'center',flexShrink:0}}>{item.icon}</span>
                    {!collapsed&&<span style={{whiteSpace:'nowrap',flex:1}}>{item.label}</span>}
                    {!collapsed&&item.badge==='alerts'&&alertCount>0&&<span style={{background:'#dc2626',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:10}}>{alertCount}</span>}
                    {!collapsed&&item.badge==='maint'&&maintCount>0&&<span style={{background:'#f59e0b',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:10}}>{maintCount}</span>}
                    {!collapsed&&item.badge==='pending'&&<span style={{background:'#f59e0b',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:10}}>!</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        {/* User footer */}
        <div style={{padding:8,borderTop:'1px solid rgba(255,255,255,.06)'}}>
          <button onClick={logout} style={{display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:8,cursor:'pointer',border:'none',background:'transparent',width:'100%',justifyContent:collapsed?'center':'flex-start',transition:'background .15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.07)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{width:30,height:30,borderRadius:'50%',background:`linear-gradient(135deg,${ac},#0891b2)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:11,flexShrink:0}}>{initials}</div>
            {!collapsed&&<div style={{flex:1,minWidth:0,textAlign:'left'}}>
              <div style={{color:'#e2e8f0',fontSize:12,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
              <div style={{color:'#475569',fontSize:10,whiteSpace:'nowrap'}}>{ROLE_LABELS[user?.role]||user?.role}</div>
            </div>}
            {!collapsed&&<span style={{color:'#475569',fontSize:11}}>🚪</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN ── */}
      <div className="content-area">
        {/* Topbar */}
        <header style={{height:60,background:'#fff',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',padding:'0 20px',gap:12,flexShrink:0,zIndex:9,boxShadow:'0 1px 4px rgba(15,23,42,.05)'}}>
          <div style={{flex:1,maxWidth:300,position:'relative'}}>
            <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#94a3b8',fontSize:14}}>🔍</span>
            <input className="form-input" style={{paddingLeft:34,borderRadius:22,background:'#f8fafc',fontSize:13}} placeholder="Search patients, medicines…"/>
          </div>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6}}>
            {user?.role!=='patient'&&<button onClick={triggerSOS} className="sos-button sos-button-sm">🚨<span>SOS</span></button>}
            {/* Notifications */}
            <div style={{position:'relative'}}>
              <button onClick={()=>setNotifsOpen(o=>!o)} style={{background:'none',border:'none',cursor:'pointer',padding:7,borderRadius:8,fontSize:17,color:'#475569',transition:'all .15s',position:'relative'}}
                onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                🔔{unread>0&&<span style={{position:'absolute',top:5,right:5,width:8,height:8,background:'#dc2626',borderRadius:'50%',border:'2px solid #fff'}}/>}
              </button>
              <AnimatePresence>
                {notifsOpen&&(
                  <motion.div initial={{opacity:0,y:-8,scale:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8}} transition={{duration:.16}}
                    style={{position:'absolute',top:46,right:0,width:340,background:'#fff',borderRadius:16,boxShadow:'0 20px 60px rgba(15,23,42,.18)',border:'1px solid #e2e8f0',zIndex:50}}>
                    <div style={{padding:'14px 16px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontWeight:800,fontSize:14,color:'#0f172a'}}>Notifications{unread>0&&<span style={{marginLeft:8,background:'#dc2626',color:'#fff',fontSize:10,padding:'2px 6px',borderRadius:10,fontWeight:700}}>{unread}</span>}</span>
                      <button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} style={{background:'none',border:'none',color:'#64748b',fontSize:12,cursor:'pointer',fontWeight:600}}>Mark all read</button>
                    </div>
                    <div style={{maxHeight:340,overflowY:'auto'}}>
                      {notifs.length===0?(
                        <div style={{padding:'32px 16px',textAlign:'center',color:'#94a3b8',fontSize:13}}><div style={{fontSize:28,marginBottom:8}}>🔕</div>No notifications yet</div>
                      ):notifs.map(n=>(
                        <div key={n.id} style={{padding:'10px 14px',borderBottom:'1px solid #f1f5f9',display:'flex',gap:10,cursor:'pointer',background:n.read?'#fff':'#f8faff',borderLeft:n.urgent?'3px solid #f59e0b':'3px solid transparent'}}
                          onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))}>
                          <div style={{width:34,height:34,borderRadius:'50%',background:n.bg||'#e8effe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{n.icon}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12.5,fontWeight:700,color:'#0f172a'}}>{n.title}</div>
                            <div style={{fontSize:11.5,color:'#94a3b8',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.msg}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div style={{width:1,height:22,background:'#e2e8f0',margin:'0 4px'}}/>
            <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'4px 8px',borderRadius:9,transition:'background .15s'}}
              onClick={()=>navigate('/settings')} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{width:34,height:34,borderRadius:'50%',background:`linear-gradient(135deg,${ac},#0891b2)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12}}>{initials}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'#0f172a'}}>{user?.name}</div>
                <div style={{fontSize:10.5,color:'#94a3b8'}}>{ROLE_LABELS[user?.role]||user?.role}</div>
              </div>
            </div>
          </div>
        </header>
        {/* Page */}
        <main className="page-content">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.25,ease:[.22,1,.36,1]}}>
              <Outlet/>
              <SupportBot/>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* Floating expand tab — visible when sidebar is collapsed */}
      {collapsed && (
        <motion.button
          initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:.1}}
          onClick={()=>setCollapsed(false)}
          title="Expand sidebar"
          style={{position:'fixed',left:56,top:'50%',transform:'translateY(-50%)',zIndex:20,background:'#1648c9',border:'none',borderRadius:'0 8px 8px 0',padding:'14px 6px',cursor:'pointer',boxShadow:'4px 0 16px rgba(22,72,201,.4)',display:'flex',alignItems:'center',justifyContent:'center'}}
        >
          <span style={{color:'#fff',fontSize:12,fontWeight:800}}>▶</span>
        </motion.button>
      )}
      {notifsOpen&&<div style={{position:'fixed',inset:0,zIndex:49}} onClick={()=>setNotifsOpen(false)}/>}
    </div>
  );
}
