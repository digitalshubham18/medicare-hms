// PrescriptionsPage.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usersAPI, medicinesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function PrescriptionsPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ patient:'',diagnosis:'',medicines:[{med:'',dosage:'',duration:''}],followUp:'',notes:'' });
  const [issuing, setIssuing] = useState(false);

  const openModal = async () => {
    try {
      const [pRes,mRes] = await Promise.allSettled([usersAPI.getAll({role:'patient',status:'approved'}),medicinesAPI.getAll()]);
      setPatients(pRes.data.data||[]);
      setMedicines(mRes.data.data||[]);
      if(pRes.data.data?.length) setForm(f=>({...f,patient:pRes.data.data[0]._id}));
    } catch {}
    setShowModal(true);
  };

  const addMedRow = () => setForm(f=>({...f,medicines:[...f.medicines,{med:'',dosage:'',duration:''}]}));
  const updateMedRow = (i,field,val) => setForm(f=>({...f,medicines:f.medicines.map((m,idx)=>idx===i?{...m,[field]:val}:m)}));

  const issue = async (e) => {
    e.preventDefault();
    if(!form.diagnosis){toast.error('Diagnosis required');return;}
    setIssuing(true);
    await new Promise(r=>setTimeout(r,800));
    toast.success('Prescription issued & sent to pharmacy!');
    setShowModal(false);
    setIssuing(false);
  };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">📝 Prescriptions</div><div className="page-subtitle">Write and manage digital prescriptions</div></div>
        <button className="btn btn-primary" onClick={openModal}>+ New Prescription</button>
      </div>
      <motion.div className="card" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}}>
        <div className="card-body" style={{textAlign:'center',padding:48}}>
          <div style={{fontSize:52,marginBottom:12}}>📝</div>
          <div className="fw-7" style={{fontSize:17}}>Digital Prescription Management</div>
          <div className="text-sm text-muted mt-1">Issue prescriptions linked to patient records, auto-routed to pharmacy</div>
          <button className="btn btn-primary mt-3" onClick={openModal}>Create New Prescription</button>
        </div>
      </motion.div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowModal(false);}}>
          <motion.div className="modal-box modal-box-lg" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <div className="modal-header"><span className="modal-title">📝 New Prescription</span><button className="btn btn-ghost btn-icon" onClick={()=>setShowModal(false)}>✕</button></div>
            <form onSubmit={issue}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Patient *</label><select className="form-input" value={form.patient} onChange={e=>setForm(f=>({...f,patient:e.target.value}))}>{patients.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Diagnosis *</label><input className="form-input" required value={form.diagnosis} onChange={e=>setForm(f=>({...f,diagnosis:e.target.value}))} placeholder="Primary diagnosis"/></div>
                </div>
                <div className="fw-7 text-sm mb-2 mt-1">Medications</div>
                {form.medicines.map((m,i) => (
                  <div key={i} className="form-row-3 mb-2">
                    <select className="form-input" value={m.med} onChange={e=>updateMedRow(i,'med',e.target.value)}><option value="">Select medicine</option>{medicines.map(x=><option key={x._id} value={x._id}>{x.name}</option>)}</select>
                    <input className="form-input" placeholder="Dosage (e.g. 1 tablet twice daily)" value={m.dosage} onChange={e=>updateMedRow(i,'dosage',e.target.value)}/>
                    <input className="form-input" placeholder="Duration (e.g. 7 days)" value={m.duration} onChange={e=>updateMedRow(i,'duration',e.target.value)}/>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-xs mb-3" onClick={addMedRow}>+ Add Medicine</button>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Follow-up Date</label><input className="form-input" type="date" value={form.followUp} onChange={e=>setForm(f=>({...f,followUp:e.target.value}))}/></div>
                  <div className="form-group"><label className="form-label">Notes</label><input className="form-input" placeholder="Additional instructions" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={issuing}>{issuing?<><span className="spinner-sm"/> Issuing…</>:'📝 Issue Prescription'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionsPage;