import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['All','General','Emergency','Clinical','Administrative','HR','Pharmacy','Maintenance'];
const PRIORITIES = { urgent:'🔴', high:'🟠', medium:'🟡', low:'🟢' };

const SAMPLE_NOTICES = [
  { id:1, title:'Hospital Infection Control Protocol Update', category:'Clinical', priority:'urgent', author:'Dr. Admin', date:new Date(Date.now()-3600000), pinned:true, content:'All clinical staff must follow updated hand hygiene protocols effective immediately. N95 masks mandatory in ICU and OT areas. Please read the attached circular and sign the acknowledgment form at the nursing station.' },
  { id:2, title:'OT Schedule Change — 15th Jan', category:'Clinical', priority:'high', author:'OT Coordinator', date:new Date(Date.now()-86400000), pinned:true, content:'OT-02 will be under maintenance from 8 AM to 2 PM on 15th January. All scheduled surgeries have been moved to OT-01 and OT-03. Please coordinate with the respective surgical teams.' },
  { id:3, title:'New Pharmacy System Launched', category:'Pharmacy', priority:'medium', author:'Pharmacist Head', date:new Date(Date.now()-172800000), pinned:false, content:'The new automated pharmacy dispensing system is now live. All staff placing medicine orders must use the new system via the HMS portal. Training sessions available Mon–Wed 2–4 PM.' },
  { id:4, title:'Blood Donation Camp — 20th Jan', category:'General', priority:'medium', author:'HR Department', date:new Date(Date.now()-259200000), pinned:false, content:'The annual blood donation camp will be held on 20th January in the hospital auditorium. All eligible staff are encouraged to participate. Free health checkup for all donors.' },
  { id:5, title:'Emergency Drill Scheduled', category:'Emergency', priority:'high', author:'Safety Officer', date:new Date(Date.now()-345600000), pinned:false, content:'A fire safety and mass casualty emergency drill is scheduled for 22nd January at 10:00 AM. All departments must participate. Evacuation routes will be tested. Please review your department\'s emergency protocol.' },
  { id:6, title:'Salary Slips for December Available', category:'HR', priority:'low', author:'HR Department', date:new Date(Date.now()-432000000), pinned:false, content:'December salary slips are now available in the employee self-service portal. Please verify and report any discrepancies to the HR department by 25th January.' },
  { id:7, title:'New Visiting Hours Policy', category:'Administrative', priority:'medium', author:'Hospital Admin', date:new Date(Date.now()-518400000), pinned:false, content:'Effective from 1st February, visiting hours are updated to 10 AM–12 PM and 5 PM–7 PM daily. ICU visiting is limited to 15 minutes per session with max 2 visitors. Please communicate this to all patients and families.' },
];

