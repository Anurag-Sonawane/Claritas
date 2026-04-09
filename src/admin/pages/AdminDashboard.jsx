import { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { getKpis } from '../services/analyticsMockService.js';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKpis().then(data => {
      setKpis(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading KPIs...</div>;
  }

  const cards = [
    { key: 'activeUsers', label: 'Active Users (7d)', icon: Users, color: 'var(--primary)', ...kpis.activeUsers },
    { key: 'newEnrollments', label: 'New Enrollments (30d)', icon: BookOpen, color: 'var(--secondary)', ...kpis.newEnrollments },
    { key: 'completions', label: 'Completions (30d)', icon: GraduationCap, color: 'var(--status-active)', ...kpis.completions },
    { key: 'avgTimeSpent', label: 'Avg Time Spent', icon: Clock, color: '#a855f7', ...kpis.avgTimeSpent },
    { key: 'systemErrors', label: 'System Errors', icon: AlertTriangle, color: 'var(--status-deleted)', ...kpis.systemErrors }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>KPI Dashboard</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="date-picker-mock">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <button className="btn-outline btn-sm">Export Report</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}><Users size={16} /> Invite User</button>
        <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}><BookOpen size={16} /> Create Course</button>
        <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}><AlertTriangle size={16} /> View Alerts</button>
        <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}><ArrowUpRight size={16} /> New Report</button>
      </div>

      <div className="kpi-grid">
        {cards.map(card => {
          const Icon = card.icon;
          const isUp = card.trend === 'up';
          return (
            <div key={card.key} className="kpi-card surface">
              <div className="kpi-header">
                <div>
                  <h3 className="kpi-label">{card.label}</h3>
                  <div className="kpi-value">{card.current}</div>
                </div>
                <div className="kpi-icon" style={{ background: `${card.color}20`, color: card.color }}>
                  <Icon size={24} />
                </div>
              </div>
              
              <div className="kpi-chart">
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={card.data}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={card.color} 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={false}
                    />
                    <Tooltip cursor={false} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={`kpi-change ${isUp ? 'positive' : 'negative'}`}>
                {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {card.change} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>vs last period</span>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Additional full-width or half-width charts could go here, but prompt asks for specific focus on funnel/cohort in other pages */}
      <div style={{ height: 400, marginTop: 40, background: 'var(--surface)', borderRadius: 12, padding: 24, border: '1px solid var(--border)' }}>
         <h3 style={{ marginBottom: 20 }}>System Activity Overview</h3>
         <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpis.activeUsers.data}>
              <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
}
