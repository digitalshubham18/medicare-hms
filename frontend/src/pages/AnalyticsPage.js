import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const OPTS = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,.04)' } } } };

export default function AnalyticsPage() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];

  const revenueData = { labels: months, datasets: [{ label: 'Revenue', data: [35000,38000,42000,39000,45000,48290], borderColor: '#059669', backgroundColor: 'rgba(5,150,105,.07)', fill: true, tension: .4, borderWidth: 2, pointBackgroundColor: '#059669', pointRadius: 4 }] };
  const patientsData = { labels: months, datasets: [{ label: 'New Patients', data: [12,18,15,22,19,25], backgroundColor: 'rgba(22,72,201,.75)', borderRadius: 7 }] };
  const deptData = { labels: ['Cardiology','Neurology','Orthopedics','General','Pediatrics'], datasets: [{ data: [45,32,28,68,41], backgroundColor: ['#1648c9','#0891b2','#059669','#d97706','#7c3aed'], borderRadius: 7 }] };
  const salesData = { labels: ['Pain Relief','Antibiotics','Cardiac','Diabetes','Supplements'], datasets: [{ data: [30,25,20,15,10], backgroundColor: ['#dc2626','#0891b2','#1648c9','#d97706','#059669'], borderWidth: 2, borderColor: '#fff' }] };

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">📈 Analytics & Reports</div><div className="page-subtitle">Hospital performance insights</div></div>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>📥 Export PDF</button>
      </div>
      <div className="stat-grid">
        {[['💰','Total Revenue','$48,290','↑ 18%','#ecfdf5'],['⏱','Avg Wait Time','12 min','↓ 3 min','#e8effe'],['⭐','Satisfaction','94%','↑ 2%','#fffbeb'],['🏥','Bed Occupancy','76%','↑ 5%','#fef2f2']].map(([ic,l,v,c,bg],i) => (
          <motion.div key={l} className="stat-card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.07 }}>
            <div className="stat-icon" style={{ background:bg }}>{ic}</div>
            <div className="stat-value" style={{ fontSize:20 }}>{v}</div>
            <div className="stat-label">{l}</div>
            <div className="stat-change up">{c} this month</div>
          </motion.div>
        ))}
      </div>
      <div className="grid-2 mt-2">
        {[
          ['💰 Monthly Revenue', revenueData, 'line', { ...OPTS, scales: { x:{ grid:{display:false} }, y:{ beginAtZero:false, ticks:{ callback:v=>'$'+Math.round(v/1000)+'k' }, grid:{color:'rgba(0,0,0,.04)'} } } }],
          ['👥 New Patient Registrations', patientsData, 'bar', OPTS],
        ].map(([title, data, type, opts], i) => (
          <motion.div key={title} className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2+i*.1 }}>
            <div className="card-header"><span className="card-title">{title}</span></div>
            <div className="card-body">
              <div style={{ height:195,position:'relative' }}>
                {type === 'line' ? <Line data={data} options={opts} /> : <Bar data={data} options={opts} />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid-2 mt-2">
        <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.4 }}>
          <div className="card-header"><span className="card-title">🏥 Department Performance</span></div>
          <div className="card-body">
            <div style={{ height:195,position:'relative' }}>
              <Bar data={deptData} options={OPTS} />
            </div>
          </div>
        </motion.div>
        <motion.div className="card" initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }}>
          <div className="card-header"><span className="card-title">💊 Medicine Sales by Category</span></div>
          <div className="card-body">
            <div style={{ height:195,position:'relative' }}>
              <Doughnut data={salesData} options={{ responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{ legend:{ position:'right',labels:{ font:{size:11},boxWidth:10,padding:6 } } } }} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}