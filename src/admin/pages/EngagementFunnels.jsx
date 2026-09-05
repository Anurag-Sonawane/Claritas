/* eslint-disable react-hooks/static-components */
 
 
 
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Filter, Users } from 'lucide-react';
import { getFunnel } from '../services/analyticsMockService.js';
import './AdminDashboard.css'; // Reuse basic layout styles

export default function EngagementFunnels() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFunnel().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { stage, users } = payload[0].payload;
      return (
        <div style={{ background: 'var(--surface)', padding: 12, border: '1px solid var(--border)', borderRadius: 8, zIndex: 10 }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--foreground)' }}>{stage}</p>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Users: <strong style={{ color: 'var(--foreground)' }}>{users}</strong></p>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--primary)', cursor: 'pointer' }}>
            Click bar to view users list →
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (entry) => {
    alert(`Mock: Drill down to user list for stage "${entry.stage}" showing ${entry.users} users.`);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading Funnel...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Course Engagement Funnel</h1>
        <div style={{ display: 'flex', gap: 12 }}>
           <button className="btn-outline btn-sm"><Filter size={14} /> Filter Course</button>
           <button className="btn-outline btn-sm">Export CSV</button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 12, border: '1px solid var(--border)', flex: 1, minHeight: 500 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, color: 'var(--muted)' }}>
          <Users size={18} /> Conversion Drop-off Analysis
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
            <XAxis type="number" stroke="var(--muted)" />
            <YAxis dataKey="stage" type="category" stroke="var(--foreground)" width={120} tick={{ fill: 'var(--foreground)' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="users" radius={[0, 4, 4, 0]} onClick={handleBarClick}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
