import { useState, useEffect } from 'react';
import { CheckCircle, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function Fees() {
  const [feeRecords, setFeeRecords] = useState([]);
  const [paying, setPaying] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchFees = async () => {
    try {
      const data = await api.getStudentFees();
      setFeeRecords(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      console.warn('Fees fetch error:', err);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const activeRecord = feeRecords.find(f => f.status !== 'Paid') || feeRecords[0] || null;
  const totalDues = activeRecord ? Math.max(0, (activeRecord.tuition_fee + (activeRecord.lab_fee || 0)) - (activeRecord.paid_amount || 0)) : 0;
  const isPaid = !activeRecord || activeRecord.status === 'Paid' || totalDues <= 0;

  const handlePay = async () => {
    if (!activeRecord) return;
    setPaying(true);
    setStatusMsg('');
    try {
      await api.payStudentFees(activeRecord.id);
      setStatusMsg('Payment successful! Your fee statement has been cleared.');
      await fetchFees();
    } catch (err) {
      alert('Payment failed: ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: 'var(--secondary)' }}>Fees & Tuition Portal</h1>
      <p className="text-muted">Manage your tuition records and online payments with SQLite persistence.</p>

      {statusMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 8, color: '#10b981', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} /> {statusMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="surface glow-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            Current Semester Dues ({activeRecord?.semester || 'Fall 2026'})
          </h3>
          <div style={{ margin: '2rem 0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: isPaid ? '#10b981' : 'var(--primary)' }}>
              ${isPaid ? '0.00' : totalDues.toFixed(2)}
            </div>
            <p className="text-muted">
              {isPaid ? 'All clear! No pending payments.' : `Due Date: ${activeRecord?.due_date || '2026-08-15'}`}
            </p>
          </div>
          {!isPaid ? (
            <button className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={handlePay} disabled={paying}>
              {paying ? 'Processing Payment...' : 'Pay Total Dues Online'}
            </button>
          ) : (
            <button className="btn-secondary" style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled>
              <CheckCircle2 size={18} color="#10b981" /> Fee Statement Cleared
            </button>
          )}
        </div>

        <div className="surface" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Active Scholarships & Grants</h3>
          <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle color="#2EC4F1" />
              <div>
                <div style={{ fontWeight: '600' }}>Merit Base Grant 2026</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Covers 50% Tuition • Approved</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Clock color="#FF5A36" />
              <div>
                <div style={{ fontWeight: '600' }}>Research Fellowship Program</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>Pending committee review</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CreditCard color="var(--primary)" /> Payment Statement History
      </h2>
      <div className="surface">
        {feeRecords.length > 0 ? (
          feeRecords.map((rec) => {
            const billTotal = (rec.tuition_fee || 0) + (rec.lab_fee || 0);
            const billPaid = rec.status === 'Paid' || (rec.paid_amount >= billTotal);
            return (
              <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>{rec.semester} Tuition & Lab Fees</h4>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Tuition: ${rec.tuition_fee} • Lab: ${rec.lab_fee || 0} • Due: {rec.due_date}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>${billTotal.toFixed(2)}</div>
                  <span style={{ fontSize: '0.85rem', color: billPaid ? '#10b981' : 'var(--primary)', fontWeight: 'bold' }}>
                    {billPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '1rem 0', color: 'var(--muted)' }}>No fee records found.</div>
        )}
      </div>
    </div>
  );
}
