import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ROLES = [
  { key:'admin',           label:'Administrator',   emoji:'🛡️', color:'#6366f1', cat:'admin' },
  { key:'doctor',          label:'Doctor',          emoji:'⚕️',  color:'#0891b2', cat:'clinical' },
  { key:'nurse',           label:'Nurse',           emoji:'💉',  color:'#db2777', cat:'clinical' },
  { key:'pharmacist',      label:'Pharmacist',      emoji:'💊',  color:'#d97706', cat:'clinical' },
  { key:'patient',         label:'Patient',         emoji:'🧑‍⚕️', color:'#7c3aed', cat:'patient' },
  { key:'wardboy',         label:'Ward Boy',        emoji:'🛏️',  color:'#059669', cat:'support' },
  { key:'sweeper',         label:'Sweeper',         emoji:'🧹',  color:'#d97706', cat:'support' },
  { key:'otboy',           label:'OT Boy',          emoji:'🔪',  color:'#8b5cf6', cat:'support' },
  { key:'electrician',     label:'Electrician',     emoji:'⚡',  color:'#f59e0b', cat:'maintenance' },
  { key:'plumber',         label:'Plumber',         emoji:'🔧',  color:'#0891b2', cat:'maintenance' },
  { key:'it_technician',   label:'IT Technician',   emoji:'💻',  color:'#6366f1', cat:'maintenance' },
  { key:'equipment_tech',  label:'Equipment Tech',  emoji:'🔩',  color:'#8b5cf6', cat:'maintenance' },
  { key:'biomedical',      label:'Biomedical',      emoji:'🩺',  color:'#059669', cat:'maintenance' },
  { key:'security',        label:'Security',        emoji:'🔐',  color:'#475569', cat:'maintenance' },
  { key:'receptionist',    label:'Receptionist',    emoji:'🏨',  color:'#db2777', cat:'maintenance' },
  { key:'ambulance_driver',label:'Ambulance',       emoji:'🚑',  color:'#dc2626', cat:'maintenance' },
  { key:'finance',         label:'Finance',         emoji:'💰',  color:'#8b5cf6', cat:'support' },
];

const CATS = [
  { id:'all',         label:'All Roles' },
  { id:'admin',       label:'Admin' },
  { id:'clinical',    label:'Clinical' },
  { id:'support',     label:'Support' },
  { id:'maintenance', label:'Maintenance' },
  { id:'patient',     label:'Patient' },
];

// Floating particle
function Particle({ x, y, size, color, duration, delay }) {
  return (
    <motion.div
      style={{ position:'absolute', left:`${x}%`, top:`${y}%`, width:size, height:size, borderRadius:'50%', background:color, pointerEvents:'none' }}
      animate={{ y:[0,-30,0], opacity:[0.2,0.6,0.2], scale:[1,1.3,1] }}
      transition={{ duration, delay, repeat:Infinity, ease:'easeInOut' }}
    />
  );
}

