import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEPT_COLORS = {
  Cardiology:'#ef4444', Neurology:'#8b5cf6', Pediatrics:'#f59e0b', Psychiatry:'#ec4899',
  Dermatology:'#10b981', Orthopedics:'#3b82f6', Oncology:'#f97316', Surgery:'#6366f1',
  'General Medicine':'#0891b2', Gynecology:'#db2777', Radiology:'#64748b', ENT:'#84cc16',
  Ophthalmology:'#06b6d4', Urology:'#7c3aed', Nephrology:'#059669',
};

const SOCIALS = [
  { key:'facebook',  icon:'f',  bg:'#1877f2', label:'Facebook' },
  { key:'linkedin',  icon:'in', bg:'#0a66c2', label:'LinkedIn' },
  { key:'twitter',   icon:'𝕏',  bg:'#000',    label:'Twitter'  },
];

export default function DoctorProfileCard({ doctor, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const deptColor = DEPT_COLORS[doctor.department] || '#2563eb';

  const tabs = [
    { key:'overview',     label:'Overview'      },
    { key:'degrees',      label:'Degrees'       },
    { key:'experience',   label:'Experience'    },
    { key:'schedule',     label:'Schedule'      },
    { key:'contact',      label:'Contact'       },
  ];

  const initials = doctor.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div style={{ background:'#fff', borderRadius:20, overflow:'hidden', maxWidth:720, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,.16)', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .tab-btn{padding:10px 16px;border:none;background:none;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;border-bottom:2.5px solid transparent;color:#94a3b8;transition:all .2s;white-space:nowrap;}
        .tab-btn.active{color:${deptColor};border-bottom-color:${deptColor};}
        .tab-btn:hover:not(.active){color:#374151;}
        .social-link{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:800;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s;font-family:inherit;}
        .social-link:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.25);}
        .info-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:#f1f5f9;border-radius:20px;font-size:11.5px;font-weight:600;color:#374151;}
        .degree-item{padding:12px 0;border-bottom:1px solid #f1f5f9;display:flex;gap:12px;align-items:flex-start;}
        .degree-item:last-child{border-bottom:none;}
        .exp-item{padding:12px 0;border-bottom:1px solid #f1f5f9;display:flex;gap:10px;align-items:flex-start;}
        .exp-item:last-child{border-bottom:none;}
        .schedule-slot{padding:8px 14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;}
        .contact-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f8fafc;}
        .contact-row:last-child{border-bottom:none;}
      `}</style>

      {/* ── Hero Banner ── */}
      <div style={{ background:`linear-gradient(135deg, ${deptColor}15, ${deptColor}08)`, padding:'28px 28px 0', borderBottom:'1px solid #f1f5f9', position:'relative', overflow:'hidden' }}>
        {/* bg deco */}
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:`${deptColor}08`, pointerEvents:'none' }} />

        <div style={{ display:'flex', gap:20, alignItems:'flex-start', marginBottom:20 }}>
          {/* Avatar */}
          <div style={{ flexShrink:0 }}>
            {doctor.avatar ? (
              <img src={doctor.avatar} alt={doctor.name} style={{ width:96, height:96, borderRadius:16, objectFit:'cover', border:`3px solid ${deptColor}30` }} />
            ) : (
              <div style={{ width:96, height:96, borderRadius:16, background:`linear-gradient(135deg,${deptColor},${deptColor}99)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:28, border:`3px solid ${deptColor}30` }}>{initials}</div>
            )}
            {/* Online indicator */}
            <div style={{ marginTop:6, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background: doctor.isOnline?'#22c55e':'#94a3b8' }} />
              <span style={{ fontSize:10.5, color: doctor.isOnline?'#15803d':'#94a3b8', fontWeight:600 }}>{doctor.isOnline?'Online':'Offline'}</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
              <div>
                <h2 style={{ fontSize:21, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:-.3 }}>
                  Dr. {doctor.name}
                  {doctor.licenseNumber && <span style={{ fontSize:12, fontWeight:600, color:'#94a3b8', marginLeft:8 }}>MD</span>}
                </h2>
                <div style={{ fontSize:13.5, color:deptColor, fontWeight:700, marginTop:3 }}>
                  {doctor.specialization || doctor.department || 'General Practitioner'}
                </div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{doctor.department} Department</div>
              </div>

              {/* Social + Rating */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                <div style={{ display:'flex', gap:8 }}>
                  {SOCIALS.map(s => (
                    <button key={s.key} className="social-link" style={{ background:s.bg }}
                      onClick={() => window.open(`https://${s.key}.com`, '_blank')} title={s.label}>
                      {s.icon}
                    </button>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, background:'#fffbeb', border:'1px solid #fde68a', borderRadius:20, padding:'4px 10px' }}>
                  <span style={{ color:'#f59e0b', fontSize:13 }}>★</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#92400e' }}>{doctor.rating || 4.8}</span>
                  <span style={{ fontSize:11, color:'#b45309' }}>/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Quick stats chips */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:12 }}>
              <span className="info-chip">
                <span style={{ color:deptColor }}>👥</span> {doctor.totalPatients||0}+ Patients
              </span>
              {doctor.licenseNumber && (
                <span className="info-chip">
                  <span>🪪</span> Lic: {doctor.licenseNumber}
                </span>
              )}
              {doctor.age && (
                <span className="info-chip"><span>📅</span> {doctor.age} yrs exp</span>
              )}
              <span className="info-chip" style={{ background:doctor.status==='approved'?'#dcfce7':'#fef3c7', color:doctor.status==='approved'?'#15803d':'#92400e' }}>
                {doctor.status==='approved'?'✓ Verified':'⏳ Pending'}
              </span>
              {/* User ID */}
              <span className="info-chip" style={{ fontFamily:'monospace', fontSize:10.5 }}>
                ID: {doctor._id?.slice(-8)?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, overflowX:'auto', borderTop:'1px solid #e8edf3', marginTop:4 }}>
          {tabs.map(t => (
            <button key={t.key} className={`tab-btn${activeTab===t.key?' active':''}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding:'20px 28px 24px', minHeight:200, maxHeight:380, overflowY:'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:.2 }}>

            {activeTab==='overview' && (
              <div>
                <p style={{ fontSize:13.5, color:'#475569', lineHeight:1.7, marginBottom:16 }}>
                  {doctor.bio || `Dr. ${doctor.name} is a highly qualified ${doctor.specialization || 'medical professional'} at our ${doctor.department || ''} department. With over ${doctor.totalPatients||0} patients served, they bring exceptional expertise and compassionate care to every consultation.`}
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { icon:'🏥', label:'Department', val:doctor.department||'—' },
                    { icon:'🔬', label:'Specialization', val:doctor.specialization||'—' },
                    { icon:'📞', label:'Phone', val:doctor.phone||'—' },
                    { icon:'📧', label:'Email', val:doctor.email||'—' },
                    { icon:'👥', label:'Total Patients', val:`${doctor.totalPatients||0}+` },
                    { icon:'⭐', label:'Rating', val:`${doctor.rating||4.8} / 5.0` },
                  ].map(({icon,label,val}) => (
                    <div key={label} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 13px', display:'flex', gap:9, alignItems:'center' }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize:10.5, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:.4 }}>{label}</div>
                        <div style={{ fontSize:12.5, fontWeight:700, color:'#0f172a', marginTop:1, wordBreak:'break-all' }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab==='degrees' && (
              <div>
                <div style={{ fontSize:10.5, color:'#94a3b8', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>Academic Qualifications</div>
                {(doctor.degrees || [
                  { institution:'AIIMS New Delhi', degree:'MBBS — Bachelor of Medicine & Surgery', year:'2008' },
                  { institution:'PGI Chandigarh', degree:'MD — Internal Medicine Residency', year:'2012' },
                  { institution:`${doctor.specialization||'Medical'} Institute`, degree:`Fellowship in ${doctor.specialization||'Medicine'}`, year:'2014' },
                ]).map((d,i) => (
                  <div key={i} className="degree-item">
                    <div style={{ width:36, height:36, borderRadius:10, background:`${deptColor}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>🎓</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{d.institution}</div>
                      <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{d.degree}</div>
                      {d.year && <div style={{ fontSize:11, color:deptColor, fontWeight:600, marginTop:3 }}>Completed {d.year}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='experience' && (
              <div>
                <div style={{ fontSize:10.5, color:'#94a3b8', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>Clinical Experience</div>
                {(doctor.experiences || [
                  { text:`Expert in diagnosing and treating ${doctor.specialization || 'complex medical'} conditions with advanced clinical protocols.` },
                  { text:'Worked in community health clinics, private practice, and academic medical centers across multiple specializations.' },
                  { text:`Special interest in preventive ${doctor.specialization||'medicine'} and patient education for long-term health outcomes.` },
                  { text:'Published research on evidence-based treatment protocols adopted nationally.' },
                  { text:'Experience managing complex cases requiring multidisciplinary team coordination.' },
                ]).map((e,i) => (
                  <div key={i} className="exp-item">
                    <div style={{ width:8, height:8, borderRadius:'50%', background:deptColor, flexShrink:0, marginTop:5 }} />
                    <div style={{ fontSize:13, color:'#475569', lineHeight:1.6 }}>{e.text}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='schedule' && (
              <div>
                <div style={{ fontSize:10.5, color:'#94a3b8', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>Appointment Schedule</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((day,i) => (
                    <div key={day} className="schedule-slot">
                      <span style={{ fontWeight:700, color:'#374151', fontSize:13, width:90 }}>{day}</span>
                      {i < 5 ? (
                        <span style={{ color:'#059669', fontWeight:600, fontSize:12 }}>09:00 AM – 05:00 PM</span>
                      ) : (
                        <span style={{ color:'#0891b2', fontWeight:600, fontSize:12 }}>09:00 AM – 01:00 PM</span>
                      )}
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background: i<5?'#dcfce7':'#eff6ff', color:i<5?'#15803d':'#1d4ed8' }}>
                        {i<5?'Available':'Half Day'}
                      </span>
                    </div>
                  ))}
                  <div className="schedule-slot">
                    <span style={{ fontWeight:700, color:'#374151', fontSize:13, width:90 }}>Sunday</span>
                    <span style={{ color:'#94a3b8', fontSize:12 }}>Off Duty</span>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#f1f5f9', color:'#64748b' }}>Closed</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab==='contact' && (
              <div>
                <div style={{ fontSize:10.5, color:'#94a3b8', fontWeight:700, letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>Contact Information</div>
                {[
                  { icon:'📞', label:'Phone', val:doctor.phone||'+91-XXXX-XXXXXX' },
                  { icon:'📧', label:'Email', val:doctor.email },
                  { icon:'🏥', label:'Department', val:doctor.department||'—' },
                  { icon:'🆔', label:'Doctor ID', val:doctor._id?.slice(-8)?.toUpperCase()||'—', mono:true },
                  { icon:'📍', label:'Location', val:doctor.address||'Hospital Main Building' },
                ].map(({icon,label,val,mono}) => (
                  <div key={label} className="contact-row">
                    <div style={{ width:38, height:38, borderRadius:10, background:`${deptColor}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:.4 }}>{label}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', fontFamily:mono?'monospace':undefined }}>{val}</div>
                    </div>
                  </div>
                ))}
                {/* Social links in contact tab */}
                <div style={{ marginTop:16, paddingTop:14, borderTop:'1px solid #f1f5f9' }}>
                  <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:.8, marginBottom:10 }}>Professional Profiles</div>
                  <div style={{ display:'flex', gap:10 }}>
                    {SOCIALS.map(s => (
                      <button key={s.key} className="social-link" style={{ background:s.bg, width:38, height:38, fontSize:12 }}
                        onClick={() => window.open(`https://${s.key}.com/in/dr-${doctor.name?.toLowerCase().replace(/\s/g,'-')}`, '_blank')}>{s.icon}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — Book Appointment */}
      <div style={{ padding:'14px 28px 20px', borderTop:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fafbfc' }}>
        <div style={{ fontSize:11.5, color:'#94a3b8' }}>
          Available for consultations · {doctor.department} Dept
        </div>
        <button style={{ padding:'10px 22px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${deptColor},${deptColor}cc)`, color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer', boxShadow:`0 6px 18px ${deptColor}40` }}>
          Book Appointment →
        </button>
      </div>
    </div>
  );
}
