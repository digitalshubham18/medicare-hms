import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DIET_TYPES = ['Regular','Soft','Liquid','Low Salt','Low Fat','Diabetic','High Protein','High Calorie','Renal','Vegetarian','Vegan','Gluten-Free'];
const MEAL_TIMES = ['Breakfast 7:30 AM','Morning Snack 10:00 AM','Lunch 12:30 PM','Evening Snack 4:00 PM','Dinner 7:30 PM','Bedtime Snack 9:00 PM'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MEAL_PLANS = {
  Regular:      { breakfast:'Idli, Sambar, Chutney, Milk','Morning Snack':'Fruit (1 pc)','lunch':'Rice, Dal, Sabzi, Curd, Salad', 'Evening Snack':'Tea, Biscuit', dinner:'Chapati, Sabzi, Dal, Salad' },
  Diabetic:     { breakfast:'Oats, Egg White Omelette, Green Tea','Morning Snack':'Cucumber slices','lunch':'Brown Rice, Grilled Chicken, Salad','Evening Snack':'Buttermilk, Nuts', dinner:'Multigrain Chapati, Paneer Sabzi, Dal' },
  'Low Salt':   { breakfast:'Unsalted Upma, Banana, Milk','Morning Snack':'Apple','lunch':'Plain Rice, Boiled Dal, Sabzi (no salt)', 'Evening Snack':'Coconut water', dinner:'Chapati, Boiled vegetables' },
  'High Protein':{ breakfast:'Egg omelette, Brown bread, Milk','Morning Snack':'Protein shake','lunch':'Rice, Chicken curry, Dal, Curd','Evening Snack':'Boiled eggs, Milk',dinner:'Chapati, Paneer, Chicken, Salad' },
};

export default function DietNutritionPage() {
  const { user } = useAuth();
  const isAdmin  = ['admin','nurse','doctor'].includes(user?.role);
  const isPatient = user?.role === 'patient';

  const [plans,     setPlans]     = useState([]);
  const [patients,  setPatients]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewPlan,  setViewPlan]  = useState(null);
  const [form, setForm] = useState({ patient:'', dietType:'Regular', allergies:'', conditions:'', notes:'', startDate: new Date().toISOString().split('T')[0], duration:'7 days' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const saved = JSON.parse(localStorage.getItem('hms_dietplans') || '[]');
      setPlans(saved);
    } catch { setPlans([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = async () => {
    setShowModal(true);
    try {
      const res = await usersAPI.getAll({ role:'patient', status:'approved', limit:200 });
      const list = res?.data?.data || [];
      setPatients(list);
      setForm(f => ({ ...f, patient: list[0]?._id || '' }));
    } catch { toast.error('Could not load patients'); }
  };

  const savePlan = (e) => {
    e.preventDefault();
    if (!form.patient) { toast.error('Select a patient'); return; }
    const patObj = patients.find(p => p._id === form.patient);
    const plan = {
      id: String(Date.now()),
      ...form,
      patientName: patObj?.name || '',
      doctorName: user?.name,
      createdAt: new Date().toISOString(),
      mealPlan: MEAL_PLANS[form.dietType] || MEAL_PLANS.Regular,
    };
    const updated = [plan, ...plans];
    setPlans(updated);
    localStorage.setItem('hms_dietplans', JSON.stringify(updated));
    toast.success(`✅ Diet plan assigned to ${patObj?.name}`);
    setShowModal(false);
  };

  const deletePlan = (id) => {
    if (!window.confirm('Delete this diet plan?')) return;
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    localStorage.setItem('hms_dietplans', JSON.stringify(updated));
    toast.success('Diet plan deleted');
    if (viewPlan?.id === id) setViewPlan(null);
  };

  const myPlans = isPatient ? plans.filter(p => p.patient === (user?._id || user?.id)) : plans;

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:900, color:'#0f172a' }}>🥗 Diet &amp; Nutrition</div>
          <div style={{ fontSize:13, color:'#94a3b8', marginTop:3 }}>
            {isPatient ? 'Your personalised meal plan' : 'Assign and manage patient diet plans'}
          </div>
        </div>
        {isAdmin && (
          <button onClick={openModal}
            style={{ padding:'10px 22px', background:'linear-gradient(135deg,#059669,#047857)', border:'none', borderRadius:11, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>
            + Assign Diet Plan
          </button>
        )}
      </div>

      {/* Diet type legend */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {DIET_TYPES.slice(0,8).map(dt => (
          <span key={dt} style={{ padding:'5px 12px', background:'#f1f5f9', borderRadius:8, fontSize:12, fontWeight:600, color:'#475569' }}>{dt}</span>
        ))}
        <span style={{ padding:'5px 12px', background:'#f1f5f9', borderRadius:8, fontSize:12, color:'#94a3b8' }}>+{DIET_TYPES.length - 8} more</span>
      </div>

      {/* Plan list */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><div className="spinner-lg" /></div>
      ) : myPlans.length === 0 ? (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'52px', textAlign:'center' }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🥗</div>
          <div style={{ fontWeight:700, fontSize:16, color:'#0f172a', marginBottom:6 }}>No diet plans yet</div>
          {isAdmin && <button onClick={openModal} style={{ marginTop:8, padding:'9px 20px', background:'linear-gradient(135deg,#059669,#047857)', border:'none', borderRadius:10, color:'#fff', fontWeight:700, cursor:'pointer' }}>Create First Plan</button>}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {myPlans.map(plan => (
            <motion.div key={plan.id} whileHover={{ y:-2 }}
              style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'18px', cursor:'pointer' }}
              onClick={() => setViewPlan(plan)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🥗</div>
                <span style={{ padding:'4px 10px', background:'#dcfce7', color:'#15803d', borderRadius:9, fontSize:11.5, fontWeight:700 }}>{plan.dietType}</span>
              </div>
              <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:3 }}>{plan.patientName}</div>
              <div style={{ fontSize:12.5, color:'#64748b', marginBottom:6 }}>
                Start: {new Date(plan.startDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · {plan.duration}
              </div>
              {plan.allergies && <div style={{ fontSize:12, color:'#dc2626', marginBottom:4 }}>⚠️ Allergies: {plan.allergies}</div>}
              <div style={{ fontSize:12, color:'#94a3b8' }}>Assigned by Dr. {plan.doctorName}</div>
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); deletePlan(plan.id); }}
                  style={{ marginTop:10, padding:'5px 12px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, color:'#dc2626', fontWeight:700, fontSize:12, cursor:'pointer', width:'100%' }}>
                  🗑 Delete Plan
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div initial={{ scale:.96 }} animate={{ scale:1 }} exit={{ scale:.96 }} onClick={e => e.stopPropagation()}
              style={{ background:'#fff', borderRadius:20, padding:'26px', width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
              <h3 style={{ margin:'0 0 20px', fontWeight:900, fontSize:18, color:'#0f172a' }}>🥗 Assign Diet Plan</h3>
              <form onSubmit={savePlan} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Patient *</label>
                  <select value={form.patient} onChange={e => setForm(f=>({...f,patient:e.target.value}))}
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }}>
                    <option value="">— Select patient —</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Diet Type *</label>
                    <select value={form.dietType} onChange={e => setForm(f=>({...f,dietType:e.target.value}))}
                      style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }}>
                      {DIET_TYPES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Duration</label>
                    <select value={form.duration} onChange={e => setForm(f=>({...f,duration:e.target.value}))}
                      style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }}>
                      {['3 days','5 days','7 days','10 days','14 days','1 month','Ongoing'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))}
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Food Allergies / Restrictions</label>
                  <input value={form.allergies} onChange={e => setForm(f=>({...f,allergies:e.target.value}))} placeholder="e.g. Nuts, Shellfish, Dairy"
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Medical Conditions</label>
                  <input value={form.conditions} onChange={e => setForm(f=>({...f,conditions:e.target.value}))} placeholder="e.g. Diabetes, Hypertension, CKD"
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase' }}>Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={2}
                    placeholder="Special instructions for the dietary team…"
                    style={{ width:'100%', padding:'10px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13.5, outline:'none', resize:'vertical', fontFamily:'inherit' }} />
                </div>
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding:'10px 20px', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:9, fontWeight:600, cursor:'pointer', color:'#475569' }}>Cancel</button>
                  <button type="submit" style={{ padding:'10px 22px', background:'linear-gradient(135deg,#059669,#047857)', border:'none', borderRadius:9, color:'#fff', fontWeight:700, cursor:'pointer' }}>✅ Assign Plan</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Plan Modal */}
      <AnimatePresence>
        {viewPlan && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
            onClick={() => setViewPlan(null)}>
            <motion.div initial={{ scale:.96 }} animate={{ scale:1 }} exit={{ scale:.96 }} onClick={e => e.stopPropagation()}
              style={{ background:'#fff', borderRadius:20, padding:'26px', width:'100%', maxWidth:600, maxHeight:'92vh', overflowY:'auto' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:18 }}>
                <div>
                  <h3 style={{ margin:0, fontWeight:900, fontSize:18, color:'#0f172a' }}>{viewPlan.patientName}'s Diet Plan</h3>
                  <div style={{ fontSize:12.5, color:'#94a3b8', marginTop:3 }}>{viewPlan.dietType} · {viewPlan.duration} · Dr. {viewPlan.doctorName}</div>
                </div>
                <button onClick={() => setViewPlan(null)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#94a3b8' }}>✕</button>
              </div>
              {viewPlan.allergies && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#dc2626', fontWeight:600 }}>⚠️ Allergies: {viewPlan.allergies}</div>}
              {viewPlan.conditions && <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:13, color:'#92400e', fontWeight:600 }}>🏥 Conditions: {viewPlan.conditions}</div>}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontWeight:800, fontSize:14, color:'#0f172a', marginBottom:12 }}>📅 Daily Meal Schedule</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {Object.entries(viewPlan.mealPlan || {}).map(([meal,items]) => (
                    <div key={meal} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', background:'#f8fafc', borderRadius:11, border:'1px solid #e2e8f0' }}>
                      <div style={{ fontWeight:700, fontSize:13, color:'#0f172a', minWidth:130, textTransform:'capitalize' }}>{meal.replace(/([A-Z])/g,' $1')}</div>
                      <div style={{ fontSize:13, color:'#64748b' }}>{items}</div>
                    </div>
                  ))}
                </div>
              </div>
              {viewPlan.notes && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#15803d' }}><strong>Notes:</strong> {viewPlan.notes}</div>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
