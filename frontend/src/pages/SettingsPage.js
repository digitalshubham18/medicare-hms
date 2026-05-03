import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name||'', phone: user?.phone||'', address: user?.address||'', age: user?.age||'', bloodGroup: user?.bloodGroup||'', weight: user?.weight||'', height: user?.height||'' });
  const [pwdForm, setPwdForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [prefs, setPrefs] = useState({ emailNotifs:true, smsNotifs:false, pushNotifs:true, twoFA:false, autoLogout:true });

  const ROLE_LABELS = { admin:'Administrator', doctor:'Doctor', patient:'Patient', nurse:'Nurse', pharmacist:'Pharmacist' };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
    setSaving(false);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setChangingPwd(true);
    try {
      await authAPI.changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed!');
      setPwdForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
    setChangingPwd(false);
  };

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)||'U';

  return (
    <div>
      <div className="page-header"><div className="page-title">⚙️ Settings</div></div>
      <div className="grid-2">
        <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }}>
          <div className="card-header"><span className="card-title">👤 Profile Settings</span></div>
          <form onSubmit={saveProfile}>
            <div className="card-body">
              <div style={{ textAlign:'center',marginBottom:18 }}>
                <div style={{ width:60,height:60,borderRadius:'50%',background:'linear-gradient(135deg,#1648c9,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:22,margin:'0 auto 8px' }}>{initials}</div>
                <div className="fw-7">{user?.name}</div>
                <span className="badge badge-primary">{ROLE_LABELS[user?.role]}</span>
              </div>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Email (cannot change)</label><input className="form-input" value={user?.email||''} disabled style={{ background:'#f8fafc',opacity:.7 }}/></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} placeholder="+1-555-0000"/></div>
              {user?.role === 'patient' && <>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Age</label><input className="form-input" type="number" value={profile.age} onChange={e=>setProfile(p=>({...p,age:e.target.value}))}/></div>
                  <div className="form-group"><label className="form-label">Blood Group</label><select className="form-input" value={profile.bloodGroup} onChange={e=>setProfile(p=>({...p,bloodGroup:e.target.value}))}>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}</select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Weight (kg)</label><input className="form-input" type="number" value={profile.weight} onChange={e=>setProfile(p=>({...p,weight:e.target.value}))}/></div>
                  <div className="form-group"><label className="form-label">Height (cm)</label><input className="form-input" type="number" value={profile.height} onChange={e=>setProfile(p=>({...p,height:e.target.value}))}/></div>
                </div>
              </>}
              <div className="form-group"><label className="form-label">Address</label><textarea className="form-input" rows={2} value={profile.address} onChange={e=>setProfile(p=>({...p,address:e.target.value}))} placeholder="Your address"/></div>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<><span className="spinner-sm"/> Saving…</>:'💾 Save Changes'}</button>
            </div>
          </form>
        </motion.div>

        <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
          <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
            <div className="card-header"><span className="card-title">🔒 Change Password</span></div>
            <form onSubmit={changePassword}>
              <div className="card-body">
                <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" required value={pwdForm.currentPassword} onChange={e=>setPwdForm(p=>({...p,currentPassword:e.target.value}))} placeholder="Current password"/></div>
                <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" required value={pwdForm.newPassword} onChange={e=>setPwdForm(p=>({...p,newPassword:e.target.value}))} placeholder="Min 6 characters"/></div>
                <div className="form-group"><label className="form-label">Confirm New Password</label><input className="form-input" type="password" required value={pwdForm.confirmPassword} onChange={e=>setPwdForm(p=>({...p,confirmPassword:e.target.value}))} placeholder="Repeat new password"/></div>
                <button type="submit" className="btn btn-primary" disabled={changingPwd}>{changingPwd?<><span className="spinner-sm"/> Changing…</>:'🔒 Change Password'}</button>
              </div>
            </form>
          </motion.div>

          <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}>
            <div className="card-header"><span className="card-title">🔔 Preferences</span></div>
            <div className="card-body">
              {[['Email Notifications','Appointment & alert emails','emailNotifs'],['SMS Notifications','Text message reminders','smsNotifs'],['Push Notifications','Browser push notifications','pushNotifs'],['2FA Security','Enhanced login protection','twoFA'],['Auto-logout','After 30 min idle','autoLogout']].map(([l,d,key]) => (
                <div key={key} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid #e2e8f0' }}>
                  <div><div className="text-sm fw-7">{l}</div><div className="text-xs text-muted">{d}</div></div>
                  <label style={{ position:'relative',display:'inline-block',width:38,height:20,cursor:'pointer',flexShrink:0 }}>
                    <input type="checkbox" checked={prefs[key]} style={{ opacity:0,width:0,height:0 }} onChange={e=>{ setPrefs(p=>({...p,[key]:e.target.checked})); toast.success('Setting updated'); }}/>
                    <span style={{ position:'absolute',inset:0,background:prefs[key]?'#1648c9':'#e2e8f0',borderRadius:10,transition:'.2s',cursor:'pointer' }} onClick={()=>{ setPrefs(p=>({...p,[key]:!p[key]})); toast.success('Setting updated'); }}/>
                    <span style={{ position:'absolute',top:2,left:prefs[key]?18:2,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'.2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)',pointerEvents:'none' }}/>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}