// OTP box row
function OtpBoxes({ digits, refs, onChange, onKeyDown, onPaste, color }) {
  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center' }} onPaste={onPaste}>
      {digits.map((v, i) => (
        <motion.input
          key={i}
          ref={refs[i]}
          whileFocus={{ scale:1.05 }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          onFocus={e => e.target.select()}
          style={{
            width:50, height:58, background:'rgba(255,255,255,.07)', border:`2px solid ${v ? color+'90' : 'rgba(255,255,255,.15)'}`,
            borderRadius:14, textAlign:'center', fontSize:24, fontWeight:900, color:'#fff', outline:'none',
            transition:'all .2s', fontFamily:'inherit',
            boxShadow: v ? `0 0 0 3px ${color}25` : 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const { initiateLogin, verifyLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState('creds'); // creds | otp
  const [role, setRole]       = useState(ROLES[0]);
  const [catFilter, setCat]   = useState('all');
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errs, setErrs]       = useState({});
  const [loading, setLoading] = useState(false);
  const [digits, setDigits]   = useState(['','','','','','']);
  const [otpBusy, setOtpBusy] = useState(false);
  const [devOtp, setDevOtp]   = useState('');
  const [timer, setTimer]     = useState(0);
  const [showForgot, setShowForgot] = useState(false);
  const [fStep, setFStep]     = useState('email');
  const [fEmail, setFEmail]   = useState('');
  const [fOtp, setFOtp]       = useState('');
  const [fPass, setFPass]     = useState('');
  const [fBusy, setFBusy]     = useState(false);
  const [fDevOtp, setFDevOtp] = useState('');

  const otpRefs = Array.from({length:6}, () => useRef(null)); // eslint-disable-line
  const ac = role.color;

  // Particles (stable)
  const particles = useRef(Array.from({length:20},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:Math.random()*3+1.5, dur:Math.random()*5+4, del:Math.random()*5,
  }))).current;

  // Countdown
  useEffect(()=>{
    if (timer<=0) return;
    const t = setInterval(()=>setTimer(n=>n-1),1000);
    return ()=>clearInterval(t);
  },[timer]);

  const visibleRoles = catFilter==='all' ? ROLES : ROLES.filter(r=>r.cat===catFilter);

  const validate = () => {
    const e={};
    if (!email.trim()) e.email='Email required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email='Enter a valid email';
    if (!pass) e.pass='Password required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e=validate(); if (Object.keys(e).length){setErrs(e);return;}
    setLoading(true);
    const res = await initiateLogin(email, pass);
    setLoading(false);
    if (res.success){setStep('otp');setDevOtp(res.devOtp||'');setTimer(60);}
    else setErrs({general:res.error});
  };

  const onDigit = (i,v)=>{
    if(!/^\d*$/.test(v)) return;
    const next=[...digits]; next[i]=v.slice(-1); setDigits(next);
    if(v && i<5) otpRefs[i+1].current?.focus();
  };
  const onDigitKey = (i,e)=>{ if(e.key==='Backspace'&&!digits[i]&&i>0) otpRefs[i-1].current?.focus(); };
  const onPaste = (e)=>{
    const d=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if(d.length===6){setDigits(d.split(''));otpRefs[5].current?.focus();}
  };

  const handleVerify = async ()=>{
    const otp=digits.join('');
    if(otp.length!==6){toast.error('Enter 6-digit OTP');return;}
    setOtpBusy(true);
    const res=await verifyLogin(email,otp);
    setOtpBusy(false);
    if(res.success) navigate('/dashboard');
    else{toast.error(res.error);setDigits(['','','','','','']);otpRefs[0].current?.focus();}
  };

  const handleResend=async()=>{
    if(timer>0) return;
    try{const r=await authAPI.resendOtp({email,purpose:'login'});setDevOtp(r.data.devOtp||'');setTimer(60);toast.success('New OTP sent!');}
    catch{toast.error('Resend failed');}
  };

  const handleForgotSend=async()=>{
    if(!/\S+@\S+\.\S+/.test(fEmail)){toast.error('Valid email required');return;}
    setFBusy(true);
    try{const r=await authAPI.forgotPassword(fEmail);setFDevOtp(r.data.devOtp||'');setFStep('otp');toast.success('OTP sent!');}
    catch(e){toast.error(e.response?.data?.error||'Not found');}
    setFBusy(false);
  };
  const handleForgotReset=async()=>{
    if(!fOtp||!fPass){toast.error('Fill all fields');return;}
    if(fPass.length<6){toast.error('Min 6 chars');return;}
    setFBusy(true);
    try{await authAPI.resetPassword({email:fEmail,otp:fOtp,newPassword:fPass});setFStep('done');toast.success('Password reset!');}
    catch(e){toast.error(e.response?.data?.error||'Invalid OTP');}
    setFBusy(false);
  };

  const inputBase = {
    width:'100%', padding:'13px 14px 13px 44px',
    background:'rgba(255,255,255,.06)', border:`1.5px solid rgba(255,255,255,.12)`,
    borderRadius:12, fontSize:14.5, color:'#fff', outline:'none',
    transition:'all .22s', fontFamily:'inherit',
  };
  const inputFocusStyle = (focused) => ({
    ...inputBase,
    border:`1.5px solid ${focused ? ac : 'rgba(255,255,255,.12)'}`,
    boxShadow: focused ? `0 0 0 3px ${ac}22` : 'none',
    background: focused ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.06)',
  });

  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus]   = useState(false);

  return (
    <div style={{ minHeight:'100vh', background:'#020817', display:'flex', fontFamily:"'Inter',system-ui,sans-serif", overflow:'hidden', position:'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input::placeholder{color:rgba(255,255,255,.28)}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px}
        .role-btn{border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);border-radius:10px;cursor:pointer;transition:all .18s;padding:8px 6px;text-align:center;font-family:inherit}
        .role-btn:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.22);transform:translateY(-1px)}
        .role-btn.sel{border-color:${ac};background:${ac}20;box-shadow:0 0 0 3px ${ac}18}
        .cat-btn{padding:6px 12px;border-radius:8px;border:1.5px solid rgba(255,255,255,.1);background:transparent;cursor:pointer;font-family:inherit;font-size:11.5px;font-weight:600;color:rgba(255,255,255,.45);transition:all .16s;white-space:nowrap}
        .cat-btn:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.8)}
        .cat-btn.sel{background:${ac}25;border-color:${ac}60;color:${ac}}
        .main-btn{width:100%;padding:14px;background:linear-gradient(135deg,${ac} 0%,${ac}cc 100%);border:none;border-radius:13px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .22s;letter-spacing:.2px}
        .main-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 30px ${ac}45}
        .main-btn:active{transform:translateY(0)}
        .main-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}
        .glass{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(24px);border-radius:22px;box-shadow:0 32px 80px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.07)}
        .fi{width:100%;padding:11px 13px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);border-radius:10px;font-size:14px;color:#fff;outline:none;transition:all .2s;font-family:inherit}
        .fi:focus{border-color:${ac};box-shadow:0 0 0 3px ${ac}25}
        .fi::placeholder{color:rgba(255,255,255,.28)}
      `}</style>

      {/* Animated background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        {/* Gradient orbs */}
        <motion.div animate={{ scale:[1,1.15,1], opacity:[.06,.1,.06] }} transition={{ duration:10, repeat:Infinity }}
          style={{ position:'absolute', width:'60%', height:'60%', borderRadius:'50%', filter:'blur(100px)', background:ac, top:'-20%', left:'-15%' }} />
        <motion.div animate={{ scale:[1.1,1,1.1], opacity:[.04,.07,.04] }} transition={{ duration:13, repeat:Infinity, delay:3 }}
          style={{ position:'absolute', width:'50%', height:'50%', borderRadius:'50%', filter:'blur(120px)', background:'#0891b2', bottom:'-15%', right:'-10%' }} />
        {/* Grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize:'52px 52px' }} />
        {/* Particles */}
        {particles.map(p => <Particle key={p.id} {...p} color={ac} />)}
      </div>

      {/* ── LEFT PANEL ── */}
      <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:.8, ease:[.22,1,.36,1] }}
        style={{ width:'52%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'50px 52px', position:'relative', zIndex:1 }}>

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:52 }}>
          <motion.div animate={{ boxShadow:[`0 0 0 0 ${ac}60`,`0 0 0 14px ${ac}00`] }} transition={{ duration:2.5, repeat:Infinity }}
            style={{ width:46, height:46, borderRadius:14, background:`linear-gradient(135deg,${ac},${ac}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            ✚
          </motion.div>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:18, letterSpacing:.2 }}>MediCare HMS</div>
            <div style={{ color:'rgba(255,255,255,.25)', fontSize:10, letterSpacing:2, textTransform:'uppercase' }}>Hospital Management System · v4</div>
          </div>
        </div>

        {/* Headline */}
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2, duration:.7 }}>
          <h1 style={{ color:'#fff', fontSize:50, fontWeight:900, lineHeight:1.08, letterSpacing:-2, marginBottom:18 }}>
            Smart<br/>
            <span style={{ background:`linear-gradient(90deg,${ac},#38bdf8,${ac})`, backgroundSize:'200% 100%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'hue 4s linear infinite' }}>
              Healthcare
            </span><br/>
            Platform
          </h1>
          <style>{`@keyframes hue{0%{background-position:0%}100%{background-position:200%}}`}</style>
          <p style={{ color:'rgba(255,255,255,.38)', fontSize:15.5, lineHeight:1.75, maxWidth:380, marginBottom:44 }}>
            Role-based access for every hospital department — from surgeons to security officers, all in one secure platform.
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.4 }}
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, maxWidth:400, marginBottom:44 }}>
          {[{v:'50K+',l:'Patients',i:'👥'},{v:'1.2K',l:'Doctors',i:'⚕️'},{v:'16',l:'Roles',i:'🎭'},{v:'99.9%',l:'Uptime',i:'⚡'}].map((s,i)=>(
            <motion.div key={i} whileHover={{ y:-3 }}
              style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'14px 8px', textAlign:'center' }}>
              <div style={{ fontSize:20, marginBottom:4 }}>{s.i}</div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:17 }}>{s.v}</div>
              <div style={{ color:'rgba(255,255,255,.3)', fontSize:10 }}>{s.l}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature list */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.55 }}
          style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {[
            { i:'🔐', t:'OTP email verification on every login' },
            { i:'🔧', t:'Dedicated dashboards for all 16 roles' },
            { i:'📋', t:'Real-time task assignment & tracking' },
            { i:'📅', t:'Smart timetable management' },
          ].map((f,i)=>(
            <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:.6+i*.07 }}
              style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:26, height:26, borderRadius:8, background:`${ac}22`, border:`1px solid ${ac}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>{f.i}</div>
              <span style={{ color:'rgba(255,255,255,.5)', fontSize:13.5 }}>{f.t}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'30px 44px', position:'relative', zIndex:1 }}>
        <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:.8, ease:[.22,1,.36,1] }}
          style={{ width:'100%', maxWidth:430 }}>

          <AnimatePresence mode="wait">

            {/* ── FORGOT PASSWORD ── */}
            {showForgot && (
              <motion.div key="forgot" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="glass" style={{ padding:'36px 32px' }}>
                <div style={{ textAlign:'center', marginBottom:24 }}>
                  <div style={{ fontSize:38, marginBottom:10 }}>{fStep==='done'?'🎉':'🔑'}</div>
                  <h2 style={{ color:'#fff', fontWeight:800, fontSize:20, marginBottom:4 }}>{fStep==='done'?'Password Reset!':'Reset Password'}</h2>
                  <p style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>
                    {fStep==='email'?'Enter your registered email'
                     :fStep==='otp'?`OTP sent to ${fEmail}`
                     :'Your password has been updated.'}
                  </p>
                </div>
                {fStep==='email' && (
                  <>
                    <input className="fi" type="email" placeholder="Registered email address" value={fEmail} onChange={e=>setFEmail(e.target.value)} style={{ marginBottom:14 }}/>
                    <button className="main-btn" onClick={handleForgotSend} disabled={fBusy}>{fBusy?'Sending…':'📨 Send OTP'}</button>
                  </>
                )}
                {fStep==='otp' && (
                  <>
                    {fDevOtp && <div style={{ background:`${ac}18`, border:`1px solid ${ac}40`, borderRadius:10, padding:'10px', marginBottom:14, textAlign:'center', color:ac, fontSize:12.5 }}>Dev OTP: <strong style={{ fontSize:20, letterSpacing:5 }}>{fDevOtp}</strong></div>}
                    <input className="fi" type="text" inputMode="numeric" maxLength={6} placeholder="6-digit OTP" value={fOtp} onChange={e=>setFOtp(e.target.value)} style={{ marginBottom:10 }}/>
                    <input className="fi" type="password" placeholder="New password (min 6 chars)" value={fPass} onChange={e=>setFPass(e.target.value)} style={{ marginBottom:14 }}/>
                    <button className="main-btn" onClick={handleForgotReset} disabled={fBusy}>{fBusy?'Resetting…':'✅ Reset Password'}</button>
                  </>
                )}
                {fStep==='done' && <button className="main-btn" onClick={()=>{setShowForgot(false);setFStep('email');setFEmail('');setFOtp('');setFPass('');}}>← Back to Login</button>}
                {fStep!=='done' && (
                  <button onClick={()=>setShowForgot(false)} style={{ display:'block', margin:'16px auto 0', background:'none', border:'none', color:'rgba(255,255,255,.35)', fontSize:13, cursor:'pointer' }}>← Back to Login</button>
                )}
              </motion.div>
            )}

            {/* ── OTP STEP ── */}
            {!showForgot && step==='otp' && (
              <motion.div key="otp" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="glass" style={{ padding:'36px 32px' }}>
                <div style={{ textAlign:'center', marginBottom:26 }}>
                  <motion.div
                    animate={{ scale:[1,.9,1], boxShadow:[`0 0 0 0 ${ac}40`,`0 0 0 16px ${ac}00`] }}
                    transition={{ duration:2.2, repeat:Infinity }}
                    style={{ width:68, height:68, borderRadius:'50%', background:`linear-gradient(135deg,${ac},${ac}90)`, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>
                    📧
                  </motion.div>
                  <h2 style={{ color:'#fff', fontWeight:800, fontSize:21, marginBottom:6 }}>Check Your Email</h2>
                  <p style={{ color:'rgba(255,255,255,.4)', fontSize:13.5, lineHeight:1.6 }}>
                    We sent a 6-digit code to<br/><strong style={{ color:'#fff' }}>{email}</strong>
                  </p>
                </div>

                {devOtp && (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                    style={{ background:`${ac}18`, border:`1px solid ${ac}40`, borderRadius:12, padding:'12px', marginBottom:22, textAlign:'center' }}>
                    <div style={{ color:'rgba(255,255,255,.5)', fontSize:11, marginBottom:4, textTransform:'uppercase', letterSpacing:1 }}>Dev Mode OTP</div>
                    <div style={{ color:ac, fontSize:26, fontWeight:900, letterSpacing:8, fontFamily:'monospace' }}>{devOtp}</div>
                  </motion.div>
                )}

                <div style={{ marginBottom:26 }}>
                  <OtpBoxes digits={digits} refs={otpRefs} onChange={onDigit} onKeyDown={onDigitKey} onPaste={onPaste} color={ac} />
                </div>

                <button className="main-btn" onClick={handleVerify} disabled={otpBusy || digits.join('').length<6} style={{ marginBottom:16 }}>
                  {otpBusy ? (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <motion.span animate={{ rotate:360 }} transition={{ duration:.8, repeat:Infinity, ease:'linear' }} style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%' }} />
                      Verifying…
                    </span>
                  ) : '🔓 Verify & Sign In'}
                </button>

                <div style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,.35)' }}>
                  Didn't receive it?{' '}
                  <button onClick={handleResend} disabled={timer>0}
                    style={{ background:'none', border:'none', color:timer>0?'rgba(255,255,255,.2)':ac, cursor:timer>0?'default':'pointer', fontWeight:700, fontSize:13, fontFamily:'inherit' }}>
                    {timer>0?`Resend in ${timer}s`:'Resend OTP'}
                  </button>
                </div>
                <button onClick={()=>{setStep('creds');setDigits(['','','','','','']);}}
                  style={{ display:'block', margin:'12px auto 0', background:'none', border:'none', color:'rgba(255,255,255,.25)', fontSize:12.5, cursor:'pointer', fontFamily:'inherit' }}>
                  ← Change credentials
                </button>
              </motion.div>
            )}

            {/* ── CREDENTIALS STEP ── */}
            {!showForgot && step==='creds' && (
              <motion.div key="creds" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="glass" style={{ padding:'32px' }}>

                {/* Role icon */}
                <div style={{ textAlign:'center', marginBottom:22 }}>
                  <motion.div key={role.key}
                    initial={{ scale:.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ type:'spring', stiffness:300, damping:22 }}
                    style={{ width:54, height:54, borderRadius:16, background:`linear-gradient(135deg,${ac},${ac}99)`, margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:`0 8px 24px ${ac}40` }}>
                    {role.emoji}
                  </motion.div>
                  <h2 style={{ color:'#fff', fontWeight:800, fontSize:21, marginBottom:2 }}>Welcome Back</h2>
                  <p style={{ color:'rgba(255,255,255,.3)', fontSize:12.5 }}>
                    Signing in as <span style={{ color:ac, fontWeight:700 }}>{role.label}</span>
                  </p>
                </div>

                {/* Category filter */}
                <div style={{ display:'flex', gap:5, marginBottom:10, overflowX:'auto', paddingBottom:2 }}>
                  {CATS.map(c => (
                    <button key={c.id} className={`cat-btn${catFilter===c.id?' sel':''}`}
                      onClick={()=>setCat(c.id)}>
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Role grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginBottom:18, maxHeight:130, overflowY:'auto' }}>
                  {visibleRoles.map(r => (
                    <button key={r.key} className={`role-btn${role.key===r.key?' sel':''}`}
                      onClick={()=>{setRole(r);setErrs({})}}
                      style={{ '--sel-color':r.color }}>
                      <div style={{ fontSize:17 }}>{r.emoji}</div>
                      <div style={{ fontSize:9.5, fontWeight:700, color:role.key===r.key?r.color:'rgba(255,255,255,.4)', marginTop:2, lineHeight:1.2 }}>{r.label}</div>
                    </button>
                  ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {errs.general && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                      style={{ background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'10px 14px', marginBottom:14, color:'#fca5a5', fontSize:13, display:'flex', gap:8, alignItems:'center' }}>
                      <span>⚠️</span> {errs.general}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div style={{ position:'relative', marginBottom:10 }}>
                    <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:17, pointerEvents:'none' }}>📧</span>
                    <input
                      type="email" placeholder="Email address" value={email}
                      onChange={e=>{setEmail(e.target.value);setErrs(r=>({...r,email:''}))}}
                      onFocus={()=>setEmailFocus(true)} onBlur={()=>setEmailFocus(false)}
                      style={inputFocusStyle(emailFocus)}
                    />
                    {errs.email && <div style={{ color:'#fca5a5', fontSize:11.5, marginTop:3, paddingLeft:2 }}>{errs.email}</div>}
                  </div>

                  {/* Password */}
                  <div style={{ position:'relative', marginBottom:8 }}>
                    <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:17, pointerEvents:'none' }}>🔒</span>
                    <input
                      type={showPass?'text':'password'} placeholder="Password" value={pass}
                      onChange={e=>{setPass(e.target.value);setErrs(r=>({...r,pass:''}))}}
                      onFocus={()=>setPassFocus(true)} onBlur={()=>setPassFocus(false)}
                      style={{ ...inputFocusStyle(passFocus), paddingRight:46 }}
                    />
                    <button type="button" onClick={()=>setShowPass(v=>!v)}
                      style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,.28)', cursor:'pointer', fontSize:17, padding:4 }}>
                      {showPass?'🙈':'👁️'}
                    </button>
                    {errs.pass && <div style={{ color:'#fca5a5', fontSize:11.5, marginTop:3, paddingLeft:2 }}>{errs.pass}</div>}
                  </div>

                  <div style={{ textAlign:'right', marginBottom:18 }}>
                    <button type="button" onClick={()=>{setShowForgot(true);setFStep('email');}}
                      style={{ background:'none', border:'none', color:ac, fontSize:12.5, cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>
                      Forgot password?
                    </button>
                  </div>

                  <button className="main-btn" type="submit" disabled={loading}>
                    {loading ? (
                      <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                        <motion.span animate={{ rotate:360 }} transition={{ duration:.8, repeat:Infinity, ease:'linear' }} style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', borderRadius:'50%' }} />
                        Sending OTP…
                      </span>
                    ) : `${role.emoji} Sign In`}
                  </button>
                </form>

                <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0', opacity:.3 }}>
                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,.2)' }} />
                  <span style={{ color:'rgba(255,255,255,.4)', fontSize:11.5 }}>or</span>
                  <div style={{ flex:1, height:1, background:'rgba(255,255,255,.2)' }} />
                </div>

                <div style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:11, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <span>🔒</span>
                  <span style={{ color:'rgba(255,255,255,.4)', fontSize:12 }}>Secured with OTP email verification</span>
                </div>

                <div style={{ textAlign:'center', fontSize:12.5, color:'rgba(255,255,255,.3)' }}>
                  New here?{' '}
                  <Link to="/register" style={{ color:ac, fontWeight:700, textDecoration:'none' }}>Create account</Link>
                  {' '}· Requires admin approval
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
