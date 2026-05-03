// ─────────────────────────────────────────────────────────────
// OrdersPage.js
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getAll(filter ? { status: filter } : {});
      setOrders(res.data.data || []);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [filter]);

  const advance = async (id, next) => {
    try {
      await ordersAPI.updateStatus(id, { status: next });
      toast.success(`Order status → ${next}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const STATUS_NEXT = { processing: 'confirmed', confirmed: 'shipped', shipped: 'delivered' };
  const STATUS_BADGE = { processing: 'badge-warning', confirmed: 'badge-primary', shipped: 'badge-teal', delivered: 'badge-success', cancelled: 'badge-danger', pending: 'badge-gray' };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Medicine Orders</div><div className="page-subtitle">Track and manage all orders</div></div>
        <select className="form-input" style={{ width: 150 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          {['processing','confirmed','shipped','delivered','cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="stat-grid mb-3">
        {[['🛒','Total',orders.length,'#e8effe'],['⏳','Processing',orders.filter(o=>o.status==='processing').length,'#fffbeb'],['🚚','Shipped',orders.filter(o=>o.status==='shipped').length,'#e0f7fa'],['✅','Delivered',orders.filter(o=>o.status==='delivered').length,'#ecfdf5']].map(([ic,l,v,c],i) => (
          <motion.div key={l} className="stat-card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.07 }}>
            <div className="stat-icon" style={{ background:c }}>{ic}</div>
            <div className="stat-value">{v}</div>
            <div className="stat-label">{l}</div>
          </motion.div>
        ))}
      </div>
      <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}>
        <div className="card-body-0">
          {loading ? <div style={{ padding:40,textAlign:'center' }}><div className="spinner-lg" style={{ margin:'0 auto' }} /></div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Patient</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.length === 0 ? <tr><td colSpan={7} style={{ textAlign:'center',padding:32,color:'#94a3b8' }}>No orders found</td></tr>
                    : orders.map(o => (
                    <tr key={o._id}>
                      <td className="text-xs text-muted">{o.orderNumber}</td>
                      <td className="td-main">{o.patient?.name}</td>
                      <td className="text-sm" style={{ maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                        {o.items?.map(i => `${i.medicineName} ×${i.quantity}`).join(', ')}
                      </td>
                      <td className="fw-7 text-green">${parseFloat(o.totalAmount).toFixed(2)}</td>
                      <td className="text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${STATUS_BADGE[o.status]||'badge-gray'}`}>{o.status}</span></td>
                      <td>
                        <div className="flex gap-1">
                          {STATUS_NEXT[o.status] && ['admin','pharmacist'].includes(user?.role) && (
                            <button className="btn btn-success btn-xs" onClick={() => advance(o._id, STATUS_NEXT[o.status])}>
                              {STATUS_NEXT[o.status]} →
                            </button>
                          )}
                          <button className="btn btn-outline btn-xs">Details</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default OrdersPage;