import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ROLES = [
  { key:'patient',         label:'Patient',           emoji:'🧑‍⚕️', desc:'Personal health management' },
  { key:'doctor',          label:'Doctor',            emoji:'⚕️',   desc:'Clinical care & records' },
  { key:'nurse',           label:'Nurse',             emoji:'💉',   desc:'Ward & patient monitoring' },
  { key:'pharmacist',      label:'Pharmacist',        emoji:'💊',   desc:'Medications & pharmacy' },
  { key:'wardboy',         label:'Ward Boy',          emoji:'🛏️',   desc:'Ward support & transport' },
  { key:'sweeper',         label:'Sweeper',           emoji:'🧹',   desc:'Cleaning & sanitation' },
  { key:'electrician',     label:'Electrician',       emoji:'⚡',   desc:'Electrical maintenance' },
  { key:'plumber',         label:'Plumber',           emoji:'🔧',   desc:'Plumbing & water systems' },
  { key:'it_technician',   label:'IT Technician',     emoji:'💻',   desc:'Systems & network support' },
  { key:'equipment_tech',  label:'Equipment Tech',    emoji:'🔩',   desc:'Medical equipment service' },
  { key:'biomedical',      label:'Biomedical Eng.',   emoji:'🩺',   desc:'Biomedical systems' },
  { key:'security',        label:'Security Officer',  emoji:'🔐',   desc:'Hospital security' },
  { key:'receptionist',    label:'Receptionist',      emoji:'🏨',   desc:'Patient registration' },
  { key:'ambulance_driver',label:'Ambulance Driver',  emoji:'🚑',   desc:'Emergency transport' },
  { key:'finance',         label:'Finance',           emoji:'💰',   desc:'Billing & accounts' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // form | otp | done
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', role:'patient', phone:'', department:'' });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['','','','','','']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  useEffect(() => {
    if (resendTimer<=0) return;
    const t = setInterval(()=>setResendTimer(n=>n-1),1000);
    return ()=>clearInterval(t);
  }, [resendTimer]);

  const set = f => e => { setForm(v=>({...v,[f]:e.target.value})); setErrs(er=>({...er,[f]:''})); };

  const validate = () => {
    const e={};
    if (!form.name.trim()) e.name='Name required';
    if (!form.email) e.email='Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email='Enter a valid email address';
    if (!form.password||form.password.length<6) e.password='Min 6 characters';
    if (form.password!==form.confirm) e.confirm='Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setLoading(true);
    try {
      const r = await authAPI.initiateRegister({ name:form.name, email:form.email, password:form.password, role:form.role, phone:form.phone, department:form.department });
      setDevOtp(r.data.devOtp||''); setStep('otp'); setResendTimer(60); toast.success('OTP sent!');
    } catch(e) { toast.error(e.response?.data?.error||'Registration failed'); }
    setLoading(false);
  };

  const handleOtpChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const next=[...otpDigits]; next[i]=v.slice(-1); setOtpDigits(next);
    if (v&&i<5) otpRefs[i+1].current?.focus();
  };
  const handleOtpKey = (i,e) => { if (e.key==='Backspace'&&!otpDigits[i]&&i>0) otpRefs[i-1].current?.focus(); };
  const handlePaste = (e) => {
    const d=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (d.length===6){setOtpDigits(d.split(''));otpRefs[5].current?.focus();}
  };
  const handleVerify = async () => {
    const otp=otpDigits.join('');
    if (otp.length!==6){toast.error('Enter 6-digit OTP');return;}
    setOtpLoading(true);
    try { await authAPI.verifyRegister({email:form.email,otp}); setStep('done'); toast.success('Email verified!'); }
    catch(e){toast.error(e.response?.data?.error||'Invalid OTP');setOtpDigits(['','','','','','']);otpRefs[0].current?.focus();}
    setOtpLoading(false);
  };
  const handleResend = async () => {
    if (resendTimer>0) return;
    try { const r=await authAPI.resendOtp({email:form.email,purpose:'register'}); setDevOtp(r.data.devOtp||''); setResendTimer(60); toast.success('New OTP sent!'); }
    catch { toast.error('Resend failed'); }
  };

  const selRole = ROLES.find(r=>r.key===form.role)||ROLES[0];

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0c1f4a,#1a3a7a 50%,#0c4a6e)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); *{box-sizing:border-box} .ri{width:100%;padding:10px 13px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;font-family:'Inter',sans-serif;background:#fff} .ri:focus{border-color:#1648c9;box-shadow:0 0 0 3px rgba(22,72,201,.12)} .ri.err{border-color:#ef4444} .otp2{width:46px;height:54px;background:#f1f5fb;border:2px solid #e2e8f0;border-radius:12px;text-align:center;font-size:22px;font-weight:800;color:#0f172a;outline:none;transition:all .2s;font-family:'Inter',sans-serif} .otp2:focus{border-color:#1648c9;box-shadow:0 0 0 3px rgba(22,72,201,.12);background:#fff} .otp2.filled{border-color:#1648c9;background:#eff6ff}`}</style>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}}
        style={{background:'#fff',borderRadius:20,padding:'32px',width:'100%',maxWidth:520,boxShadow:'0 32px 80px rgba(0,0,0,.3)'}}>
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={{width:52,height:52,background:'linear-gradient(135deg,#1648c9,#0891b2)',borderRadius:15,margin:'0 auto 10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🏥</div>
          <h1 style={{fontSize:21,fontWeight:900,color:'#0f172a'}}>Create Account</h1>
          <p style={{color:'#94a3b8',fontSize:12.5,marginTop:2}}>MediCare HMS · Email verification required</p>
        </div>
        <AnimatePresence mode="wait">
          {step==='form'&&(
            <motion.form key="form" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onSubmit={handleSubmit}>
              <div style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6}}>Select Role</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5,marginBottom:8}}>
                  {ROLES.slice(0,5).map(r=>(
                    <button type="button" key={r.key} onClick={()=>setForm(f=>({...f,role:r.key}))}
                      style={{padding:'7px 4px',border:`1.5px solid ${form.role===r.key?'#1648c9':'#e2e8f0'}`,borderRadius:9,background:form.role===r.key?'#eff6ff':'#f8fafc',cursor:'pointer',textAlign:'center'}}>
                      <div style={{fontSize:16}}>{r.emoji}</div>
                      <div style={{fontSize:9.5,fontWeight:700,color:form.role===r.key?'#1648c9':'#64748b'}}>{r.label}</div>
                    </button>
                  ))}
                </div>
                <select className="ri" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{appearance:'none',paddingRight:28}}>
                  {ROLES.map(r=><option key={r.key} value={r.key}>{r.emoji} {r.label} — {r.desc}</option>)}
                </select>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Full Name *</label>
                  <input className={`ri${errs.name?' err':''}`} placeholder="Dr. John Smith" value={form.name} onChange={set('name')}/>
                  {errs.name&&<p style={{color:'#ef4444',fontSize:11,marginTop:2}}>{errs.name}</p>}
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Phone</label>
                  <input className="ri" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')}/>
                </div>
              </div>
              <div style={{marginBottom:10}}>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Email Address * <span style={{color:'#94a3b8',fontWeight:400}}>(must be real — OTP required)</span></label>
                <input className={`ri${errs.email?' err':''}`} type="email" placeholder="john@hospital.com" value={form.email} onChange={set('email')}/>
                {errs.email&&<p style={{color:'#ef4444',fontSize:11,marginTop:2}}>{errs.email}</p>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Password *</label>
                  <input className={`ri${errs.password?' err':''}`} type="password" placeholder="Min 6 chars" value={form.password} onChange={set('password')}/>
                  {errs.password&&<p style={{color:'#ef4444',fontSize:11,marginTop:2}}>{errs.password}</p>}
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Confirm Password *</label>
                  <input className={`ri${errs.confirm?' err':''}`} type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')}/>
                  {errs.confirm&&<p style={{color:'#ef4444',fontSize:11,marginTop:2}}>{errs.confirm}</p>}
                </div>
              </div>
              <div style={{marginBottom:18}}>
                <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:5}}>Department</label>
                <input className="ri" placeholder="e.g. Cardiology, Maintenance, ICU…" value={form.department} onChange={set('department')}/>
              </div>
              <button type="submit" disabled={loading} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#1648c9,#0891b2)',border:'none',borderRadius:11,color:'#fff',fontSize:14.5,fontWeight:700,cursor:'pointer',opacity:loading?.7:1}}>
                {loading?'📨 Sending OTP…':`${selRole.emoji} Register & Verify Email`}
              </button>
              <div style={{textAlign:'center',marginTop:12,fontSize:12.5,color:'#94a3b8'}}>
                Have an account? <Link to="/login" style={{color:'#1648c9',fontWeight:700,textDecoration:'none'}}>Sign in</Link>
              </div>
            </motion.form>
          )}
          {step==='otp'&&(
            <motion.div key="otp" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{textAlign:'center'}}>
              <div style={{width:60,height:60,background:'linear-gradient(135deg,#1648c9,#0891b2)',borderRadius:'50%',margin:'0 auto 14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26}}>📧</div>
              <h2 style={{fontSize:19,fontWeight:800,color:'#0f172a',marginBottom:6}}>Verify Your Email</h2>
              <p style={{color:'#64748b',fontSize:13,marginBottom:18}}>OTP sent to <strong style={{color:'#1648c9'}}>{form.email}</strong></p>
              {devOtp&&<div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:9,padding:'10px',marginBottom:16,fontSize:12.5,color:'#1e40af'}}>Dev OTP: <strong style={{fontSize:20,letterSpacing:4}}>{devOtp}</strong></div>}
              <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:22}} onPaste={handlePaste}>
                {otpDigits.map((v,i)=>(
                  <input key={i} ref={otpRefs[i]} className={`otp2${v?' filled':''}`} type="text" inputMode="numeric" maxLength={1} value={v}
                    onChange={e=>handleOtpChange(i,e.target.value)} onKeyDown={e=>handleOtpKey(i,e)} onFocus={e=>e.target.select()}/>
                ))}
              </div>
              <button onClick={handleVerify} disabled={otpLoading||otpDigits.join('').length<6}
                style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#1648c9,#0891b2)',border:'none',borderRadius:11,color:'#fff',fontSize:14.5,fontWeight:700,cursor:'pointer',marginBottom:12,opacity:(otpLoading||otpDigits.join('').length<6)?.65:1}}>
                {otpLoading?'Verifying…':'✅ Verify Email'}
              </button>
              <div style={{fontSize:13,color:'#64748b'}}>
                Didn't receive it?{' '}
                <button onClick={handleResend} disabled={resendTimer>0} style={{background:'none',border:'none',color:resendTimer>0?'#94a3b8':'#1648c9',cursor:resendTimer>0?'default':'pointer',fontWeight:700,fontSize:13,fontFamily:'Inter,sans-serif'}}>
                  {resendTimer>0?`Resend in ${resendTimer}s`:'Resend OTP'}
                </button>
              </div>
              <button onClick={()=>{setStep('form');setOtpDigits(['','','','','',''])}} style={{display:'block',margin:'10px auto 0',background:'none',border:'none',color:'#94a3b8',fontSize:12,cursor:'pointer'}}>← Change details</button>
            </motion.div>
          )}
          {step==='done'&&(
            <motion.div key="done" initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} style={{textAlign:'center'}}>
              <div style={{fontSize:52,marginBottom:12}}>✅</div>
              <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',marginBottom:8}}>Registration Complete!</h2>
              <p style={{color:'#64748b',fontSize:13.5,lineHeight:1.6,marginBottom:16}}>Email verified. Your account is <strong>pending admin approval</strong>. You'll be notified once approved.</p>
              <button onClick={()=>navigate('/login')} style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#1648c9,#0891b2)',border:'none',borderRadius:11,color:'#fff',fontSize:14.5,fontWeight:700,cursor:'pointer'}}>Go to Login →</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