export default function NoticeBoardPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState(SAMPLE_NOTICES);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title:'', category:'General', priority:'medium', content:'' });

  const isAdmin = ['admin','doctor'].includes(user?.role);
  const filtered = filter==='All' ? notices : notices.filter(n=>n.category===filter);
  const pinned = filtered.filter(n=>n.pinned);
  const regular = filtered.filter(n=>!n.pinned);

  const handleCreate = () => {
    if (!form.title.trim()||!form.content.trim()) { toast.error('Title and content required'); return; }
    const n = { id:Date.now(), ...form, author:user?.name, date:new Date(), pinned:false };
    setNotices(ns=>[n,...ns]);
    setShowCreate(false);
    setForm({ title:'', category:'General', priority:'medium', content:'' });
    toast.success('Notice posted!');
  };

  const NoticeCard = ({ n }) => (
    <motion.div onClick={()=>setSelected(n)} whileHover={{ y:-2 }}
      style={{ background:'#fff', border:`1.5px solid ${n.pinned?'#fde68a':'#e8edf3'}`, borderRadius:14, padding:'16px', cursor:'pointer', transition:'all .2s', position:'relative' }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.09)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
      {n.pinned&&<div style={{ position:'absolute',top:12,right:12,fontSize:14 }}>📌</div>}
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
        <span>{PRIORITIES[n.priority]}</span>
        <span style={{ padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:700,background:'#f1f5f9',color:'#374151' }}>{n.category}</span>
        <span style={{ marginLeft:'auto',fontSize:11,color:'#94a3b8' }}>{new Date(n.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
      </div>
      <h3 style={{ fontSize:14,fontWeight:800,color:'#0f172a',margin:'0 0 6px',lineHeight:1.3 }}>{n.title}</h3>
      <p style={{ fontSize:12.5,color:'#64748b',margin:0,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{n.content}</p>
      <div style={{ fontSize:11.5,color:'#94a3b8',marginTop:8 }}>— {n.author}</div>
    </motion.div>
  );

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10 }}>
        <div><h1 style={{ fontSize:22,fontWeight:800,color:'#0f172a',margin:0 }}>📢 Notice Board</h1><p style={{ color:'#94a3b8',fontSize:13,marginTop:3 }}>{notices.length} notices · {pinned.length} pinned</p></div>
        {isAdmin&&<button onClick={()=>setShowCreate(true)} style={{ padding:'9px 18px',borderRadius:12,border:'none',background:'#2563eb',color:'#fff',fontFamily:'inherit',fontWeight:700,fontSize:13,cursor:'pointer' }}>+ Post Notice</button>}
      </div>

      <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:20 }}>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setFilter(c)}
            style={{ padding:'5px 14px',borderRadius:20,border:`1.5px solid ${filter===c?'#2563eb':'#e2e8f0'}`,background:filter===c?'#2563eb':'#fff',color:filter===c?'#fff':'#64748b',fontFamily:'inherit',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s' }}>
            {c}
          </button>
        ))}
      </div>

      {pinned.length>0&&<div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11,color:'#94a3b8',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:10 }}>📌 Pinned Notices</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12 }}>
          {pinned.map(n=><NoticeCard key={n.id} n={n} />)}
        </div>
      </div>}

      <div style={{ fontSize:11,color:'#94a3b8',fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:10 }}>All Notices</div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12 }}>
        {regular.map(n=><NoticeCard key={n.id} n={n} />)}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected&&(
          <div onClick={e=>{if(e.target===e.currentTarget)setSelected(null)}} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16 }}>
            <motion.div initial={{ opacity:0,y:20,scale:.96 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:20,scale:.96 }}
              style={{ background:'#fff',borderRadius:20,width:'100%',maxWidth:560,boxShadow:'0 32px 80px rgba(0,0,0,.2)',overflow:'hidden' }}>
              <div style={{ background:'linear-gradient(135deg,#1e3a8a,#2563eb)',padding:'18px 22px' }}>
                <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12 }}>
                  <div>
                    <div style={{ display:'flex',gap:8,marginBottom:8 }}>
                      <span>{PRIORITIES[selected.priority]}</span>
                      <span style={{ padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:700,background:'rgba(255,255,255,.2)',color:'#fff' }}>{selected.category}</span>
                      {selected.pinned&&<span style={{ fontSize:13 }}>📌</span>}
                    </div>
                    <h2 style={{ color:'#fff',fontWeight:800,fontSize:17,margin:0 }}>{selected.title}</h2>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{ background:'rgba(255,255,255,.2)',border:'none',borderRadius:'50%',width:28,height:28,cursor:'pointer',color:'#fff',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>✕</button>
                </div>
              </div>
              <div style={{ padding:'20px 22px' }}>
                <div style={{ fontSize:11.5,color:'#94a3b8',marginBottom:14,display:'flex',gap:16 }}>
                  <span>👤 {selected.author}</span>
                  <span>📅 {new Date(selected.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
                </div>
                <p style={{ fontSize:14,color:'#374151',lineHeight:1.7,margin:0 }}>{selected.content}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate&&(
          <div onClick={e=>{if(e.target===e.currentTarget)setShowCreate(false)}} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16 }}>
            <motion.div initial={{ opacity:0,y:20,scale:.96 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0,y:20,scale:.96 }}
              style={{ background:'#fff',borderRadius:20,width:'100%',maxWidth:500,boxShadow:'0 32px 80px rgba(0,0,0,.2)',padding:'24px' }}>
              <h3 style={{ fontSize:17,fontWeight:800,margin:'0 0 20px' }}>📢 Post New Notice</h3>
              {[['Title *','title','text'],['Category','category','select',CATEGORIES.slice(1)],['Priority','priority','select',['urgent','high','medium','low']]].map(([l,k,t,opts])=>(
                <div key={k} style={{ marginBottom:12 }}>
                  <label style={{ display:'block',fontSize:11,fontWeight:700,color:'#374151',marginBottom:5,textTransform:'uppercase',letterSpacing:.4 }}>{l}</label>
                  {t==='select'?
                    <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontFamily:'inherit',fontSize:13.5,outline:'none',background:'#fff',boxSizing:'border-box' }}>
                      {opts.map(o=><option key={o}>{o}</option>)}
                    </select>:
                    <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontFamily:'inherit',fontSize:13.5,outline:'none',boxSizing:'border-box' }} />
                  }
                </div>
              ))}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:'block',fontSize:11,fontWeight:700,color:'#374151',marginBottom:5,textTransform:'uppercase',letterSpacing:.4 }}>Content *</label>
                <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} rows={4} style={{ width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontFamily:'inherit',fontSize:13.5,outline:'none',resize:'none',boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button onClick={()=>setShowCreate(false)} style={{ flex:1,padding:'11px',borderRadius:12,border:'1.5px solid #e2e8f0',background:'#fff',fontFamily:'inherit',fontWeight:700,cursor:'pointer' }}>Cancel</button>
                <button onClick={handleCreate} style={{ flex:2,padding:'11px',borderRadius:12,border:'none',background:'#2563eb',color:'#fff',fontFamily:'inherit',fontWeight:700,cursor:'pointer' }}>📢 Post Notice</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
